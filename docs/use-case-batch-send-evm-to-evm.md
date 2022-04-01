## Send multiple tokens from evm chain to multiple evm chains.

Open `src/batch-send-evm-to-evm.ts` file and edit the following values:

| Variables       | Description                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| srcChain        | A source chain. The available values are `EvmChain.ETHEREUM`, `EvmChain.MOONBEAM` and `EvmChain.AVALANCHE`.               |
| destChainA      | he first destination chain. The available values are `EvmChain.ETHEREUM`, `EvmChain.MOONBEAM` and `EvmChain.AVALANCHE`.   |
| destChainB      | The second destination chain. The available values are `EvmChain.ETHEREUM`, `EvmChain.MOONBEAM` and `EvmChain.AVALANCHE`. |
| transferTokenA  | The first token to transfer. The available values can be either `UST` or `LUNA`.                                          |
| transferTokenB  | The second token to transfer. The available values can be either `UST` or `LUNA`.                                         |
| transferAmountA | The amount of the first token to send in the smallest denomination. e.g. `10000000` for 10 ust.                           |
| transferAmountB | The amount of the second token to send in the smallest denomination. e.g. `10000000` for 10 luna.                         |

Finally, run `npm run batch-evm-to-evm` to execute the script.
