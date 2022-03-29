import "dotenv/config";
import { EvmChain } from "@axelar-network/axelarjs-sdk";
import { ethers } from "ethers";
import erc20Abi from "./abi/erc20.json";
import batchMessageSenderAbi from "./abi/batchMessageSender.json";
import { evmWallet } from "./wallet";
import {
  BATCH_MESSAGE_SENDER,
  DISTRIBUTION_EXECUTOR,
  TOKEN,
} from "./constants/address";

// Config your own here.
const provider = new ethers.providers.JsonRpcProvider(
  "https://api.avax-test.network/ext/bc/C/rpc"
);
const ustAmount = ethers.utils.parseUnits("10", 6).toString();
const lunaAmount = ethers.utils.parseUnits("1", 5).toString();
const ust = "UST";
const luna = "LUNA";

function getBalance(address: string) {
  const contract = new ethers.Contract(address, erc20Abi, provider);
  return contract.balanceOf(evmWallet.address);
}

async function isRequireApprove(address: string) {
  const contract = new ethers.Contract(address, erc20Abi, provider);
  const allowance: ethers.BigNumber = await contract.allowance(
    evmWallet.address,
    BATCH_MESSAGE_SENDER[EvmChain.AVALANCHE]
  );
  return allowance.isZero();
}

async function approve(tokenAddress: string) {
  const contract = new ethers.Contract(
    tokenAddress,
    erc20Abi,
    evmWallet.connect(provider)
  );
  return contract.approve(
    BATCH_MESSAGE_SENDER[EvmChain.AVALANCHE],
    ethers.constants.MaxUint256
  );
}

async function approveAll(tokens: { address: string; name: string }[]) {
  for (const token of tokens) {
    const requiredApprove = await isRequireApprove(token.address);
    if (requiredApprove) {
      console.log(`\n==== Approving ${token.name}... ====`);
      const receipt = await approve(token.address).then((tx) => tx.wait());
      console.log(
        `${token.name} has been approved to BatchMessageSender`,
        receipt.transactionHash
      );
    }
  }
}

(async () => {
  console.log(`==== Your balance ==== `);
  const ustBalance = await getBalance(TOKEN.UST);
  console.log(ethers.utils.formatUnits(ustBalance, 6), ust);
  const lunaBalance = await getBalance(TOKEN.LUNA);
  console.log(ethers.utils.formatUnits(lunaBalance, 6), luna);

  // Approve tokens to Gateway Contract
  await approveAll([
    { address: TOKEN.UST, name: ust },
    { address: TOKEN.LUNA, name: luna },
  ]);

  console.log("\n==== Call contract with token ====");
  const encoder = ethers.utils.defaultAbiCoder;
  const payloadDistributionExecutor = encoder.encode(
    ["address[]"],
    [[evmWallet.address]]
  );
  const payloadBatchMessageSenderEth = encoder.encode(
    ["string", "string", "bytes", "string", "uint256"],
    [
      EvmChain.ETHEREUM,
      DISTRIBUTION_EXECUTOR[EvmChain.ETHEREUM],
      payloadDistributionExecutor,
      ust,
      ustAmount,
    ]
  );
  const payloadBatchMessageSenderMoonbeam = encoder.encode(
    ["string", "string", "bytes", "string", "uint256"],
    [
      EvmChain.MOONBEAM,
      DISTRIBUTION_EXECUTOR[EvmChain.MOONBEAM],
      payloadDistributionExecutor,
      luna,
      lunaAmount,
    ]
  );
  const contract = new ethers.Contract(
    BATCH_MESSAGE_SENDER[EvmChain.AVALANCHE],
    batchMessageSenderAbi,
    evmWallet.connect(provider)
  );
  const receipt = await contract
    .batchCallContractWithToken([
      payloadBatchMessageSenderEth,
      payloadBatchMessageSenderMoonbeam,
    ])
    .then((tx) => tx.wait());

  console.log(
    "Call contract with token tx:",
    `https://testnet.snowtrace.io/tx/${receipt.transactionHash}`
  );
})();
