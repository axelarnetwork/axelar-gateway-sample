import "dotenv/config";
import { EvmChain } from "@axelar-network/axelarjs-sdk";
import { ethers } from "ethers";
import erc20Abi from "./abi/erc20.json";
import batchMessageSenderAbi from "./abi/batchMessageSender.json";
import { evmWallet } from "./wallet";

// Config your own here.
const provider = new ethers.providers.JsonRpcProvider(
  "https://api.avax-test.network/ext/bc/C/rpc"
);
const ustAmount = ethers.utils.parseUnits("10", 6).toString();
const lunaAmount = ethers.utils.parseUnits("1", 5).toString();
const batchMessageSenderContractAddress =
  "0x06b0740e9bB86f7ACA9ec8f5a81f4c13900d9C0b";
const moonbeamExecutorContractAddress =
  "0x9d71b2bA8a9359f24A0e0d43C29d654e47a98Ca6";
const ethereumExecutorContractAddress =
  "0xB628ff5b78bC8473a11299d78f2089380f4B1939";
const ust = "UST";
const luna = "LUNA";
const ustAddress = "0x96640d770bf4a15Fb8ff7ae193F3616425B15FFE";
const lunaAddress = "0xf640B78954f09673A01e9AEFd11c353DDE3c8D6B";

function getBalance(address: string) {
  const contract = new ethers.Contract(address, erc20Abi, provider);
  return contract.balanceOf(evmWallet.address);
}

async function isRequireApprove(address: string) {
  const contract = new ethers.Contract(address, erc20Abi, provider);
  const allowance: ethers.BigNumber = await contract.allowance(
    evmWallet.address,
    batchMessageSenderContractAddress
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
    batchMessageSenderContractAddress,
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
  const ustBalance = await getBalance(ustAddress);
  console.log(ethers.utils.formatUnits(ustBalance, 6), ust);
  const lunaBalance = await getBalance(lunaAddress);
  console.log(ethers.utils.formatUnits(lunaBalance, 6), luna);

  // Approve tokens to Gateway Contract
  await approveAll([
    { address: ustAddress, name: ust },
    { address: lunaAddress, name: luna },
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
      ethereumExecutorContractAddress,
      payloadDistributionExecutor,
      ust,
      ustAmount,
    ]
  );
  const payloadBatchMessageSenderMoonbeam = encoder.encode(
    ["string", "string", "bytes", "string", "uint256"],
    [
      EvmChain.MOONBEAM,
      moonbeamExecutorContractAddress,
      payloadDistributionExecutor,
      luna,
      lunaAmount,
    ]
  );
  const contract = new ethers.Contract(
    batchMessageSenderContractAddress,
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
