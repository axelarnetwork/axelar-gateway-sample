require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config({ path: __dirname + "/.env" });

module.exports = {
  defaultNetwork: "ropsten",
  solidity: "0.8.9",
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_RPC,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      ropsten: process.env.ETHERSCAN_API_KEY,
    },
  },
};
