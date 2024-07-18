// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Importing OpenZeppelin libraries, which provide secure contract templates
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import {ControllableUpgradeable} from "./common/ControllableUpgradeable.sol";

contract Smartp is ControllableUpgradeable, ERC20PermitUpgradeable {
    address public treasury;

    uint public LPWANFee; // 50 = 0.5%, 100 = 1%, 10000 = 100%

    mapping(address => bool) private _inWhitelist;

    address[] private _whitelist;

    uint256[46] private __gap;

    function initialize(
        address _treasury,
        address _recipient,
        uint _defaultLPWANFee
    ) external initializer {
        __Controllable_init();
        __ERC20_init("SmartP", "SmartP");
        __ERC20Permit_init("SmartP");
        treasury = _treasury;
        LPWANFee = _defaultLPWANFee;
        _mint(_recipient, 10000000000 * (10 ** decimals()));

        _inWhitelist[_recipient] = true;
        _whitelist.push(_recipient);
        _inWhitelist[_treasury] = true;
        _whitelist.push(_treasury);
    }

    function upgradeName(
        string memory _name,
        string memory _symbol
    ) public onlyOwner {
        ERC20Storage storage $;
        assembly {
            $.slot := 0x52c63247e1f47db19d5ce0460030c497f067ca4cebf71ba98eeadabe20bace00
        }
        $._name = _name;
        $._symbol = _symbol;
    }

    function addWhiteList(address account) external onlyController {
        _inWhitelist[account] = true;
        _whitelist.push(account);
    }

    function removeWhiteList(address account) external onlyController {
        _inWhitelist[account] = false;
        for (uint i = 0; i < _whitelist.length; i++) {
            if (_whitelist[i] == account) {
                _whitelist[i] = _whitelist[_whitelist.length - 1];
                _whitelist.pop();
                break;
            }
        }
    }

    function _applyFee(uint amount) internal view returns (uint) {
        if (LPWANFee == 0) {
            return 0;
        }
        if (_inWhitelist[_msgSender()]) {
            return 0;
        }
        return (amount * LPWANFee) / 10000;
    }

    function setLPWANFee(uint _LPWANFee) external onlyController {
        LPWANFee = _LPWANFee;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        if (_inWhitelist[from] || _inWhitelist[to]) {
            _transfer(from, to, amount);
        } else {
            uint fee = _applyFee(amount);
            _transfer(from, treasury, fee);
            _transfer(from, to, amount - fee);
        }
        return true;
    }
}
