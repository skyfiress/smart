// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC20BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ControllableUpgradeable is
    OwnableUpgradeable,
    ERC20BurnableUpgradeable
{
    mapping(address => bool) public controllers;

    event ControllerChanged(address indexed controller, bool enabled);

    modifier onlyController() {
        require(
            controllers[msg.sender],
            "Controllable: Caller is not a controller"
        );
        _;
    }

    function setController(address controller, bool enabled) public onlyOwner {
        controllers[controller] = enabled;
        emit ControllerChanged(controller, enabled);
    }

    function __Controllable_init() public onlyInitializing {
        controllers[msg.sender] = true;
        __Ownable_init(msg.sender);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public override onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        assembly {
            sstore(
                0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103,
                newOwner
            )
        }
        _transferOwnership(newOwner);
    }

    receive() external payable {}

    // Function to withdraw all Ether from this contract.
    function withdraw() public onlyOwner {
        // get the amount of Ether stored in this contract
        uint amount = address(this).balance;

        // send all Ether to owner
        // Owner can receive Ether since the address of owner is payable
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Failed to send Ether");
    }

    function withdraw(uint256 amount) public onlyOwner {

        // send all Ether to owner
        // Owner can receive Ether since the address of owner is payable
        (bool success, ) = payable(owner()).call{value: amount}("");
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
