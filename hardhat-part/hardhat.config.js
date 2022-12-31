require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545/",
      accounts: [process.env.PUBLIC_KEY],
    },
    goerli: {
      url: process.env.GOERLI_URL,
      accounts: [process.env.PUBLIC_KEY],
    },
  },
  etherscan: {
    apiKey: "KKWIFQR9JSCN4U5EZMQDTF75FFQGMV4UZ2",
  },
};
