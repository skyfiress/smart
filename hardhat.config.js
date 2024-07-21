require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
require('@openzeppelin/hardhat-upgrades');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"]
    },
    hardhat: {
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/f80d7ad4b4784fd888279bc41074453d",
      accounts: ["ad954d392859067954221d5aee09fa3b0fb5ef3bef6e0ad402346e1292d91df9", "5692cebeac8363cc7df28323cf899d75b26a960268c6ba58d7f3a6dde6bcd07c"]
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: ["ad954d392859067954221d5aee09fa3b0fb5ef3bef6e0ad402346e1292d91df9", "5692cebeac8363cc7df28323cf899d75b26a960268c6ba58d7f3a6dde6bcd07c"]
    },
    mxc: {
      url: "https://rpc.mxc.com",
      accounts: ["0x7e5216425c105d2e4c4a6d9c7342b55bde8e013cee6414b78b574d1b06e7b619", "ad954d392859067954221d5aee09fa3b0fb5ef3bef6e0ad402346e1292d91df9"]
    },
  },
  etherscan: {
    apiKey: {
      bscTestnet: "QNV1UQ2D5ZC9F8HYMBXQJ82V5SHIITI2YI",
      sepolia: "4GM32Y7594NGV9R9MQAQGKA49AXBHP8YGX",
      mxc: "abc"
    },
    customChains: [
      {
        network: "mxc",
        chainId: 18686,
        urls: {
          apiURL: "https://explorer.moonchain.com/api",
          browserURL: "https://explorer.moonchain.com"
        }
      }
    ]
  },
  sourcify: {
    enabled: true
  },
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};
