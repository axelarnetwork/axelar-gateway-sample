import "dotenv/config";
import { MnemonicKey } from "@terra-money/terra.js";
import { lcdClient } from "../utils/terra";
import { ethers } from "ethers";

const mnemonic = process.env.TERRA_MNEMONIC;
const privateKey = process.env.PRIVATE_KEY;

const mk = new MnemonicKey({
  mnemonic,
});

export const evmWallet = new ethers.Wallet(privateKey);
export const terraWallet = lcdClient.wallet(mk);
