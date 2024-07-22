const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { Contract, ContractFactory, parseEther, formatEther, parseUnits, BigNumber, utils } = require("ethers");
const WETH9 = require("@uniswap/v2-periphery/build/WETH9.json");
const factoryArtifact = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");


function multiply(bn, number) {
    const bnForSure = BigNumber.from(bn);
    const numberBN = utils.parseUnits(number.toString(), 18);

    let oneBN = utils.parseUnits("1", 18);
    return bnForSure.mul(numberBN).div(oneBN);
}

describe("Swap", function () {

    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFixture() {
        const [owner, otherAccount] = await ethers.getSigners();
        //Smart
        const Smart = await ethers.getContractFactory("Smart");
        const smart = await upgrades.deployProxy(Smart, [owner.address, owner.address]);
        await smart.waitForDeployment();
        let smartAddress = await smart.getAddress();

        //创建WETH
        const Weth = new ContractFactory(
            WETH9.abi,
            WETH9.bytecode,
            owner
        );
        const weth = await Weth.deploy();
        // await weth.deposit({ value: ethers.parseEther("100.0") });
        let wethAddress = await weth.getAddress();

        //工厂合约
        const Factory = new ContractFactory(
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
        const Router = new ContractFactory(
            routerArtifact.abi,
            routerArtifact.bytecode,
            owner
        );

        const router = await Router.deploy(await factory.getAddress(), await weth.getAddress());
        const routerAddress = await router.getAddress();

        //打印合约地址
        console.log(`Router: ${routerAddress}`);
        console.log("Factory: ", await factory.getAddress());
        console.log("Pair: ", pairAddress);
        console.log("Weth: ", wethAddress);
        console.log("Smart: ", smartAddress);

        let reserves = await pair.getReserves();
        console.log(`Reserves: ${reserves[0].toString()}, ${reserves[1].toString()}`); //This should be 0,0 since we haven't provided the liquidity to the pair / pool yet.

        const MaxUint256 = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

        const approveTx1 = await smart.approve(routerAddress, MaxUint256);
        await approveTx1.wait();
        const approvalTx2 = await weth.approve(routerAddress, MaxUint256);
        await approvalTx2.wait();

        //添加流动性
        const token0Amount = ethers.parseUnits("50000");
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
            .addLiquidityETH(
                smartAddress,
                token0Amount,
                0,
                0,
                owner,
                deadline,
                {
                    value: ethers.parseEther("500.00")
                }
            );
        await addLiquidityTx.wait();
        reserves = await pair.getReserves();
        console.log(`Reserves: ${reserves[0].toString()}, ${reserves[1].toString()}`);

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

        console.log("#########################");
        return { router, factory, pair, smart, weth, owner, otherAccount };
    }

    describe("交易所测试", function () {


        describe("白名单用户", function () {

            const deadline = Math.floor(Date.now() / 1000) + 10 * 60;

            it("可购买", async function () {
                const { router, factory, pair, smart, weth, owner, otherAccount } = await loadFixture(deployFixture);

                await expect(await router.swapExactETHForTokens(0, [weth.getAddress(), smart.getAddress()], owner, deadline, { value: ethers.parseEther("2.00") })).not.to.be.reverted;
            });

            it("可出售", async function () {
                const { router, factory, pair, smart, weth, owner, otherAccount } = await loadFixture(deployFixture);
                await expect(await router.swapExactTokensForETH(ethers.parseEther("100.0"), 0, [smart.getAddress(), weth.getAddress()], owner, deadline)).not.to.be.reverted;
            });

            it("删除流动性", async function () {
                const { router, factory, pair, smart, weth, owner, otherAccount } = await loadFixture(deployFixture);

                let liquidity = await pair.balanceOf(owner);
                const approveTx = await pair.approve(router.getAddress(), ethers.MaxUint256);
                await approveTx.wait();

                await expect(await router.removeLiquidityETH(smart.getAddress(), liquidity, 0, 0, owner, deadline)).not.to.be.reverted;
            });

        });

        describe("普通用户", function () {

            const deadline = Math.floor(Date.now() / 1000) + 10 * 60;

            it("不可购买", async function () {
                const { router, factory, pair, smart, weth, owner, otherAccount } = await loadFixture(deployFixture);

                // console.log(await otherAccount.getAddress());

                let result = await router.connect(otherAccount).swapExactETHForTokens(0, [weth.getAddress(), smart.getAddress()], otherAccount, deadline, { value: ethers.parseEther("2.00") });
                await expect(result).to.reverted;
            });


            it("6.5%手续费出售", async function () {
                const { router, factory, pair, smart, weth, owner, otherAccount } = await loadFixture(deployFixture);
                const amounts = await router.getAmountsIn(ethers.parseEther("1.0"), [smart.getAddress(), weth.getAddress()])

                // console.log(amounts);
                // const amountInMax = parseFloat(parseUnits(, 12)) * 1.65 / 1000000;

                let amountInMax = amounts[0] * 1065n / 1000n
                // console.log(amountInMax);
                expect(await router.connect(otherAccount).swapTokensForExactETH(ethers.parseEther("1.0"), amountInMax, [smart.getAddress(), weth.getAddress()], otherAccount, deadline)).not.to.be.reverted;
            });


            it("10%出售", async function () {
                const { router, factory, pair, smart, weth, owner, otherAccount } = await loadFixture(deployFixture);
                // console.log(await otherAccount.getAddress());
                expect(await router.connect(otherAccount).swapExactTokensForETHSupportingFeeOnTransferTokens(ethers.parseEther("100.0"), 0, [smart.getAddress(), weth.getAddress()], otherAccount, deadline)).not.to.be.reverted;
            });


            it("可手续费出售", async function () {
                const { router, factory, pair, smart, weth, owner, otherAccount } = await loadFixture(deployFixture);
                // console.log(await otherAccount.getAddress());
                expect(await router.connect(otherAccount).swapExactTokensForETHSupportingFeeOnTransferTokens(ethers.parseEther("100.0"), 0, [smart.getAddress(), weth.getAddress()], otherAccount, deadline)).not.to.be.reverted;
            });


            // it("可精准出售", async function () {
            //     const { router, factory, pair, smart, weth, owner, otherAccount } = await loadFixture(deployFixture);
            //     // console.log(await otherAccount.getAddress());
            //     expect(await router.connect(otherAccount).swapExactTokensForETH(ethers.parseEther("100.0"), 0, [smart.getAddress(), weth.getAddress()], otherAccount, deadline)).not.to.be.reverted;
            // });


            // it("可出售到Pair", async function () {
            //     const { router, factory, pair, smart, weth, owner, otherAccount } = await loadFixture(deployFixture);
            //     let tx = await smart.setTreasuryAddress(await pair.getAddress())
            //     await tx.wait();

            //     expect(await router.connect(otherAccount).swapExactTokensForETH(ethers.parseEther("100.0"), 0, [smart.getAddress(), weth.getAddress()], otherAccount, deadline)).not.to.be.reverted;
            // });


            it("添加流动性", async function () {
                const { router, factory, pair, smart, weth, owner, otherAccount } = await loadFixture(deployFixture);
                // console.log(await otherAccount.getAddress());
                let smartAddress = await smart.getAddress();
                const token0Amount = ethers.parseUnits("50000");
                const addLiquidityTx = await router
                    .connect(otherAccount)
                    .addLiquidityETH(
                        smartAddress,
                        token0Amount,
                        0,
                        0,
                        otherAccount,
                        deadline,
                        {
                            value: ethers.parseEther("500.00")
                        }
                    );
                // await addLiquidityTx.wait();
                // reserves = await pair.getReserves();

                expect(addLiquidityTx).not.to.be.reverted;
            });

            it("删除流动性", async function () {
                const { router, factory, pair, smart, weth, owner, otherAccount } = await loadFixture(deployFixture);
                // console.log(await otherAccount.getAddress());
                let smartAddress = await smart.getAddress();
                const token0Amount = ethers.parseUnits("50000");
                const addLiquidityTx = await router
                    .connect(otherAccount)
                    .addLiquidityETH(
                        smartAddress,
                        token0Amount,
                        0,
                        0,
                        otherAccount,
                        deadline,
                        {
                            value: ethers.parseEther("500.00")
                        }
                    );
                await addLiquidityTx.wait();
                // reserves = await pair.getReserves();
                let liquidity = await pair.balanceOf(owner);
                const approveTx = await pair.approve(router.getAddress(), ethers.MaxUint256);
                await approveTx.wait();

                await expect(await router.removeLiquidityETH(smart.getAddress(), liquidity, 0, 0, owner, deadline)).not.to.be.reverted;
            });


        });

    });

});
