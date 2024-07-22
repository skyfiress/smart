// scripts/create-box.js
const { ethers, upgrades } = require("hardhat");

const swapAddress = "0x4c26AA1CC5FD9bf30000D2D0E54D3aBe0F54da73";

async function main() {
  const Contract = await ethers.getContractFactory("Smart");
  const [owner] = await ethers.getSigners();
  const contract = await upgrades.deployProxy(Contract, [owner.address, owner.address]);
  await contract.waitForDeployment();
  console.log("Contract deployed to:", await contract.getAddress());

  if (swapAddress) {
    let approveTx1 = await contract.approve(swapAddress, '115792089237316195423570985008687907853269984665640564039457584007913129639935');
    await approveTx1.wait();
  }

  //添加白名单
  let tx = await contract['setWhiteList(address[],bool)']([
    "0x03C99bd0CBA6E16CcE65971360B9A0AB78064043",
    "0x00DEC34A1f1BE5818A66CAAD10B0291EB4cF52dd",
    "0xDE8fE6ae9d8Ca3F0Bc32Ef10dc998C8a2C4ca68C",
    "0x458A4dc4979900da628D17708c4CbE32AF066086",
    "0x3621738c96839B87Ad6e35EeaEF6adbbf3196E65",
    "0x3696CC298B5301f698BAB9771A384316BF308772",
    "0x6Bd2600f6d22B2b3E7BfAE41A5dAFE0639b9Feee",
    "0x5fec81311F0eFd64b60c6336F5EC396D3A0FA910",
    "0x00b200e4D97dcbE25aDccAB9acF716816a099a5D",
    "0x85aA01BBa441e0300F2B398Ae25D5b07c0BFfB2A"
  ], true);
  await tx.wait();
}

main();