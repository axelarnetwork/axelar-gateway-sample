// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function deploy(gatewayAddress) {
  const Executor = await hre.ethers.getContractFactory("DistributionExecutor");
  const executor = await Executor.deploy(gatewayAddress);

  await executor.deployed();

  console.log("Executor deployed to:", greeter.address);
}

const gatewayAddress = "0x7358799e0c8250f0B7D1164824F6Dd5bA31C9Cd6"; //ethereum

deploy(gatewayAddress)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
