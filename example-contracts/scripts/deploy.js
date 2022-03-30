// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function deployDistributionExecutor(gatewayAddress) {
  const Executor = await hre.ethers.getContractFactory("DistributionExecutor");
  const executor = await Executor.deploy(gatewayAddress);
  await executor.deployed();
  console.log("Executor deployed to:", executor.address);
}

async function deployBatchMessageSender(gatewayAddress) {
  const BatchMessageSender = await hre.ethers.getContractFactory(
    "BatchMessageSender"
  );
  const batchMessageSender = await BatchMessageSender.deploy(gatewayAddress);
  await batchMessageSender.deployed();
  console.log("BatchMessageSender deployed to:", batchMessageSender.address);
}

const ROPSTEN_GATEWAY_ADDRESS = "0x7358799e0c8250f0B7D1164824F6Dd5bA31C9Cd6";
const MOONBASE_ALPHA_GATEWAY_ADDRESS =
  "0x1b23BE90a16efe8fD3008E742dDd9531dC5845b0";
const AVALANCE_TESTNET_GATEWAY_ADDRESS =
  "0x4ffb57Aea2295d663B03810a5802ef2Bc322370D";

deployDistributionExecutor(MOONBASE_ALPHA_GATEWAY_ADDRESS)
  .then(() => deployBatchMessageSender(MOONBASE_ALPHA_GATEWAY_ADDRESS))
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
