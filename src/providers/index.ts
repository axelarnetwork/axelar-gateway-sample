import { EvmChain } from "@axelar-network/axelarjs-sdk";
import { ethers } from "ethers";
import { RPC_ENDPOINT } from "../constants/endpoint";

export function getProvider(chain: EvmChain) {
  return new ethers.providers.JsonRpcProvider(RPC_ENDPOINT[chain]);
}
