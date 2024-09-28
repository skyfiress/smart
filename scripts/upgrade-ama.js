// scripts/upgrade-box.js
const { ethers, upgrades } = require("hardhat");


async function main() {
  const upgradeContract = await ethers.getContractFactory("contracts/AMA.sol:AMA");
  
  const BOX_ADDRESS = "0x9c2911a07589587b8f3127CacCB8f5eF78D0cB40";
  const contract = await upgrades.upgradeProxy(BOX_ADDRESS, upgradeContract);
  console.log("AMA upgraded", await contract.getAddress());
  const currentImplAddress = await upgrades.erc1967.getImplementationAddress(BOX_ADDRESS);
  console.log("AMA implementation Address", currentImplAddress);

  //设置路由器
  // const routerTx = await contract.setRouter("0x757e5af94fC9b3d4035C2e6Cb1fD304F43c0A1A4", true);
  // await routerTx.wait();
}

main();