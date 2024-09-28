// scripts/upgrade-box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
 
//   const BOX_ADDRESS = "0xaF96fb3CE523B1A18369cdf31D86b3BEAC938Ba5";
//   const currentImplAddress = await upgrades.erc1967.getImplementationAddress(BOX_ADDRESS);
//   console.log("Smartp implementation Address", currentImplAddress);

    let token = await ethers.getContractAt("AMA", "0xB71c5F9058Ef003FB4cb9888c899fF8e7f26D8b9")

}

main();