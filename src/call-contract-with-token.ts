import "dotenv/config";
import {
  AxelarGateway,
  Environment,
  EvmChain,
} from "@axelar-network/axelarjs-sdk";
import { ethers } from "ethers";
import erc20Abi from "./abi/erc20.json";

const AXELAR_GATEWAY_CONTRACT = "0x4ffb57aea2295d663b03810a5802ef2bc322370d";
const DISTRIBUTION_EXECUTOR_ADDRESS =
  "0xB628ff5b78bC8473a11299d78f2089380f4B1939";
const privateKey = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(
  "https://api.avax-test.network/ext/bc/C/rpc"
);
const amount = ethers.utils.parseUnits("10", 6).toString();
const evmWallet = new ethers.Wallet(privateKey, provider);
const tokenSymbol = "UST";
const tokenAddress = "0x96640d770bf4a15Fb8ff7ae193F3616425B15FFE";

function getBalance(address: string) {
  const contract = new ethers.Contract(address, erc20Abi, provider);
  return contract.balanceOf(evmWallet.address);
}

async function isRequireApprove(address: string) {
  const contract = new ethers.Contract(address, erc20Abi, provider);
  const allowance: ethers.BigNumber = await contract.allowance(
    evmWallet.address,
    AXELAR_GATEWAY_CONTRACT
  );
  return allowance.isZero();
}

(async () => {
  const gateway = AxelarGateway.create(
    Environment.DEVNET,
    EvmChain.AVALANCHE,
    provider
  );
  console.log("==== Your UST balance ==== ");
  const tokenBalance = await getBalance(tokenAddress);
  console.log(ethers.utils.formatUnits(tokenBalance, 6), tokenSymbol);

  // Approve UST to Gateway Contract
  const requiredApprove = await isRequireApprove(tokenAddress);
  if (requiredApprove) {
    console.log("\n==== Approving UST... ====");
    const receipt = await gateway
      .createApproveTx({ tokenAddress: tokenAddress })
      .then((tx) => tx.send(evmWallet))
      .then((tx) => tx.wait());
    console.log(
      "UST has been approved to gateway contract",
      receipt.transactionHash
    );
  }

  console.log("\n==== Call contract with token ====");
  const encoder = ethers.utils.defaultAbiCoder;
  const payload = encoder.encode(["address[]"], [[evmWallet.address]]);
  console.log(payload);
  const callContractReceipt = await gateway
    .createCallContractWithTokenTx({
      destinationChain: EvmChain.ETHEREUM,
      destinationContractAddress: DISTRIBUTION_EXECUTOR_ADDRESS,
      payload,
      amount,
      symbol: tokenSymbol,
    })
    .then((tx) => tx.send(evmWallet))
    .then((tx) => tx.wait());

  console.log(
    "Call contract with token tx:",
    `https://testnet.snowtrace.io/tx/${callContractReceipt.transactionHash}`
  );
})();
