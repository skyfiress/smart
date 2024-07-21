// scripts/create-box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const Contract = await ethers.getContractFactory("NewSwap");
  const [owner] = await ethers.getSigners();
  const contract = await Contract.deploy(owner, owner);
  // await contract.waitForDeployment();
  console.log("Contract deployed to:", await contract.getAddress());
}

main();