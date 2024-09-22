const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const WETH9 = require("@uniswap/v2-periphery/build/WETH9.json");
const factoryArtifact = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { Contract, ContractFactory, parseEther, formatEther, parseUnits, BigNumber, utils } = require("ethers");


describe("Smart", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployUniswapFixture() {
        const [owner, otherAccount] = await ethers.getSigners();
        //Smart
        const Smart = await ethers.getContractFactory("Smart");
        const smart = await upgrades.deployProxy(Smart, [
            owner.address,
            owner.address,
        ]);
        await smart.waitForDeployment();
        let smartAddress = await smart.getAddress();

        //创建WETH
        const Weth = new ethers.ContractFactory(WETH9.abi, WETH9.bytecode, owner);
        const weth = await Weth.deploy();
        // await weth.deposit({ value: ethers.parseEther("100.0") });
        let wethAddress = await weth.getAddress();

        //工厂合约
        const Factory = new ethers.ContractFactory(
            factoryArtifact.abi,
            factoryArtifact.bytecode,
            owner
        );
        const factory = await Factory.deploy(owner.address);

        //创建 pair 对
        const tx1 = await factory.createPair(smartAddress, wethAddress);
        await tx1.wait(); //创建
        const pairAddress = await factory.getPair(smartAddress, wethAddress);
        // console.log(`Pair deployed to ${pairAddress}`);

        // Initialize a new contract instance for the trading pair using its address and ABI.
        const pair = new Contract(pairAddress, pairArtifact.abi, owner);

        //创建路由
        const Router = new ethers.ContractFactory(
            routerArtifact.abi,
            routerArtifact.bytecode,
            owner
        );

        const router = await Router.deploy(
            await factory.getAddress(),
            await weth.getAddress()
        );
        const routerAddress = await router.getAddress();

        //打印合约地址
        console.log(`Router: ${routerAddress}`);
        console.log("Factory: ", await factory.getAddress());
        console.log("Pair: ", pairAddress);
        console.log("Weth: ", wethAddress);
        console.log("Smart: ", smartAddress);

        let reserves = await pair.getReserves();
        console.log(
            `Reserves: ${reserves[0].toString()}, ${reserves[1].toString()}`
        ); //This should be 0,0 since we haven't provided the liquidity to the pair / pool yet.

        const MaxUint256 =
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

        const approveTx1 = await smart.approve(routerAddress, MaxUint256);
        await approveTx1.wait();
        const approvalTx2 = await weth.approve(routerAddress, MaxUint256);
        await approvalTx2.wait();

        //添加流动性
        const token0Amount = ethers.parseUnits("500000");
        // const token1Amount = ethers.parseUnits("100");

        const deadline = Math.floor(Date.now() / 1000) + 10 * 60;
        // const addLiquidityTx = await router
        //     .connect(owner)
        //     .addLiquidity(
        //         usdtAddress,
        //         usdcAddress,
        //         token0Amount,
        //         token1Amount,
        //         0,
        //         0,
        //         owner,
        //         deadline
        //     );
        // await addLiquidityTx.wait();
        const addLiquidityTx = await router
            .connect(owner)
            .addLiquidityETH(smartAddress, token0Amount, 0, 0, owner, deadline, {
                value: ethers.parseEther("5000.00"),
            });
        await addLiquidityTx.wait();
        reserves = await pair.getReserves();
        console.log(
            `Reserves: ${reserves[0].toString()}, ${reserves[1].toString()}`
        );

        //用户2 授权和 初始一定数量代币
        const tx2 = await smart.connect(owner).transfer(otherAccount, ethers.parseEther("100000000"));
        await tx2.wait();

        //普通用户交易所授权
        const approveTxOther1 = await smart.connect(otherAccount).approve(routerAddress, MaxUint256);
        await approveTxOther1.wait();
        const approveTxOther2 = await weth.connect(otherAccount).approve(routerAddress, MaxUint256);
        await approveTxOther2.wait();

        //添加交易所 -- 注池地址
        const marketTx = await smart.setMarketPair(pairAddress, true);
        await marketTx.wait();

        //添加交易所 -- 路由地址
        const routerTx = await smart.setRouter(routerAddress, true);
        await routerTx.wait();

        return { router, factory, pair, weth, smart };
    }

    async function deployContractFixture() {
        const Contract = await ethers.getContractFactory("AMA"); //0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82
        const [owner, otherAccount] = await ethers.getSigners();
        const { router, factory, pair, weth, smart } = await loadFixture(deployUniswapFixture);

        const token = await upgrades.deployProxy(Contract, [
            owner.address,
            await weth.getAddress(),
            await smart.getAddress(),
            await router.getAddress(),
        ]);
        await token.waitForDeployment();
        await token.rescueTokens(await token.getAddress(), owner, 50_000_000_000_000_000_000_000n);
        return { token, owner, otherAccount, router, factory, pair, weth, smart };
    }

    describe("部署测试", function () {
        it("可升级", async function () {
            const { token, owner } = await loadFixture(deployContractFixture);
            const TokenV2 = await ethers.getContractFactory("AMAV2");
            const upgraded = await upgrades.upgradeProxy(
                await token.getAddress(),
                TokenV2
            );
            const value = await upgraded.version();
            expect(value.toString()).to.equal("2.0");
        });

        it("正确的管理员地址", async function () {
            const { token, owner } = await loadFixture(deployContractFixture);

            expect(await token.owner()).to.equal(owner.address);
        });

        it("正确的代币名称和符号", async function () {
            const { token, owner } = await loadFixture(deployContractFixture);

            expect(await token.name()).to.equal("AMA");
            expect(await token.symbol()).to.equal("AMA");
        });

        it("正确的代币发行量", async function () {
            const { token, owner } = await loadFixture(deployContractFixture);

            expect(await token.totalSupply()).to.equal(
                5_000_000_000_000_000_000_000_000n
            );
        });

        it("正确的滑点和手续费", async function () {
            const { token, owner } = await loadFixture(deployContractFixture);

            expect(await token.LPWANFee()).to.equal(300n);
            expect(await token.totalTaxIfBuying()).to.equal(300n);
            expect(await token.totalTaxIfSelling()).to.equal(300n);
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
            const { token, owner, otherAccount } = await loadFixture(
                deployContractFixture
            );

            await expect(token.transfer(otherAccount, 100n)).to.emit(
                token,
                "Transfer"
            );
        });
        it("转账", async function () {
            const { token, owner, otherAccount } = await loadFixture(
                deployContractFixture
            );

            await expect(token.transfer(otherAccount, 100n)).to.changeTokenBalances(token, [owner, otherAccount], [-100n, 100n]);
        });
        it("转账0金额", async function () {
            const { token, owner, otherAccount } = await loadFixture(deployContractFixture);

            await expect(token.transfer(otherAccount.address, 0n)).not.to.be.reverted;
        });
        it("转账0地址", async function () {
            const { token, owner, otherAccount } = await loadFixture(deployContractFixture);

            await expect(token.transfer(ethers.ZeroAddress, 100n))
                .to.be.revertedWithCustomError(token, "ERC20InvalidReceiver")
                .withArgs(ethers.ZeroAddress);
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

            const MaxUint256 =
                "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
            let tx = await token.connect(otherAccount).approve(owner, MaxUint256);
            await tx.wait();
            await expect(
                token.connect(owner).transferFrom(otherAccount, owner, 100n)
            ).to.changeTokenBalances(token, [owner, otherAccount], [100n, -100n]);
        });
        it("修改名称", async function () {
            const { token, owner, otherAccount } = await loadFixture(deployContractFixture);

            await token.upgradeName("newToken", "newToken");

            await expect(await token.name()).to.equal("newToken");
            await expect(await token.symbol()).to.equal("newToken");
        });
        it("提取ETH", async function () {
            const { token, owner, otherAccount } = await loadFixture(deployContractFixture);

            let tx = await otherAccount.sendTransaction({
                to: await token.getAddress(),
                value: 100n
            })
            // await tx.wait();
            await expect(tx).changeEtherBalance(otherAccount, -100n)

            await expect(await token['withdraw(uint256)'](100n)).to.changeEtherBalance(owner, 100n)

        });
        it("提取其他TOKEN", async function () {
            const { token, owner, otherAccount, smart } = await loadFixture(deployContractFixture);

            let tx = smart.connect(otherAccount).transfer(await token.getAddress(), 100n)
            await expect(tx).changeTokenBalance(smart, otherAccount, -100n)

            await expect(await token.rescueTokens(await smart.getAddress(), owner, 100n)).to.changeTokenBalance(smart, owner, 100n)

        });
        it("设置注池用户", async function () {
            const { token, owner, otherAccount } = await loadFixture(
                deployContractFixture
            );

            await expect(
                await token.setPoolers([owner, otherAccount], [10000n, 20000n])
            ).not.to.reverted;
        });
        async function deployDepositFixture() {
            const { token, owner, otherAccount, smart } = await loadFixture(
                deployContractFixture
            );

            const MaxUint256 = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
            let tx = await smart.connect(owner).approve(await token.getAddress(), MaxUint256);
            await tx.wait();
            // await expect(await tx2).not.to.reverted;
            tx = await smart.connect(otherAccount).approve(await token.getAddress(), MaxUint256);
            await tx.wait();

            tx = await token.connect(owner).deposit(ethers.parseEther("10000"), {
                value: ethers.parseEther("2000"),
            });
            await tx.wait();

            tx = await token.connect(otherAccount).deposit(ethers.parseEther("20000"), {
                value: ethers.parseEther("4000"),
            });
            await tx.wait();

            await expect(tx).not.to.reverted;
            await expect(tx).to.emit(token, 'Deposit')
            await expect(await token.pledgeOf(otherAccount)).to.equal(parseEther("20000"));

            return { token, owner, otherAccount, smart};
        }
    
        it("质押", async function () {
            const { token, owner, otherAccount } = await loadFixture(deployDepositFixture);
        });
        it("赎回", async function () {
            const { token, owner, otherAccount } = await loadFixture(deployDepositFixture);

            let tx3 = await token.connect(otherAccount).redeem(parseEther("100"))
            await expect(tx3).not.to.reverted;
        });
        it("结算", async function () {
            const { token, owner, otherAccount } = await loadFixture(deployDepositFixture);
            

            let tx = await token.connect(owner).settle()
            await expect(tx).not.to.reverted;
            await expect(tx).to.emit(token, 'Transfer');
        });
        
    });
});
