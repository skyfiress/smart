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
    const tokenAddresss = "0x9c2911a07589587b8f3127CacCB8f5eF78D0cB40";
    let token = await ethers.getContractAt("AMA", tokenAddresss, owner)


    //取消和设置新的控制器
    // {
    //     let tx = await token.setController(owner, false);
    //     console.log("setController tx:", tx)
    //     await tx.wait();
    // }
    // {
    //     let tx = await token.setController(newOwner, true);
    //     console.log("setController tx:", tx)
    //     await tx.wait();
    // }

    // //转移所有权到新地址
    // {
    //     let tx = await token.connect(newOwner).transferOwnership(owner);
    //     console.log("transferOwnership tx:", tx.hash)
    //     await tx.wait();
    // }

    const hacker = "0x37a1196Dfa85c5816c8C2686856FC07e287a4da3"

    // let token = await ethers.getContractAt("AMA", tokenAddresss, owner)
    // //取消原地址白名单
    // {
    //     let tx =  await token["setWhiteList(address,bool)"](hacker, false);
    //     console.log("setWhiteList tx:", tx.hash)
    //     await tx.wait();
    // }

    // //设置新接收地址
    // {
    //     const newAddress = "0x5fec81311F0eFd64b60c6336F5EC396D3A0FA910";
    //     let tx = await token.connect(owner).setTreasuryAddress(newAddress);
    //     console.log("setTreasuryAddress tx:", tx.hash)
    //     await tx.wait();
    // }

    //升级合约
    const upgradeContract = await ethers.getContractFactory("contracts/AMA.sol:AMA");
    const BOX_ADDRESS = "0x9c2911a07589587b8f3127CacCB8f5eF78D0cB40";
    // await upgrades.forceImport(BOX_ADDRESS, upgradeContract)
    const contract = await upgrades.upgradeProxy(BOX_ADDRESS, upgradeContract);
    console.log("AMA upgraded", await contract.getAddress());
    const currentImplAddress = await upgrades.erc1967.getImplementationAddress(BOX_ADDRESS);
    console.log("AMA implementation Address", currentImplAddress);

  

    //找回代币
    {
        let tx = await token.connect(owner).repair(hacker, owner);
        await tx.wait();
    }

    
    
}

main();