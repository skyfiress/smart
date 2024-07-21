const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { Contract, ContractFactory } = require("ethers");
const WETH9 = require("@uniswap/v2-periphery/build/WETH9.json");
const factoryArtifact = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");


describe("Uniswap", function () {

    let TokenAddress = {
        Router: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
        Factory: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
        Pair: "0xa17A7058165761492E206CF798c12B0E7cc482F7",
        Weth: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        Smart: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    }

    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployRouterFixture() {
        const [owner, otherAccount] = await ethers.getSigners();
        const router = new Contract(TokenAddress.Router, routerArtifact.abi, owner);

        const smart = await ethers.getContractAt("Smart", TokenAddress.Smart);
        // console.log("Contract deployed to:", await smart.getAddress(), await smart.symbol());

        const Weth = new ContractFactory(
            WETH9.abi,
            WETH9.bytecode,
            owner
        );
        const weth = Weth.attach(TokenAddress.Weth);

        return { router, smart, weth, owner, otherAccount };
    }

    async function deployMarketFixture() {
        const { router, smart, weth, owner, otherAccount } = await loadFixture(deployRouterFixture);
        const tx = await smart.setMarketPair(TokenAddress.Pair, true);
        await tx.wait();

        return { router, smart, weth, owner, otherAccount };
    }


    describe("交易所测试", function () {


        // describe("白名单用户", function () {

        //     const deadline = Math.floor(Date.now() / 1000) + 10 * 60;

        //     it("可兑换ETH", async function () {
        //         const { router, owner } = await loadFixture(deployRouterFixture);
        //         expect(await router.swapExactTokensForETH(ethers.parseEther("100.0"), 0, [TokenAddress.Smart, TokenAddress.Weth], owner, deadline)).not.to.reverted;
        //     });

        //     it("可兑换Smart", async function () {
        //         const { router, owner } = await loadFixture(deployRouterFixture);

        //         expect(await router.swapExactETHForTokens(0, [TokenAddress.Weth, TokenAddress.Smart], owner, deadline, { value: ethers.parseEther("2.00") })).not.to.reverted;
        //     });

        // });

        // describe("普通用户", function () {

        //     const deadline = Math.floor(Date.now() / 1000) + 10 * 60;

        //     // it("可出售", async function () {
        //     //     const { router, owner, otherAccount } = await loadFixture(deployMarketFixture);
        //     //     console.log(otherAccount.getAddress());
        //     //     expect(await router.connect(otherAccount).swapExactTokensForETH(ethers.parseEther("100.0"), 0, [TokenAddress.Smart, TokenAddress.Weth], otherAccount, deadline)).not.to.reverted;
        //     // });

        //     it("可购买", async function () {
        //         const { router, owner, otherAccount } = await loadFixture(deployMarketFixture);

        //         // console.log(await otherAccount.getAddress());

        //         expect(await router.connect(otherAccount).swapExactETHForTokens(0, [TokenAddress.Weth, TokenAddress.Smart], otherAccount, deadline, { value: ethers.parseEther("2.00") })).not.to.reverted;
        //     });

        // });

    });

});
