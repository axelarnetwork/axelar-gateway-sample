# Axelar General Message Passing Sample

This repo demonstrates the usage of `AxelarGateway` of the `@axelar-network/axelarjs-sdk` library. Also, providing some use-cases implementation.

## How to run?

1. Clone this repo
2. Run `npm install`
3. Rename `.env.sample` into `.env` and config the value there.
4. Choose the use-case to run. See the [example use-cases](#example-use-cases) below.
   > Note: make sure that you have enough fund in your wallet. Some use-case requires you to have fund at the destination chain as well.

## Example use-cases

1. [Send token from terra to evm chain](docs/use-case-send-terra-to-evm.md)
2. [Send token from evm to another evm chain](docs/use-case-send-evm-to-evm.md)
3. [Send multiple tokens from evm chain to multiple evm chains](docs/use-case-batch-send-evm-to-evm.md)
4. [Send token to swap at another chain, then transfer back to the source chain](docs/use-case-cross-chain-swap.md)
