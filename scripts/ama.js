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

    const [owner, otherAccount] = await ethers.getSigners();
    const tokenAddresss = "0x9c2911a07589587b8f3127CacCB8f5eF78D0cB40";
    let token = await ethers.getContractAt("AMA", tokenAddresss, owner)

    // //工厂合约
    // const Factory = new ContractFactory(
    //     factoryArtifact.abi,
    //     factoryArtifact.bytecode,
    //     owner
    // );
    // const factory = await Factory.attach("0x8bc7cf83f5f83781ec85b78d866222987ae24657")

    // const wethAddress = "0xcbce60bad702026d6385e5f449e44099a655d14f";
    // const routerAddress = "0x757e5af94fC9b3d4035C2e6Cb1fD304F43c0A1A4";
    // //0x576Fb2126c2308ceF07530e752E78b09de94165c
    // const pairAddress = await factory.getPair(tokenAddresss, wethAddress);

    // console.log("pair address:", pairAddress)

    // //添加交易所 -- 注池地址
    // const marketTx = await token.setMarketPair(pairAddress, true);
    // await marketTx.wait();

    // //添加交易所 -- 路由地址
    // const routerTx = await token.setRouter(routerAddress, true);
    // await routerTx.wait();

    const tx = await token.settle();
    await tx.wait();
}

main();