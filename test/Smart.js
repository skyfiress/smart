const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Smart", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployContractFixture() {
        const Contract = await ethers.getContractFactory("Smart");
        const [owner, otherAccount] = await ethers.getSigners();
        const token = await upgrades.deployProxy(Contract, [owner.address, owner.address]);
        await token.waitForDeployment();
        return { token, owner, otherAccount };
    }

    describe("部署测试", function () {

        it("可升级", async function () {
            const { token, owner } = await loadFixture(deployContractFixture);
            const TokenV2 = await ethers.getContractFactory("SmartV2");
            const upgraded = await upgrades.upgradeProxy(await token.getAddress(), TokenV2);
            const value = await upgraded.version();
            expect(value.toString()).to.equal('2.0');
        });

        it("正确的管理员地址", async function () {
            const { token, owner } = await loadFixture(deployContractFixture);

            expect(await token.owner()).to.equal(owner.address);
        });

        it("正确的代币名称和符号", async function () {
            const { token, owner } = await loadFixture(deployContractFixture);

            expect(await token.name()).to.equal("Smart");
            expect(await token.symbol()).to.equal("Smart");
        });

        it("正确的代币发行量", async function () {
            const { token, owner } = await loadFixture(deployContractFixture);

            expect(await token.totalSupply()).to.equal(10_000_000_000_000_000_000_000_000_000n);
        });

        it("正确的滑点和手续费", async function () {
            const { token, owner } = await loadFixture(deployContractFixture);

            expect(await token.LPWANFee()).to.equal(300n);
            expect(await token.totalTaxIfBuying()).to.equal(0n);
            expect(await token.totalTaxIfSelling()).to.equal(300n);
            expect(await token.burnRatio()).to.equal(600n);
        });

        it("不可购买", async function () {
            const { token, owner } = await loadFixture(deployContractFixture);

            await expect(await token.permitSwapBuying()).to.be.false;
        });

        it("可出售", async function () {
            const { token, owner } = await loadFixture(deployContractFixture);

            await expect(await token.permitSwapSelling()).to.be.true;
        });

    });

    describe("操作测试", function () {
        it("转账事件", async function () {
            const { token, owner, otherAccount } = await loadFixture(deployContractFixture);

            await expect(token.transfer(otherAccount, 100n)).to.emit(token, "Transfer");
        });
        it("转账", async function () {
            const { token, owner, otherAccount } = await loadFixture(deployContractFixture);

            await expect(token.transfer(otherAccount, 100n)).to.changeTokenBalances(token, [owner, otherAccount], [-100n, 100n]);
        });
        it("转账0金额", async function () {
            const { token, owner, otherAccount } = await loadFixture(deployContractFixture);

            await expect(token.transfer(otherAccount.address, 0n)).not.to.be.reverted;
        });
        it("转账0地址", async function () {
            const { token, owner, otherAccount } = await loadFixture(deployContractFixture);

            await expect(token.transfer(ethers.ZeroAddress, 100n)).to.be.revertedWithCustomError(token, "ERC20InvalidReceiver").withArgs(ethers.ZeroAddress)
        });
        it("可销毁", async function () {
            const { token, owner, otherAccount } = await loadFixture(deployContractFixture);

            await expect(token.burn(100n)).not.to.be.reverted;
            await expect(token.burn(100n)).to.changeTokenBalance(token, owner, -100n);
        });
        it("授权转账", async function () {
            const { token, owner, otherAccount } = await loadFixture(deployContractFixture);
            let tx1 = await token.connect(owner).transfer(otherAccount, 100n);
            await tx1.wait();

            const MaxUint256 = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
            let tx = await token.connect(otherAccount).approve(owner, MaxUint256);
            await tx.wait();
            await expect(token.connect(owner).transferFrom(otherAccount, owner, 100n)).to.changeTokenBalances(token, [owner, otherAccount], [100n, -100n]);
        });
        it("修改名称", async function () {
            const { token, owner, otherAccount } = await loadFixture(deployContractFixture);

            await token.upgradeName("newToken", "newToken")

            await expect(await token.name()).to.equal("newToken")
            await expect(await token.symbol()).to.equal("newToken")
        });
    });
});
