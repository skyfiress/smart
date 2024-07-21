// SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.24;

import "./Smart.sol";
contract SmartV2 is Smart {
    function version() public pure returns (string memory) {
        return "2.0";
    }
}
