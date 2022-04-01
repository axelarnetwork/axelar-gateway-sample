## Send token from evm to another evm chain.

Open `src/send-evm-to-evm.ts` file and edit the following values:

| Variables      | Description                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| srcChain       | A source chain. The available values are `EvmChain.ETHEREUM`, `EvmChain.MOONBEAM` and `EvmChain.AVALANCHE`.      |
| destChain      | A destination chain. The available values are `EvmChain.ETHEREUM`, `EvmChain.MOONBEAM` and `EvmChain.AVALANCHE`. |
| transferToken  | A token to transfer. The available values can be either `UST` or `LUNA`.                                         |
| transferAmount | An amount to send in the smallest denomination. e.g. `10000000` for 10 ust.                                      |

Finally, run `npm run evm-to-evm` to execute the script.
