## Send token to swap at another chain, then transfer back to the source chain.

In this use-case, you have to prepare two tokens for adding the liquidity before swap since the script will add the liquidity on the destination chain from the very first step.

Open `src/cross-chain-swap.ts` file and edit the follwing values:

| Variables              | Description                                                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| srcChain               | A source chain. The available values are `EvmChain.ETHEREUM`, `EvmChain.MOONBEAM` and `EvmChain.AVALANCHE`.                               |
| destChain              | A destination chain. The available values are `EvmChain.ETHEREUM`, `EvmChain.MOONBEAM` and `EvmChain.AVALANCHE`.                          |
| recipientChain         | A chain to receive the token back after swap. The available values are `EvmChain.ETHEREUM`, `EvmChain.MOONBEAM` and `EvmChain.AVALANCHE`. |
| fromToken              | A token to use for swap. The available values can be either `UST` or `LUNA`.                                                              |
| toToken                | A token to receive after swap. The available values can be either `UST` or `LUNA`.                                                        |
| fromTokenAmountForSwap | An amount to swap in the smallest denomination. e.g. `10000000` for 10 ust.                                                               |
| fromTokenAmountForLP   | An amount of the first token to add liquidity at the destination chain. e.g. `10000000` for 10 ust.                                       |
| toTokenAmountForLP     | An amount of the second token to add liquidity at the destination chain. e.g. `10000000` for 10 luna.                                     |

Finally, run `npm run cross-chain-swap` to execute the script.
