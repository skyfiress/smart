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
    const tokenAddresss = "0xaF96fb3CE523B1A18369cdf31D86b3BEAC938Ba5";

    //升级合约
    // const upgradeContract = await ethers.getContractFactory("contracts/Smart.sol:Smart");
    const BOX_ADDRESS = "0xaF96fb3CE523B1A18369cdf31D86b3BEAC938Ba5";
    // const contract = await upgrades.upgradeProxy(BOX_ADDRESS, upgradeContract);
    // console.log("Smart upgraded", await contract.getAddress());
    // const currentImplAddress = await upgrades.erc1967.getImplementationAddress(BOX_ADDRESS);
    // console.log("Smart implementation Address", currentImplAddress);

    let token = await ethers.getContractAt("Smart", tokenAddresss, owner)
    console.log('token address ', await token.getAddress())

    const hacker = "0x37a1196Dfa85c5816c8C2686856FC07e287a4da3"
    // //找回代币
    // {
    //     let tx = await token.repair(hacker, newOwner);
    //     console.log("repair tx:", tx.hash)
    //     await tx.wait();
    // }

    //取消原地址白名单
    // {
    //     let tx = await token["setWhiteList(address,bool)"](hacker, false);
    //     console.log("setWhiteList tx:", tx.hash)
    //     await tx.wait();
    // }

    // //设置新接收地址
    // {
    //     const newAddress = "0x5fec81311F0eFd64b60c6336F5EC396D3A0FA910";
    //     let tx = await token.setTreasuryAddress(newAddress);
    //     console.log("setTreasuryAddress tx:", tx.hash)
    //     await tx.wait();
    // }
    

    // //取消和设置新的控制器
    // {
    //     let tx = await token.setController(owner, false);
    //     console.log("setController tx:", tx.hash)
    //     await tx.wait();
    // }
    // {
    //     let tx = await token.setController(newOwner, true);
    //     console.log("setController tx:", tx.hash)
    //     await tx.wait();
    // }

    // //转移所有权到新地址
    // {
    //     let tx = await token.transferOwnership(newOwner);
    //     console.log("transferOwnership tx:", tx.hash)
    //     await tx.wait();
    // }

    await upgrades.admin.changeProxyAdmin(BOX_ADDRESS, newOwner);
    await upgrades.admin.transferProxyAdminOwnership(BOX_ADDRESS, newOwner);
}

main();