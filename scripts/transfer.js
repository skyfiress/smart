// scripts/create-box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
    const address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const contract = await ethers.getContractAt("Smart", address);
    const [owner, otherAccount] = await ethers.getSigners();

    console.log("Contract address to:", await contract.getAddress());

    //添加白名单
    let tx = await contract.transfer(otherAccount, ethers.parseEther("1.0"));
    console.log("Contract transfer tx", tx);
    await tx.wait();
}

main();