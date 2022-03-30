import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
require("dotenv").config({ path: __dirname + "/.env" });

export default {
  defaultNetwork: "ropsten",
  solidity: "0.8.9",
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_RPC,
      accounts: [process.env.PRIVATE_KEY],
    },
    avalanche: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [process.env.PRIVATE_KEY],
    },
    moonbeam: {
      url: "https://rpc.api.moonbase.moonbeam.network",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      ropsten: process.env.ETHERSCAN_API_KEY,
      avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY,
      moonbaseAlpha: process.env.MOONSCAN_API_KEY,
    },
  },
};
