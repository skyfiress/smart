// SPDX-License-Identifier: Unlicensed
// 1:1 代币兑换
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract NewSwap {
    address public receiver; //oldToken receiver Token
    address public trannsfer; //oldToken receiver Token

    address public owner; //oldToken receiver Token

    bool public enable; //oldToken receiver Token
    modifier onlyOwner() {
        require(
            owner == msg.sender,
            "Controllable: Caller is not a controller"
        );
        _;
    }

    constructor(address _receiver, address _trannsfer) {
        owner = msg.sender;
        receiver = _receiver;
        trannsfer = _trannsfer;

        enable = true;
    }

    function setReceiver(address newAddress) public onlyOwner {
        receiver = newAddress;
    }

    function setTransfer(address newAddress) public onlyOwner {
        trannsfer = newAddress;
    }

    function swap(address oldToken, address newToken, uint256 amount) public {
        require(enable, "Forbid");
        IERC20(oldToken).transferFrom(msg.sender, receiver, amount);
        IERC20(newToken).transferFrom(trannsfer, msg.sender, amount);
    }

    receive() external payable {}

    // Function to withdraw all Ether from this contract.
    function withdraw() public onlyOwner {
        // get the amount of Ether stored in this contract
        uint amount = address(this).balance;

        // send all Ether to owner
        // Owner can receive Ether since the address of owner is payable
        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Failed to send Ether");
    }

    function rescueTokens(
        address token,
        address to,
        uint256 amount
    ) public onlyOwner {
        IERC20(token).transfer(to, amount);
    }
}
