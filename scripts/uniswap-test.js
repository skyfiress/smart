// scripts/create-box.js
const { ethers, upgrades } = require("hardhat");
const { Contract, ContractFactory, parseEther, formatEther, parseUnits, BigNumber, utils } = require("ethers");
const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");

async function main() {
    let TokenAddress = {
        Router: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
        Factory: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
        Pair: "0xa17A7058165761492E206CF798c12B0E7cc482F7",
        Weth: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        Smart: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    }

    const [owner, otherAccount] = await ethers.getSigners();
    const smart = await ethers.getContractAt("Smart", TokenAddress.Smart);
    const smartAddress = await smart.getAddress();
    const router = new Contract(TokenAddress.Router, routerArtifact.abi, owner);
    const pair = new Contract(TokenAddress.Pair, pairArtifact.abi, owner);

    console.log("Contract address to:", await smart.getAddress());
    console.log("Router address to:", await router.getAddress());

    //添加流动性
    const token0Amount = ethers.parseUnits("50000");
    // const token1Amount = ethers.parseUnits("100");

    const deadline = Math.floor(Date.now() / 1000) + 10 * 60;
    // const addLiquidityTx = await router
    //     .connect(owner)
    //     .addLiquidityETH(
    //         smartAddress,
    //         token0Amount,
    //         0,
    //         0,
    //         owner,
    //         deadline,
    //         {
    //             value: ethers.parseEther("500.00")
    //         }
    //     );
    // await addLiquidityTx.wait();
    // reserves = await pair.getReserves();
    // console.log(`Add Reserves: ${reserves[0].toString()}, ${reserves[1].toString()}`);


    //添加流动性
    const tx2 = await smart.connect(owner).transfer(otherAccount, ethers.parseEther("100000000"));
    await tx2.wait();
    const token0Amount2 = ethers.parseUnits("6500");
    // const token1Amount = ethers.parseUnits("100");

    const addLiquidityTx2 = await router
        .connect(otherAccount)
        .addLiquidityETH(
            smartAddress,
            token0Amount2,
            0,
            0,
            otherAccount,
            deadline,
            {
                value: ethers.parseEther("65.00")
            }
        );
    await addLiquidityTx2.wait();
    reserves = await pair.getReserves();
    console.log(`Add Reserves2: ${reserves[0].toString()}, ${reserves[1].toString()}`);

    //删除流动性
    // let liquidity = await pair.balanceOf(otherAccount);
    // const approveTx = await pair.connect(otherAccount).approve(router.getAddress(), ethers.MaxUint256);
    // await approveTx.wait();

    // let tx = await router.connect(otherAccount).removeLiquidityETH(smart.getAddress(), liquidity, 0, 0, otherAccount, deadline);
    // await tx.wait();

    // reserves = await pair.getReserves();
    // console.log(`Remove Reserves: ${reserves[0].toString()}, ${reserves[1].toString()}`);
}

main();