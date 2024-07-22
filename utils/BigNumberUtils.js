// import { BigNumber, utils } from "ethers";
const { BigNumber, utils } = require("ethers");

 
function multiply(bn, number) {
    const bnForSure = BigNumber.from(bn);
    const numberBN = utils.parseUnits(number.toString(), 18);

    let oneBN = utils.parseUnits("1", 18);
    return bnForSure.mul(numberBN).div(oneBN);
}

function divide(bn, number) {
    const bnForSure = BigNumber.from(bn);
    const numberBN = utils.parseUnits(number.toString(), 18);

    let oneBN = utils.parseUnits("1", 18);
    return bnForSure.div(numberBN).div(oneBN);
}