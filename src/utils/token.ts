import { EvmChain } from "@axelar-network/axelarjs-sdk";
import { ethers } from "ethers";
import { getProvider } from "../providers";
import { evmWallet } from "../wallet";
import erc20Abi from "../abi/erc20.json";

export function getBalance(address: string, chain: EvmChain) {
  const provider = getProvider(chain);
  const contract = new ethers.Contract(address, erc20Abi, provider);
  return contract.balanceOf(evmWallet.address);
}

export async function isRequireApprove(
  address: string,
  gatewayAddress: string,
  chain: EvmChain
) {
  const provider = getProvider(chain);
  const contract = new ethers.Contract(address, erc20Abi, provider);
  const allowance: ethers.BigNumber = await contract.allowance(
    evmWallet.address,
    gatewayAddress
  );
  return allowance.isZero();
}
