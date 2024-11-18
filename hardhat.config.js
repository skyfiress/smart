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
      accounts: ["0x7e5216425c105d2e4c4a6d9c7342b55bde8e013cee6414b78b574d1b06e7b619", "0x07deac35dc064d7f15a74b9ba3c44848b0bb473f53305afc2402596f81d48f89", "ad954d392859067954221d5aee09fa3b0fb5ef3bef6e0ad402346e1292d91df9"]
      // accounts: ["0x07deac35dc064d7f15a74b9ba3c44848b0bb473f53305afc2402596f81d48f89", "ad954d392859067954221d5aee09fa3b0fb5ef3bef6e0ad402346e1292d91df9"]
    },
  },
  etherscan: {
    apiKey: {
      bscTestnet: "QNV1UQ2D5ZC9F8HYMBXQJ82V5SHIITI2YI",
      sepolia: "4GM32Y7594NGV9R9MQAQGKA49AXBHP8YGX",
      mxc: "721da024-5d2c-402c-85f6-49f321b61d8f"
    },
    customChains: [
      {
        network: "mxc",
        chainId: 18686,
        urls: {
          // apiURL: "https://www.moonchain.com/api",
          apiURL: "https://explorer.moonchain.com/api",
          // apiURL: "https://www.moonchain.com/api/v2/smart-contracts/0xD2a5A2CE6f964120d9893d22Bf0AC045c13E7C90/verification/via/standard-input",
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
      },
      evmVersion: "paris",
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
