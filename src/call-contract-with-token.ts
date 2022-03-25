import "dotenv/config";
import {
  AxelarGateway,
  Environment,
  EvmChain,
} from "@axelar-network/axelarjs-sdk";
import { ethers } from "ethers";
import erc20Abi from "./abi/erc20.json";

const UST_ADDRESS_AVALANCHE = "0x96640d770bf4a15Fb8ff7ae193F3616425B15FFE";
const privateKey = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(
  "https://api.avax-test.network/ext/bc/C/rpc"
);
const amount = ethers.utils.parseUnits("10", 6).toString();
const evmWallet = new ethers.Wallet(privateKey, provider);

function getBalance(address: string) {
  const contract = new ethers.Contract(address, erc20Abi, provider);
  return contract.balanceOf(evmWallet.address);
}

(async () => {
  const gateway = AxelarGateway.create(
    Environment.DEVNET,
    EvmChain.AVALANCHE,
    provider
  );
  console.log("==== Your UST balance ==== ");
  const ustBalance = await getBalance(UST_ADDRESS_AVALANCHE);
  console.log(ethers.utils.formatUnits(ustBalance, 6), "UST");

  // Approve UST to Gateway Contract
  console.log("\n==== Approving UST... ====");
  const receipt = await gateway
    .createApproveTx({ tokenAddress: UST_ADDRESS_AVALANCHE })
    .then((tx) => tx.send(evmWallet))
    .then((tx) => tx.wait());
  console.log(
    "UST has been approved to gateway contract",
    receipt.transactionHash
  );

  console.log("\n==== Call contract with token ====");
  const callContractReceipt = await gateway
    .createCallContractWithTokenTx({
      destinationChain: EvmChain.ETHEREUM,
      amount,
      destinationContractAddress: "0x9d71b2bA8a9359f24A0e0d43C29d654e47a98Ca6",
      payload: ethers.utils.hexZeroPad(evmWallet.address, 32),
      symbol: "UST",
    })
    .then((tx) => tx.send(evmWallet))
    .then((tx) => tx.wait());
  console.log(
    "Call contract with token tx:",
    callContractReceipt.transactionHash
  );
})();
