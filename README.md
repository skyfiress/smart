# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```
node_modules\@openzeppelin\contracts-upgradeable\token\ERC20\ERC20Upgradeable.sol
function _transfer(address from, address to, uint256 value) internal
变更为：
function _transfer(address from, address to, uint256 value) internal virtual