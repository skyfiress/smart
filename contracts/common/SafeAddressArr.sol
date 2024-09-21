// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library SafeAddressArr {
    /**
     * addUnique
     */
    function addUnique(address[] storage arr, address account) internal {
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == account) {
                return;
            }
        }
        arr.push(account);
    }

    /**
     * remove
     */
    function remove(address[] storage arr, uint256 _index) internal {
        require(_index < arr.length, "index out of bound");

        for (uint256 i = _index; i < arr.length - 1; i++) {
            arr[i] = arr[i + 1];
        }
        arr.pop();
    }

    /**
     * remove
     */
    function remove(address[] storage arr, address account) internal {
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == account) {
                remove(arr, i);
                return;
            }
        }
    }
}