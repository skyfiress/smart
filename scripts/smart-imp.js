// scripts/upgrade-box.js
const WETH9 = require("@uniswap/v2-periphery/build/WETH9.json");
const factoryArtifact = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");
const { ethers, upgrades } = require("hardhat");
const { Contract, ContractFactory } = require("ethers");


async function main() {

    //   const BOX_ADDRESS = "0xaF96fb3CE523B1A18369cdf31D86b3BEAC938Ba5";
    //   const currentImplAddress = await upgrades.erc1967.getImplementationAddress(BOX_ADDRESS);
    //   console.log("Smartp implementation Address", currentImplAddress);

    const [owner, newOwner] = await ethers.getSigners();
    const upgradeContract = await ethers.getContractFactory("contracts/AMA.sol:AMA");
    const BOX_ADDRESS = "0xaF96fb3CE523B1A18369cdf31D86b3BEAC938Ba5";
    // await upgrades.forceImport(BOX_ADDRESS, upgradeContract)
    
    let admin = await upgrades.erc1967.getAdminAddress(BOX_ADDRESS)
    console.log(admin)

    // let tx = await upgrades.admin.changeProxyAdmin(BOX_ADDRESS, owner, newOwner)
    // console.log('tx', tx)
    // await tx.wait()

    // await upgrades.admin.transferProxyAdminOwnership(BOX_ADDRESS, newOwner)
    // console.log('tx', tx)
    // await tx.wait()

    
}

main();