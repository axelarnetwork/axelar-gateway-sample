import hre from "hardhat";
import { GATEWAY, UNISWAP_ROUTER } from "./constants/address";
import { EvmChain } from "@axelar-network/axelarjs-sdk";

async function deployDistributionExecutor(chain: EvmChain) {
  console.log(`==== Deploying DistributionExecutor on ${chain}... ====`);
  const Executor = await hre.ethers.getContractFactory("DistributionExecutor");
  const gatewayAddress = GATEWAY[chain];
  const executor = await Executor.deploy(gatewayAddress);
  await executor.deployed();
  console.log("Executor deployed to:", executor.address);
  return executor.address;
}

async function deployBatchMessageSender(chain: EvmChain) {
  console.log(`==== Deploying BatchMessageSender on ${chain}... ====`);
  const BatchMessageSender = await hre.ethers.getContractFactory(
    "BatchMessageSender"
  );
  const gatewayAddress = GATEWAY[chain];
  const batchMessageSender = await BatchMessageSender.deploy(gatewayAddress);
  await batchMessageSender.deployed();
  console.log("BatchMessageSender deployed to:", batchMessageSender.address);
}

async function deploySwapExecutor(chain: EvmChain) {
  console.log(`==== Deploying SwapExecutor on ${chain}... ====`);
  const gatewayAddress = GATEWAY[chain];
  const routerAddress = UNISWAP_ROUTER[chain];
  const SwapExecutor = await hre.ethers.getContractFactory("SwapExecutor");
  const executor = await SwapExecutor.deploy(
    gatewayAddress,
    routerAddress,
    chain
  );
  await executor.deployed();
  console.log("SwapExecutor deployed to:", executor.address);
  return executor.address;
}

async function verify(address: string, args: any[]) {
  return hre.run("verify:verify", {
    address,
    constructorArguments: args,
  });
}

const chain = EvmChain.ETHEREUM;

deployDistributionExecutor(chain)
  .then((address) => verify(address, [GATEWAY[chain]]))
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
