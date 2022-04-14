// Initial state: 10 UST on Avalanche Fuji Testnet
// Goal: 10 UST on Ethereum Ropsten

import "dotenv/config";
import {
  AxelarGateway,
  Environment,
  EvmChain,
} from "@axelar-network/axelarjs-sdk";
import { DISTRIBUTION_EXECUTOR, GATEWAY, TOKEN } from "./constants/address";
import { EXPLORER_TX } from "./constants/endpoint";
import { ethers } from "ethers";
import { evmWallet } from "./wallet";
import { getProvider } from "./providers";
import { approveAll, getBalance } from "./utils/token";

// Config your own here.
const srcChain = EvmChain.AVALANCHE;
const destChain = EvmChain.MOONBEAM;
const transferToken = "UST";
const transferAmount = ethers.utils.parseUnits("50", 6).toString();

const provider = getProvider(srcChain);
const gateway = AxelarGateway.create(Environment.TESTNET, srcChain, provider);

(async () => {
  console.log(gateway.getContract().address);
  console.log(`==== Your ${transferToken} balance on ${srcChain} ==== `);
  const tokenBalance = await getBalance(
    TOKEN[srcChain][transferToken],
    srcChain
  );
  console.log(ethers.utils.formatUnits(tokenBalance, 6), transferToken);

  // Approve token to Gateway Contract if needed
  await approveAll(
    [{ address: TOKEN[srcChain][transferToken], name: transferToken }],
    GATEWAY[srcChain],
    srcChain
  );

  console.log(
    `\n==== Sending ${ethers.utils.formatUnits(
      transferAmount,
      6
    )} ${transferToken} from ${srcChain} to ${destChain} ====`
  );
  const encoder = ethers.utils.defaultAbiCoder;
  const payload = encoder.encode(["address[]"], [[evmWallet.address]]);
  const callContractReceipt = await gateway
    .createCallContractWithTokenTx({
      destinationChain: destChain,
      destinationContractAddress: DISTRIBUTION_EXECUTOR[destChain],
      payload,
      amount: transferAmount,
      symbol: transferToken,
    })
    .then((tx) => tx.send(evmWallet.connect(provider)))
    .then((tx) => tx.wait());

  console.log(
    "Call contract with token tx:",
    `${EXPLORER_TX[srcChain]}${callContractReceipt.transactionHash}`
  );
})();
