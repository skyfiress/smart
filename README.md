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
<br>
function _transfer(address from, address to, uint256 value) internal
<br>
变更为：
<br>
function _transfer(address from, address to, uint256 value) internal virtual

合约验证：
1.先验证
@openzeppelin\contracts\proxy\transparent\TransparentUpgradeableProxy.sol
2.验证所要合约
在 remix 上复制 compilerInput 详情 保存为json文件