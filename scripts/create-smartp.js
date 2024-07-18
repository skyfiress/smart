// scripts/create-box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const Contract = await ethers.getContractFactory("Smartp");
  const [owner] = await ethers.getSigners();
  const contract = await upgrades.deployProxy(Contract, [owner.address, owner.address, 300n]);
  await contract.waitForDeployment();
  console.log("Contract deployed to:", await contract.getAddress());
  
}

main();