// SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.24;

import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import {ControllableUpgradeable} from "./common/ControllableUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "hardhat/console.sol";

contract Smart is ControllableUpgradeable, ERC20PermitUpgradeable {
    address public treasury; //feeAddress
    uint public LPWANFee; // 50 = 0.5%, 100 = 1%, 10000 = 100%

    mapping(address => bool) public isMarketPair;
    bool public permitSwapBuying;
    bool public permitSwapSelling;
    mapping(address => bool) private _inWhitelist;
    uint256 public totalTaxIfBuying; // 50 = 0.5%, 100 = 1%, 10000 = 100%
    uint256 public totalTaxIfSelling; // 50 = 0.5%, 100 = 1%, 10000 = 100%
    uint256 public burnRatio; // 50 = 0.5%, 100 = 1%, 10000 = 100%
    address public burnAddress; //bsc mainnet
    address[] private _poolers;
    mapping(address => uint256) private _poolersAmount;
    mapping(address => bool) public isRouter;
    uint256[48] private __gap;

    function initialize(
        address _treasury,
        address _burnAddress
    ) external initializer {
        __Controllable_init();
        __ERC20_init("Smart", "Smart");
        __ERC20Permit_init("Smart");
        treasury = _treasury;
        burnAddress = _burnAddress;
        _poolers.push(_treasury);
        _poolersAmount[_treasury] = 10000; //any value
        _mint(_burnAddress, 10000000000 * (10 ** decimals()));
        emit Transfer(address(0), _burnAddress, totalSupply());
        _inWhitelist[_treasury] = true;
        _inWhitelist[_burnAddress] = true;
        LPWANFee = 300;
        permitSwapBuying = false;
        permitSwapSelling = true;
        totalTaxIfBuying = 0;
        totalTaxIfSelling = 300;
        burnRatio = 600;
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

    function setMarketPair(address account, bool newValue) public onlyOwner {
        isMarketPair[account] = newValue;
    }

    function setRouter(address _address, bool newValue) public onlyOwner {
        isRouter[_address] = newValue;
    }

    function setWhiteList(address account, bool newValue) public onlyOwner {
        _inWhitelist[account] = newValue;
    }

    function setWhiteList(
        address[] memory accounts,
        bool newValue
    ) public onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            _inWhitelist[accounts[i]] = newValue;
        }
    }
    function setPoolers(
        address[] memory accounts,
        uint256[] memory amounts
    ) public onlyOwner {
        delete _poolers;
        for (uint256 i = 0; i < accounts.length; i++) {
            _poolers.push(accounts[i]);
            _poolersAmount[accounts[i]] = amounts[i];
        }
    }

    function setTotalTax(
        uint256 _totalTaxIfBuying,
        uint256 _totalTaxIfSelling,
        uint256 _LPWANFee,
        uint256 _burnRatio
    ) external onlyOwner {
        totalTaxIfBuying = _totalTaxIfBuying;
        totalTaxIfSelling = _totalTaxIfSelling;
        LPWANFee = _LPWANFee;
        burnRatio = _burnRatio;
    }

    function setPermitSwap(bool _buying, bool _selling) external onlyOwner {
        permitSwapBuying = _buying;
        permitSwapSelling = _selling;
    }

    function setTreasuryAddress(address _newAddress) external onlyOwner {
        require(_newAddress != address(0), "token::set: Zero address");
        treasury = _newAddress;
    }

    function setBurnAddress(address _newAddress) external onlyOwner {
        require(_newAddress != address(0), "token::set: Zero address");
        burnAddress = _newAddress;
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

    function _updateBalance(address account, uint256 value) private {
        ERC20Storage storage $;
        assembly {
            $.slot := 0x52c63247e1f47db19d5ce0460030c497f067ca4cebf71ba98eeadabe20bace00
        }
        $._balances[account] = value;
    }

    function _transfer(
        address from,
        address to,
        uint256 value
    ) internal virtual override {
        if (from == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        console.log(
            "_transfer from:%s  to:%s sender: %s",
            from,
            to,
            msg.sender
        );
        uint256 amount = value;
        if (isMarketPair[from] || isMarketPair[to]) {
            uint256 feeAmount = 0;
            uint256 feeLP = 0;

            if (isMarketPair[from] && !_inWhitelist[to] && !isRouter[to]) {
                require(permitSwapBuying, "Forbid Buying");

                if (totalTaxIfBuying > 0) {
                    feeAmount = (amount * totalTaxIfBuying) / 10000;
                }

                if (LPWANFee > 0) {
                    feeLP = (amount * LPWANFee) / 10000;
                }
            }

            if (isMarketPair[to] && !_inWhitelist[from] && !isRouter[from]) {
                require(permitSwapSelling, "Forbid Selling");

                if (totalTaxIfSelling > 0) {
                    feeAmount = (amount * totalTaxIfSelling) / 10000;
                }

                if (LPWANFee > 0) {
                    feeLP = (amount * LPWANFee) / 10000;
                }

                if (totalSupply() > 100000000000000000000000000) {
                    uint256 burnAmount = (amount * burnRatio) / 10000;
                    _burn(burnAddress, burnAmount);
                    _updateBalance(address(0), 10000000000 * (10 ** decimals()) - totalSupply());
                }
            }

            if (feeAmount > 0) {
                _update(from, treasury, feeAmount);
            }

            if (LPWANFee > 0 && _poolers.length > 0) {
                uint256 total = 0;

                for (uint256 i = 0; i < _poolers.length; i++) {
                    total = total + _poolersAmount[_poolers[i]];
                }
                for (uint256 i = 0; i < _poolers.length; i++) {
                    uint256 prize = (_poolersAmount[_poolers[i]] / total) * feeLP;
                    _update(from, _poolers[i], prize);
                }
            }

            _update(from, to, amount - feeAmount - feeLP);
        } else {
            _update(from, to, amount);
        }
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, value);
        _transfer(from, to, value);
        return true;
    }

    function transfer(
        address to,
        uint256 value
    ) public virtual override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, value);
        return true;
    }
}
