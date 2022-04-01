## Send token from terra to evm chain.

Open `src/send-terra-to-evm.ts` file and edit the following values:

| Variables        | Description                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| recipientAddress | A recipient address at the destination chain.                                                                    |
| destChain        | A destination chain. The available values are `EvmChain.ETHEREUM`, `EvmChain.MOONBEAM` and `EvmChain.AVALANCHE`. |
| transferToken    | A token to transfer. The available values can be either `uusd` or `uluna`.                                       |
| transferAmount   | An amount to send in the smallest denomination. e.g. `10000000` for 10 ust.                                      |

Finally, run `npm run terra-to-evm` to execute the script.
