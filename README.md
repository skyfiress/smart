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


Smart upgraded 0xaF96fb3CE523B1A18369cdf31D86b3BEAC938Ba5
Smart implementation Address 0x41aA997Bcfd054326bd78cE7C73eC3370d97fFDd

token address  0xaF96fb3CE523B1A18369cdf31D86b3BEAC938Ba5
✔ 2 proxies ownership transferred through proxy admin
    - 0xaF96fb3CE523B1A18369cdf31D86b3BEAC938Ba5 (transparent)
    - 0x9c2911a07589587b8f3127CacCB8f5eF78D0cB40 (transparent)


✔ 1 proxies ownership transferred through proxy admin
    - 0x9c2911a07589587b8f3127CacCB8f5eF78D0cB40 (transparent)

✔ 1 proxies ownership transferred through proxy admin
    - 0x9c2911a07589587b8f3127CacCB8f5eF78D0cB40 (transparent)

Error: Deployment at address 0x1E3E94A30Be14057Dc2C02bd32ee46Eb462B9F2d is not registered