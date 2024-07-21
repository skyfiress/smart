const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("LockModule", (m) => {
  const _receiver = m.getParameter("_receiver", "0x00DEC34A1f1BE5818A66CAAD10B0291EB4cF52dd");
  const _trannsfer = m.getParameter("_trannsfer", "0x00DEC34A1f1BE5818A66CAAD10B0291EB4cF52dd");

  const token = m.contract("NewSwap", [_receiver, _trannsfer]);

  return { token };
});
