// scripts/upgrade-box.js
const { ethers, upgrades } = require("hardhat");


async function main() {
  const upgradeContract = await ethers.getContractFactory("contracts/Smart.sol:Smart");
  
  const BOX_ADDRESS = "0xaF96fb3CE523B1A18369cdf31D86b3BEAC938Ba5";
  const contract = await upgrades.upgradeProxy(BOX_ADDRESS, upgradeContract);
  console.log("Smartp upgraded", await contract.getAddress());

  //设置路由器
  // const routerTx = await contract.setRouter("0x757e5af94fC9b3d4035C2e6Cb1fD304F43c0A1A4", true);
  // await routerTx.wait();
}

main();