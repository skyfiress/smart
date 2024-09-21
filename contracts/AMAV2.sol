// SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.24;

import "./AMA.sol";
contract AMAV2 is AMA {
    function version() public pure returns (string memory) {
        return "2.0";
    }
}
