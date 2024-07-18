// scripts/upgrade-box.js
const { ethers, upgrades } = require("hardhat");


async function main() {
  const upgradeContract = await ethers.getContractFactory("contracts/SmartpV2.sol:Smartp");
  
  const BOX_ADDRESS = "0x516983bb6BFE17b84747c7CFF570cc886A35199c";
  const contract = await upgrades.upgradeProxy(BOX_ADDRESS, upgradeContract);
  console.log("Smartp upgraded", await contract.getAddress());
}

main();