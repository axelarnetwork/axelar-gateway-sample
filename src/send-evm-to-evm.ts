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
import { DISTRIBUTION_EXECUTOR, GATEWAY, TOKEN } from "./constants/address";
import { getProvider } from "./providers";
import { approveAll, getBalance } from "./utils/token";
import { EXPLORER_TX } from "./constants/endpoint";

// Config your own here.
const chain = EvmChain.MOONBEAM;
const destChain = EvmChain.AVALANCHE;
const provider = getProvider(chain);
const amount = ethers.utils.parseUnits("5", 6).toString();
const tokenSymbol = "UST";
const gateway = AxelarGateway.create(Environment.DEVNET, chain, provider);

(async () => {
  gateway.getContract().interface.functions;
  console.log(`==== Your ${tokenSymbol} balance ==== `);
  const tokenBalance = await getBalance(TOKEN[chain][tokenSymbol], chain);
  console.log(ethers.utils.formatUnits(tokenBalance, 6), tokenSymbol);

  // Approve token to Gateway Contract if needed
  await approveAll(
    [{ address: TOKEN[chain][tokenSymbol], name: tokenSymbol }],
    GATEWAY[chain],
    chain
  );

  console.log("\n==== Call contract with token ====");
  const encoder = ethers.utils.defaultAbiCoder;
  const payload = encoder.encode(["address[]"], [[evmWallet.address]]);
  const callContractReceipt = await gateway
    .createCallContractWithTokenTx({
      destinationChain: destChain,
      destinationContractAddress: DISTRIBUTION_EXECUTOR[destChain],
      payload,
      amount,
      symbol: tokenSymbol,
    })
    .then((tx) => tx.send(evmWallet.connect(provider)))
    .then((tx) => tx.wait());

  console.log(
    "Call contract with token tx:",
    `${EXPLORER_TX[chain]}${callContractReceipt.transactionHash}`
  );
})();
