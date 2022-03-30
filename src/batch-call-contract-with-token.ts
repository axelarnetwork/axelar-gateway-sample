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
  TOKEN,
} from "./constants/address";
import { getProvider } from "./providers";
import { approveAll, getBalance } from "./utils/token";

// Config your own here.
const chain = EvmChain.AVALANCHE;
const provider = getProvider(chain);
const ustAmount = ethers.utils.parseUnits("10", 6).toString();
const lunaAmount = ethers.utils.parseUnits("1", 5).toString();
const ust = "UST";
const luna = "LUNA";

(async () => {
  console.log(`==== Your balance ==== `);
  const ustBalance = await getBalance(TOKEN[chain].UST, chain);
  console.log(ethers.utils.formatUnits(ustBalance, 6), ust);
  const lunaBalance = await getBalance(TOKEN[chain].LUNA, chain);
  console.log(ethers.utils.formatUnits(lunaBalance, 6), luna);

  // Approve tokens to Gateway Contract
  await approveAll(
    [
      { address: TOKEN[chain].UST, name: ust },
      { address: TOKEN[chain].LUNA, name: luna },
    ],
    chain
  );

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
    BATCH_MESSAGE_SENDER[chain],
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
