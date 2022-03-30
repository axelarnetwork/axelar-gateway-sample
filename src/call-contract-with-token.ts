// Initial state: 10 UST on Avalanche Fuji Testnet
// Goal: 10 UST on Ethereum Ropsten

import "dotenv/config";
import {
  AxelarGateway,
  Environment,
  EvmChain,
} from "@axelar-network/axelarjs-sdk";
import { ethers } from "ethers";
import erc20Abi from "./abi/erc20.json";
import { evmWallet } from "./wallet";
import { DISTRIBUTION_EXECUTOR, TOKEN } from "./constants/address";
import { RPC_ENDPOINT } from "./constants/endpoint";

// Config your own here.
const provider = new ethers.providers.JsonRpcProvider(
  RPC_ENDPOINT[EvmChain.AVALANCHE]
);
const amount = ethers.utils.parseUnits("10", 6).toString();
const tokenSymbol = "UST";
const gateway = AxelarGateway.create(
  Environment.DEVNET,
  EvmChain.AVALANCHE,
  provider
);

function getBalance(address: string) {
  const contract = new ethers.Contract(address, erc20Abi, provider);
  return contract.balanceOf(evmWallet.address);
}

async function isRequireApprove(address: string) {
  const contract = new ethers.Contract(address, erc20Abi, provider);
  const allowance: ethers.BigNumber = await contract.allowance(
    evmWallet.address,
    gateway.getContract().address
  );
  return allowance.isZero();
}

(async () => {
  console.log(`==== Your ${tokenSymbol} balance ==== `);
  const tokenBalance = await getBalance(TOKEN[EvmChain.AVALANCHE][tokenSymbol]);
  console.log(ethers.utils.formatUnits(tokenBalance, 6), tokenSymbol);

  // Approve token to Gateway Contract
  const requiredApprove = await isRequireApprove(
    TOKEN[EvmChain.AVALANCHE][tokenSymbol]
  );
  if (requiredApprove) {
    console.log(`\n==== Approving ${tokenSymbol}... ====`);
    const receipt = await gateway
      .createApproveTx({ tokenAddress: TOKEN[EvmChain.AVALANCHE][tokenSymbol] })
      .then((tx) => tx.send(evmWallet))
      .then((tx) => tx.wait());
    console.log(
      `${tokenSymbol} has been approved to gateway contract`,
      receipt.transactionHash
    );
  }

  console.log("\n==== Call contract with token ====");
  const encoder = ethers.utils.defaultAbiCoder;
  const payload = encoder.encode(["address[]"], [evmWallet.address]);
  const callContractReceipt = await gateway
    .createCallContractWithTokenTx({
      destinationChain: EvmChain.ETHEREUM,
      destinationContractAddress: DISTRIBUTION_EXECUTOR[EvmChain.ETHEREUM],
      payload,
      amount,
      symbol: tokenSymbol,
    })
    .then((tx) => tx.send(evmWallet.connect(provider)))
    .then((tx) => tx.wait());

  console.log(
    "Call contract with token tx:",
    `https://testnet.snowtrace.io/tx/${callContractReceipt.transactionHash}`
  );
})();
