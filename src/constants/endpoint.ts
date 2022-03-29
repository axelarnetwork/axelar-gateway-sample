import { EvmChain } from "@axelar-network/axelarjs-sdk";

export const RPC_ENDPOINT = {
  [EvmChain.AVALANCHE]: "https://api.avax-test.network/ext/bc/C/rpc",
  [EvmChain.MOONBEAM]: "https://rpc.api.moonbase.moonbeam.network",
  [EvmChain.ETHEREUM]: process.env.ROPSTEN_RPC,
};
