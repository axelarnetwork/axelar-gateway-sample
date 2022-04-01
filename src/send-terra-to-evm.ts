// Initial state: 10 UST on Terra
// Goal: 10 UST on Avalanche

import "dotenv/config";
import {
  EvmChain,
  GetDepositAddressPayload,
  TransferAssetBridge,
} from "@axelar-network/axelarjs-sdk";
import { ethers } from "ethers";
import {
  createIBCTransferMsg,
  printTerraBalance,
  signAndBroadcast,
} from "./utils/terra";
import { evmWallet, terraWallet } from "./wallet";

// Config your own here.
const recipientAddress = evmWallet.address;
const destChain = EvmChain.AVALANCHE;
const transferToken = "uusd"; // can be either uusd or uluna
const transferAmount = ethers.utils.parseUnits("100", 6); // 10 UST

async function getDepositAddress(destinationAddress: string, env = "devnet") {
  const client = new TransferAssetBridge(env);
  const payload: GetDepositAddressPayload = {
    fromChain: "terra",
    toChain: destChain,
    asset: transferToken,
    destinationAddress,
  };
  return client.getDepositAddress({ payload });
}

(async () => {
  // Import existing terra wallet
  console.log("==== Your terra wallet info ==== ");
  console.log("Address:", terraWallet.key.accAddress);

  // Print terra balances
  const coins = await terraWallet.lcd.bank
    .balance(terraWallet.key.accAddress)
    .then(([coins]) =>
      coins.filter((coin) => ["uusd", "uluna"].includes(coin.denom))
    );
  printTerraBalance(coins);

  // Generate deposit address
  console.log("\n==== Generating deposit address... ====");
  try {
    const depositAddress = await getDepositAddress(recipientAddress);
    console.log("Deposit Address:", depositAddress);

    // IBC transfer `transferToken`
    const transferCoin = coins.get(transferToken);
    const ibcMsg = createIBCTransferMsg(
      terraWallet.key.accAddress,
      depositAddress,
      transferCoin.denom,
      transferAmount.toString()
    );
    const receipt = await signAndBroadcast(terraWallet, ibcMsg);
    console.log(
      "IBC Tx:",
      "https://finder.terra.money/testnet/tx/" + receipt.txhash
    );
  } catch (e) {
    console.log(e);
  }
})();
