// scripts/create-box.js
const { ethers, upgrades } = require("hardhat");
const { Contract, ContractFactory, parseEther, formatEther, parseUnits, BigNumber, utils } = require("ethers");
const WETH9 = require("@uniswap/v2-periphery/build/WETH9.json");
const factoryArtifact = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");

async function main() {
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
}

main();