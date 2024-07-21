// scripts/create-box.js
const { ethers, upgrades } = require("hardhat");

const swapAddress = "0x4c26AA1CC5FD9bf30000D2D0E54D3aBe0F54da73";

async function main() {
  const Contract = await ethers.getContractFactory("Smart");
  const [owner] = await ethers.getSigners();
  const contract = await upgrades.deployProxy(Contract, [owner.address, owner.address]);
  await contract.waitForDeployment();
  console.log("Contract deployed to:", await contract.getAddress());

  if (swapAddress) {
    let approveTx1 = await contract.approve(swapAddress, '115792089237316195423570985008687907853269984665640564039457584007913129639935');
    await approveTx1.wait();
  }
}

main();