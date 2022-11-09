import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

const {
  API_URL,
  PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  ETHERSCAN_API_KEY_POLYSCAN,
  ALCHEMY_POLYGON_TESTNET_HTTP,
} = process.env;

const config: HardhatUserConfig = {
  
  solidity: {
    compilers: [
      {
        version: "0.8.0",
      },
      {
        version: "0.8.1",
      },
      {
        version: "0.8.9",
      },
    ],
  },
  defaultNetwork: "hardhat",
  paths: {
    tests: "tests",
  },
  networks: {
    hardhat: {},
    goerli: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    maticmum: {
      url: ALCHEMY_POLYGON_TESTNET_HTTP,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY || "",
      polygonMumbai: ETHERSCAN_API_KEY_POLYSCAN || "",
    },
  },
};

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

export default config;
