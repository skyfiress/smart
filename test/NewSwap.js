const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");


describe("旧币换新", function () {

    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFixture() {
        const [owner, otherAccount] = await ethers.getSigners();
        //swap
        const Token = await ethers.getContractFactory("NewSwap");
        const swap = await Token.deploy(owner, owner);

        //创建代币 USDC 模拟旧币
        const USDC = await ethers.getContractFactory("UsdCoin", owner);
        const usdc = await USDC.deploy();
        const usdcAddress = await usdc.getAddress();
        // console.log(`USDC deployed to ${usdcAddress}`);

        
        //创建代币 USDT 模拟新币
        const USDT = await ethers.getContractFactory("Tether", owner);
        const usdt = await USDT.deploy();
        const usdtAddress = await usdt.getAddress();
        // console.log(`USDT deployed to ${usdtAddress}`);

        // 注入金额
        await usdt.connect(owner).mint(owner.address, ethers.parseEther("10000000"));
        await usdc.connect(owner).mint(owner.address, ethers.parseEther("10000000"));
        const tx = await usdc.connect(owner).transfer(otherAccount, ethers.parseEther("1000"))
        await tx.wait();

        //授权操作
        const MaxUint256 = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        //####新币撒币地址
        const approveTx1 = await usdt.connect(owner).approve(await swap.getAddress(), MaxUint256); 
        await approveTx1.wait();
        //####用户授权旧地址到交换合约
        const approvalTx2 = await usdc.connect(otherAccount).approve(await swap.getAddress(), MaxUint256); 
        await approvalTx2.wait();
    
        return { swap, usdt, usdc, owner, otherAccount };
    }

    describe("操作测试", function () {


        it("以旧换新", async function () {
            const { swap, usdt, usdc, owner, otherAccount } = await loadFixture(deployFixture);

            await expect(swap.connect(otherAccount).swap(await usdc.getAddress(), await usdt.getAddress(), 1000n)).changeTokenBalance(usdt, otherAccount, 1000n);
        });

        
        it("设置新收币地址", async function () {
            const { swap, usdt, usdc, owner, otherAccount } = await loadFixture(deployFixture);

            await expect(swap.setReceiver(otherAccount)).not.to.reverted;
        });

        it("设置新撒币地址", async function () {
            const { swap, usdt, usdc, owner, otherAccount } = await loadFixture(deployFixture);

            await expect(swap.setTransfer(otherAccount)).not.to.reverted;
        });

    });

});
