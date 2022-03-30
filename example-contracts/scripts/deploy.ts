import hre from "hardhat";
import { GATEWAY } from "./constants/address";
import { EvmChain } from "@axelar-network/axelarjs-sdk";

async function deployDistributionExecutor(gatewayAddress: string) {
  const Executor = await hre.ethers.getContractFactory("DistributionExecutor");
  const executor = await Executor.deploy(gatewayAddress);
  await executor.deployed();
  console.log("Executor deployed to:", executor.address);
}

async function deployBatchMessageSender(gatewayAddress: string) {
  const BatchMessageSender = await hre.ethers.getContractFactory(
    "BatchMessageSender"
  );
  const batchMessageSender = await BatchMessageSender.deploy(gatewayAddress);
  await batchMessageSender.deployed();
  console.log("BatchMessageSender deployed to:", batchMessageSender.address);
}

const chain = EvmChain.MOONBEAM;
const gatewayAddress = GATEWAY[chain];

deployDistributionExecutor(gatewayAddress)
  .then(() => deployBatchMessageSender(gatewayAddress))
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
