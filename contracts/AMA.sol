// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import {ControllableUpgradeable} from "./common/ControllableUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "./common/SafeAddressArr.sol";
import "hardhat/console.sol";

contract AMA is ControllableUpgradeable, ERC20PermitUpgradeable {
    using SafeERC20 for IERC20;
    using SafeAddressArr for address[];
    address public treasury; //feeAddress
    uint public LPWANFee; // 50 = 0.5%, 100 = 1%, 10000 = 100%

    mapping(address => bool) public isMarketPair;
    bool public permitSwapBuying;
    bool public permitSwapSelling;
    mapping(address => bool) private _inWhitelist;
    uint256 public totalTaxIfBuying; // 50 = 0.5%, 100 = 1%, 10000 = 100%
    uint256 public totalTaxIfSelling; // 50 = 0.5%, 100 = 1%, 10000 = 100%
    address public token0; //WEth
    address public token1; //Smart
    address public router; //route
    address[] public poolers;
    mapping(address => uint256) private poolersAmount;
    mapping(address => bool) public isRouter;
    address[] public pledgers;
    mapping(address => uint256) public pledgeOf;
    uint256 public totalPledge;
    uint256 public day;    
    event Deposit(address indexed account, uint256 amount, uint256 smart);
    event Settle();
    uint256[48] private __gap;

    function initialize(
        address _treasury,
        address _token0,
        address _token1,
        address _router
    ) external initializer {
        __Controllable_init();
        __ERC20_init("AMA", "AMA");
        __ERC20Permit_init("AMA");
        treasury = _treasury;
        _mint(address(this), 5000000 * (10 ** decimals()));
        _inWhitelist[_treasury] = true;
        _inWhitelist[_msgSender()] = true;
        LPWANFee = 300;
        permitSwapBuying = false;
        permitSwapSelling = true;
        totalTaxIfBuying = 300;
        totalTaxIfSelling = 300;
        token0 = _token0;
        token1 = _token1;
        router = _router;
        setRouter(_router, true);
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
        delete poolers;
        for (uint256 i = 0; i < accounts.length; i++) {
            poolers.push(accounts[i]);
            poolersAmount[accounts[i]] = amounts[i];
        }
    }

    function setTotalTax(
        uint256 _totalTaxIfBuying,
        uint256 _totalTaxIfSelling,
        uint256 _LPWANFee
    ) external onlyOwner {
        totalTaxIfBuying = _totalTaxIfBuying;
        totalTaxIfSelling = _totalTaxIfSelling;
        LPWANFee = _LPWANFee;
    }

    function setPermitSwap(bool _buying, bool _selling) external onlyOwner {
        permitSwapBuying = _buying;
        permitSwapSelling = _selling;
    }

    function setTreasuryAddress(address _newAddress) external onlyOwner {
        require(_newAddress != address(0), "token::set: Zero address");
        treasury = _newAddress;
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
            }

            if (feeAmount > 0) {
                _update(from, treasury, feeAmount);
            }

            if (feeLP > 0 && poolers.length > 0) {
                uint256 total = 0;

                for (uint256 i = 0; i < poolers.length; i++) {
                    total = total + poolersAmount[poolers[i]];
                }
                for (uint256 i = 0; i < poolers.length; i++) {
                    uint256 prize = (feeLP * poolersAmount[poolers[i]]) / total;
                    _update(from, poolers[i], prize);
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

    function deposit(uint256 amount) public payable returns (bool) {
        require(amount > 0, "amount must gt 0");

        uint256 amount0 = (amount * 2000) / 10000; //20% mxc
        if (msg.value < amount0) {
            revert ERC20InsufficientBalance(_msgSender(), msg.value, amount0);
        }

        totalPledge += amount;

        uint256 amount1 = (amount * 8000) / 10000; //80% smart
        address[] memory t = new address[](2);
        t[0] = token1;
        t[1] = token0;
        // smart -> weth
        uint256[] memory amounts = IUniswapV2Router02(router).getAmountsIn(
            amount1,
            t
        );

        //amounts[0] smart
        IERC20(token1).safeTransferFrom(
            _msgSender(),
            address(this),
            amounts[0]
        );

        // IERC20(token0).safeTransferFrom(_msgSender(), address(this), amount0);
        pledgers.addUnique(_msgSender());
        pledgeOf[_msgSender()] += amount;

        emit Deposit(_msgSender(), amount, amounts[0]);
        return true;
    }

    function redeem(uint256 amount) public returns (bool) {                
        if (pledgeOf[_msgSender()] < amount) {
            revert ERC20InsufficientBalance(_msgSender(), pledgeOf[_msgSender()], amount);
        }
        totalPledge -= amount;
        pledgeOf[_msgSender()] -= amount;
        if (pledgeOf[_msgSender()] <= 0) {
            pledgers.remove(_msgSender());
        }

        uint256 redeemAmount = (amount * 2000) / 10000; //20% mxc;
        (bool success, ) = payable(_msgSender()).call{value: redeemAmount}("");
        require(success, "Failed to redeem Deposit");
        return true;
    }

    function settle() public onlyController returns (bool) {
        //first year 500W. day prize:13698.630137
        //second year 300W. day prize:8219.178082
        //third year 200W. day prize:547.945205
        day = day + 1;
        if (day == 366) {
            _mint(address(this), 3000000 * (10 ** decimals()));
        } else if (day == 731) {
            _mint(address(this), 2000000 * (10 ** decimals()));
        }
        uint256 todayPrize;
        if (balanceOf(address(this)) < todayPrize) {
            revert ERC20InsufficientBalance(address(this), balanceOf(address(this)), todayPrize);
        }
        if (day > 1095) {
            todayPrize = 0;
            return false;
        } else if (day > 730) {
            todayPrize = (2000000 * (10 ** decimals())) / 365;
        } else if (day > 365) {
            todayPrize = (3000000 * (10 ** decimals())) / 365;
        } else {
            todayPrize = (5000000 * (10 ** decimals())) / 365;
        }

        //settle
        for (uint256 i = 0; i < pledgers.length; i++) {
            uint256 prize = (todayPrize * pledgeOf[pledgers[i]]) / totalPledge;
            _update(address(this), pledgers[i], prize);
        }

        emit Settle();
        
        return true;
    }
}
