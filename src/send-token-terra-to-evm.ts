import "dotenv/config";
import {
  GetDepositAddressPayload,
  TransferAssetBridge,
} from "@axelar-network/axelarjs-sdk";
import { ethers } from "ethers";
import {
  createIBCTransferMsg,
  importTerraWallet,
  printTerraBalance,
  signAndBroadcast,
} from "./utils/terraHelper";

// Config your own here.
const terraMnemonic = process.env.TERRA_MNEMONIC;
const recipientAddress = "0xa411977dd24F1547065C6630E468a43275cB4d7f";
const transferToken = "uusd"; // can be either uusd or uluna
const transferAmount = ethers.utils.parseUnits("10", 6); // 10 UST

async function getDepositAddress(destinationAddress: string, env = "devnet") {
  const client = new TransferAssetBridge(env);
  const payload: GetDepositAddressPayload = {
    fromChain: "terra",
    toChain: "avalanche",
    asset: transferToken,
    destinationAddress,
  };
  return client.getDepositAddress({ payload });
}

(async () => {
  // Import existing terra wallet
  const wallet = importTerraWallet(terraMnemonic);
  console.log("==== Your terra wallet info ==== ");
  console.log("Address:", wallet.key.accAddress);

  // Print terra balances
  const coins = await wallet.lcd.bank
    .balance(wallet.key.accAddress)
    .then(([coins]) =>
      coins.filter((coin) => ["uusd", "uluna"].includes(coin.denom))
    );
  printTerraBalance(coins);

  // Generate deposit address
  console.log("\n==== Generating deposit address... ====");
  const depositAddress = await getDepositAddress(recipientAddress);
  console.log("Deposit Address:", depositAddress);

  // IBC transfer UST token
  const transferCoin = coins.get(transferToken);
  const ibcMsg = createIBCTransferMsg(
    wallet.key.accAddress,
    depositAddress,
    transferCoin.denom,
    transferAmount.toString()
  );
  const receipt = await signAndBroadcast(wallet, ibcMsg);
  console.log("IBC Tx:", receipt.txhash);
})();
