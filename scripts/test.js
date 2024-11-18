// scripts/upgrade-box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
 
  const BOX_ADDRESS = "0x9c2911a07589587b8f3127CacCB8f5eF78D0cB40";
  const currentImplAddress = await upgrades.erc1967.getImplementationAddress(BOX_ADDRESS);
  console.log("AMA implementation Address", currentImplAddress);

    // let token = await ethers.getContractAt("AMA", "0xB71c5F9058Ef003FB4cb9888c899fF8e7f26D8b9")
    const [owner, newOwner] = await ethers.getSigners();

    // const tokenAddresss = "0xaF96fb3CE523B1A18369cdf31D86b3BEAC938Ba5";

    // let token = await ethers.getContractAt("Smart", tokenAddresss, owner)
    // console.log('token address ', await token.getAddress())
    // console.log('owner address ', await token.owner())

        
    const tokenAddresss = "0x9c2911a07589587b8f3127CacCB8f5eF78D0cB40";

    let token = await ethers.getContractAt("AMA", tokenAddresss, owner)
    console.log('token address ', await token.getAddress())
    console.log('owner address ', await token.owner())
}

main();