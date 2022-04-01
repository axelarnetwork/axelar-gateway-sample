// Initial state: 10 UST and 0.1 LUNA on Avalanche
// Goal: 10 UST on Ethereum and 0.1 LUNA on Moonbeam in a single transaction.

import "dotenv/config";
import { EvmChain } from "@axelar-network/axelarjs-sdk";
import { ethers } from "ethers";
import batchMessageSenderAbi from "./abi/batchMessageSender.json";
import { evmWallet } from "./wallet";
import {
  BATCH_MESSAGE_SENDER,
  DISTRIBUTION_EXECUTOR,
  GATEWAY,
  TOKEN,
} from "./constants/address";
import { getProvider } from "./providers";
import { approveAll, getBalance } from "./utils/token";

// Config your own here.
const srcChain = EvmChain.AVALANCHE;
const destChainA = EvmChain.ETHEREUM;
const destChainB = EvmChain.MOONBEAM;
const transferTokenA = "UST";
const transferTokenB = "LUNA";
const transferAmountTokenA = ethers.utils.parseUnits("10", 6).toString();
const transferAmountTokenB = ethers.utils.parseUnits("1", 5).toString();

const provider = getProvider(srcChain);
const keyTokenA = transferTokenA.toUpperCase();
const keyTokenB = transferTokenB.toUpperCase();
(async () => {
  console.log(`==== Your balance on ${srcChain} ==== `);
  const balanceTokenA = await getBalance(TOKEN[srcChain][keyTokenA], srcChain);
  console.log(ethers.utils.formatUnits(balanceTokenA, 6), transferTokenA);
  const balanceTokenB = await getBalance(TOKEN[srcChain][keyTokenB], srcChain);
  console.log(ethers.utils.formatUnits(balanceTokenB, 6), transferTokenB);

  // Approve tokens to Gateway Contract
  await approveAll(
    [
      {
        address: TOKEN[srcChain][keyTokenA],
        name: transferTokenA,
      },
      {
        address: TOKEN[srcChain][keyTokenB],
        name: transferTokenB,
      },
    ],
    GATEWAY[srcChain],
    srcChain
  );

  console.log(
    `\n==== Sending ${ethers.utils.formatUnits(
      transferAmountTokenA,
      6
    )} ${transferTokenA} to ${destChainA} and ${ethers.utils.formatUnits(
      transferAmountTokenB,
      6
    )} ${transferTokenB} to ${destChainB} ====`
  );
  const encoder = ethers.utils.defaultAbiCoder;
  const payloadDistributionExecutor = encoder.encode(
    ["address[]"],
    [[evmWallet.address]]
  );
  const payloadBatchMessageSenderChainA = encoder.encode(
    ["string", "string", "bytes", "string", "uint256"],
    [
      destChainA,
      DISTRIBUTION_EXECUTOR[destChainA],
      payloadDistributionExecutor,
      transferTokenA,
      transferAmountTokenA,
    ]
  );
  const payloadBatchMessageSenderChainB = encoder.encode(
    ["string", "string", "bytes", "string", "uint256"],
    [
      destChainB,
      DISTRIBUTION_EXECUTOR[destChainB],
      payloadDistributionExecutor,
      transferTokenB,
      transferAmountTokenB,
    ]
  );
  const contract = new ethers.Contract(
    BATCH_MESSAGE_SENDER[srcChain],
    batchMessageSenderAbi,
    evmWallet.connect(provider)
  );
  const receipt = await contract
    .batchCallContractWithToken([
      payloadBatchMessageSenderChainA,
      payloadBatchMessageSenderChainB,
    ])
    .then((tx) => tx.wait());

  console.log(
    "Call contract with token tx:",
    `https://testnet.snowtrace.io/tx/${receipt.transactionHash}`
  );
})();
