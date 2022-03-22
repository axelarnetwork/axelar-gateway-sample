import {
  EvmChain,
  AxelarGateway,
  GatewayTx,
  Environment,
} from "@axelar-network/axelarjs-sdk";
import { ethers } from "ethers";

(async () => {
  // Initialize the Axelar Gateway
  const provider = new ethers.providers.JsonRpcProvider("YOUR_RPC_URL"); // Replace this with your rpc url

  // You can create AxelarGateway's instance by two options:
  // The first option is you know the contract address, so you pass the contract address directly in the constructor function.
  const gateway = new AxelarGateway("AXELAR_CONTRACT_ADDRESS", provider);
  // The second option is you don't know the contract address, but you want to use our gateway contract that deployed on mainnet or testnet.
  const gateway2 = AxelarGateway.create(
    Environment.TESTNET,
    EvmChain.ETHEREUM,
    provider
  );

  // ----------------------------------------------------------------

  // Approve erc20 tx
  const unsignedApproveTx = await gateway.createApproveTx({
    tokenAddress: "YOUR_TOKEN_ADDRESS",
    amount: "1000000", // Optional, the sdk will approve with max amount (uint256) if not provided.
  });

  // You can estimate gas before sending
  const estimatedGasUsed = await unsignedApproveTx.estimateGas();
  console.log("Estimated gas used for approval:", estimatedGasUsed);

  // Send a transaction
  const signer = ethers.Wallet.createRandom();
  const txOption = {
    maxFeePerGas: "",
    maxPriorityFeePerGas: "",
  }; // Optional, ethers.js will handle transaction fee if not specified.
  const approveReceipt = await unsignedApproveTx.send(signer, txOption);

  // Get transaction hash
  console.log("Approve transaction hash:", approveReceipt.hash);

  // ----------------------------------------------------------------

  // Send token to gateway contract
  const unsignedSendTokenTx = await gateway.createSendTokenTx({
    amount: ethers.utils.parseUnits("1", 18).toString(),
    destinationAddress: "YOUR_RECEIVER_ADDRESS",
    destinationChain: EvmChain.AVALANCHE,
    symbol: "WETH",
  });

  const sendTokenReceipt = await unsignedSendTokenTx.send(signer);

  console.log("Send token transaction hash:", sendTokenReceipt.hash);

  // -----------------------------------------------------------------

  // Send call contract transaction
  const unsignedCallContractTx = await gateway.createCallContractTx({
    contractAddress: "", // An address of AxelarExecutable contract on the destination chain
    destinationChain: EvmChain.FANTOM,
    payload: "0x...",
  });

  const callContractTxReceipt = await unsignedCallContractTx.send(signer);
  console.log("Call contract tx receipt:", callContractTxReceipt.hash);
})();
