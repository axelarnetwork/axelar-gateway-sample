// Initial state: 10 UST on Avalanche Fuji Testnet
// Goal: 10 UST on Ethereum Ropsten

import "dotenv/config";
import {
  AxelarGateway,
  Environment,
  EvmChain,
} from "@axelar-network/axelarjs-sdk";
import { ethers } from "ethers";
import { evmWallet } from "./wallet";
import { DISTRIBUTION_EXECUTOR, TOKEN } from "./constants/address";
import { getProvider } from "./providers";
import { getBalance, isRequireApprove } from "./utils/token";

// Config your own here.
const chain = EvmChain.AVALANCHE;
const provider = getProvider(chain);
const amount = ethers.utils.parseUnits("10", 6).toString();
const tokenSymbol = "UST";
const gateway = AxelarGateway.create(Environment.DEVNET, chain, provider);

(async () => {
  console.log(`==== Your ${tokenSymbol} balance ==== `);
  const tokenBalance = await getBalance(TOKEN[chain][tokenSymbol], chain);
  console.log(ethers.utils.formatUnits(tokenBalance, 6), tokenSymbol);

  // Approve token to Gateway Contract if needed
  const requiredApprove = await isRequireApprove(
    TOKEN[EvmChain.AVALANCHE][tokenSymbol],
    chain
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
