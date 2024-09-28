// scripts/create-box.js
const { ethers, upgrades } = require("hardhat");


async function main() {
    const Contract = await ethers.getContractFactory("AMA");
    const [owner] = await ethers.getSigners();

    // const contract = await upgrades.deployProxy(Contract, [owner.address, "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"]);
    const contract = await upgrades.deployProxy(Contract, [owner.address, "0xcbce60bad702026d6385e5f449e44099a655d14f", "0xaF96fb3CE523B1A18369cdf31D86b3BEAC938Ba5", "0x757e5af94fC9b3d4035C2e6Cb1fD304F43c0A1A4"]);
    await contract.waitForDeployment();
    console.log("Contract deployed to:", await contract.getAddress());
    const currentImplAddress = await upgrades.erc1967.getImplementationAddress(await contract.getAddress());
    console.log("Contract implementation Address", currentImplAddress);

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