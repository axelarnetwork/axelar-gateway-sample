// Initial state: 5 UST on Avalanche
// Goal: Swap 5 UST to Luna at Moonbeam and send Luna back to Avalanche.

import "dotenv/config";
import {
  AxelarGateway,
  Environment,
  EvmChain,
} from "@axelar-network/axelarjs-sdk";
import { ethers } from "ethers";
import {
  DISTRIBUTION_EXECUTOR,
  GATEWAY,
  SWAP_EXECUTOR,
  TOKEN,
  UNISWAP_ROUTER,
} from "./constants/address";
import { getProvider } from "./providers";
import uniswapRouterAbi from "./abi/uniswapRouter.json";
import { approveAll, getBalance } from "./utils/token";
import { evmWallet } from "./wallet";
import { EXPLORER_TX } from "./constants/endpoint";

// Config your own here.
const srcChain = EvmChain.AVALANCHE;
const destChain = EvmChain.MOONBEAM;
const recipientChain = EvmChain.MOONBEAM;
const fromToken = "UST";
const toToken = "LUNA";
// Should not be too large compare to the liquidity size.
const fromTokenAmountForSwap = ethers.utils.parseUnits("5", 6).toString();
// Tx might be failed if you change the lp amount without keeping the ratio the same.
const fromTokenAmountForLP = ethers.utils.parseUnits("10", 6).toString();
const toTokenAmountForLP = ethers.utils.parseUnits("2", 5).toString();

const srcProvider = getProvider(srcChain);
const destProvider = getProvider(destChain);
const fromTokenKey = fromToken.toUpperCase();
const toTokenKey = toToken.toUpperCase();
(async () => {
  // Check balance both source chain and destination chain
  console.log(`==== Your source chain balance (${srcChain}) ==== `);
  const fromTokenBalance = await getBalance(
    TOKEN[srcChain][fromTokenKey],
    srcChain
  );
  console.log(ethers.utils.formatUnits(fromTokenBalance, 6), fromToken);
  const toTokenBalance = await getBalance(
    TOKEN[srcChain][toTokenKey],
    srcChain
  );
  console.log(ethers.utils.formatUnits(toTokenBalance, 6), toToken);

  console.log(`\n==== Your destination chain balance (${destChain}) ==== `);
  const destinationFromTokenBalance = await getBalance(
    TOKEN[destChain][fromTokenKey],
    destChain
  );
  console.log(
    ethers.utils.formatUnits(destinationFromTokenBalance, 6),
    fromToken
  );
  const destinationToTokenBalance = await getBalance(
    TOKEN[destChain][toTokenKey],
    destChain
  );
  console.log(ethers.utils.formatUnits(destinationToTokenBalance, 6), toToken);

  if (destinationToTokenBalance.lt(toTokenAmountForLP)) {
    return console.log(
      `\nNot enough ${toToken}, needed ${ethers.utils.formatUnits(
        toTokenAmountForLP,
        6
      )} ${toToken}`
    );
  }
  if (destinationFromTokenBalance.lt(fromTokenAmountForLP)) {
    return console.log(
      `\nNot enough ${fromToken}, needed ${ethers.utils.formatUnits(
        fromTokenAmountForLP,
        6
      )} ${fromToken}`
    );
  }

  // Approve UST and LUNA to Uniswap Router at the destination chain if needed.
  await approveAll(
    [
      { name: fromToken, address: TOKEN[destChain][fromTokenKey] },
      { name: toToken, address: TOKEN[destChain][toTokenKey] },
    ],
    UNISWAP_ROUTER[destChain],
    destChain
  );

  // Add liquidity
  const contract = new ethers.Contract(
    UNISWAP_ROUTER[destChain],
    uniswapRouterAbi,
    evmWallet.connect(destProvider)
  );
  const deadline = Math.floor(new Date().getTime() / 1000) + 60 * 20; // 20 mins
  console.log(
    `\n==== Adding ${fromTokenKey} and ${toTokenKey} to the ${destChain} router contract ... ====`
  );
  const receipt = await contract
    .addLiquidity(
      TOKEN[destChain][fromTokenKey],
      TOKEN[destChain][toTokenKey],
      fromTokenAmountForLP,
      toTokenAmountForLP,
      0,
      0,
      evmWallet.address,
      deadline
    )
    .then((tx) => tx.wait());
  console.log(
    `Added LP transaction: ${EXPLORER_TX[destChain] + receipt.transactionHash}`
  );

  // Approve UST to the gateway contract at the source chain if needed.
  await approveAll(
    [{ name: fromToken, address: TOKEN[srcChain][fromTokenKey] }],
    GATEWAY[srcChain],
    srcChain
  );

  // Swap 5 UST to luna
  console.log(
    `\n==== Sending swap payload with ${ethers.utils.formatUnits(
      fromTokenAmountForSwap,
      6
    )} ${fromTokenKey} to the gateway contract on ${srcChain} ====`
  );
  const encoder = ethers.utils.defaultAbiCoder;
  const payload = encoder.encode(
    ["address[]", "string", "address", "string"],
    [
      [TOKEN[destChain][fromTokenKey], TOKEN[destChain][toTokenKey]],
      recipientChain,
      evmWallet.address,
      DISTRIBUTION_EXECUTOR[recipientChain],
    ]
  );
  const gateway = AxelarGateway.create(
    Environment.TESTNET,
    srcChain,
    srcProvider
  );
  const callContractReceipt = await gateway
    .createCallContractWithTokenTx({
      destinationChain: destChain,
      destinationContractAddress: SWAP_EXECUTOR[destChain],
      payload,
      symbol: fromToken,
      amount: fromTokenAmountForSwap,
    })
    .then((tx) => tx.send(evmWallet.connect(srcProvider)))
    .then((tx) => tx.wait());
  console.log(
    "Sending swap payload tx:",
    EXPLORER_TX[srcChain] + callContractReceipt.transactionHash
  );
})();
