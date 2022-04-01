# Axelar Gateway Sample

This repo demonstrates the usage of `AxelarGateway` of the `@axelar-network/axelarjs-sdk` library. Also, providing some use-cases implementation.

## How to run?

1. Clone this repo
2. Run `npm install`
3. Rename `.env.sample` into `.env` and config the value there.
4. Choose the use-case you want to run. See the [example use-cases](#example-use-cases) below.
   > Note: make sure that you have enough fund in your wallet. Some use-case requires you to have fund at the destination chain as well.

## Example use-cases

### Send token from terra to evm chain.

Open `src/send-token-terra-to-evm.ts` file and edit the following values:

- recipientAddress: Your recipient address at the destination chain.
- destChain: Your destination chain. The available values are `EvmChain.ETHEREUM`, `EvmChain.MOONBEAM` and `EvmChain.AVALANCHE`.
- transferToken: The token denom to transfer. The available values can be either `uusd` or `uluna`.
- transferAmount: The amount to send in the smallest denomination. e.g. `10000000` for 10 ust.

Finally, run `npm run terra-to-evm` to execute the script.

### Send token from evm to another evm chain.
