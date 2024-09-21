const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("AMAModule", (m) => {
  const _treasury = m.getParameter("_receiver", "0x00DEC34A1f1BE5818A66CAAD10B0291EB4cF52dd");//金库地址
  const _token0 = m.getParameter("_trannsfer", "0xcbce60bad702026d6385e5f449e44099a655d14f");//ETH
  const _token1 = m.getParameter("_trannsfer", "0xaF96fb3CE523B1A18369cdf31D86b3BEAC938Ba5");//smart
  const _router = m.getParameter("_trannsfer", "0x757e5af94fC9b3d4035C2e6Cb1fD304F43c0A1A4");//路由

  const token = m.contract("AMA", [_treasury, _token0, _token1, _router]);

  return { token };
});
