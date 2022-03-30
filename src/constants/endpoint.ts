import { EvmChain } from "@axelar-network/axelarjs-sdk";

export const RPC_ENDPOINT = {
  [EvmChain.AVALANCHE]: "https://api.avax-test.network/ext/bc/C/rpc",
  [EvmChain.MOONBEAM]: "https://rpc.api.moonbase.moonbeam.network",
  [EvmChain.ETHEREUM]:
    "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
};
// Credit: https://rpc.info/

export const EXPLORER_TX = {
  [EvmChain.AVALANCHE]: "https://testnet.snowtrace.io/tx/",
  [EvmChain.MOONBEAM]: "https://moonbase.moonscan.io/tx/",
  [EvmChain.ETHEREUM]: "https://ropsten.etherscan.io/tx/",
};

export const EXPLORER_ADDRESS = {
  [EvmChain.AVALANCHE]: "https://testnet.snowtrace.io/address/",
  [EvmChain.MOONBEAM]: "https://moonbase.moonscan.io/address/",
  [EvmChain.ETHEREUM]: "https://ropsten.etherscan.io/address/",
};
