// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./CircleErrors.sol";

library CircleAdmin {
    function requireAdmin(address admin, address caller) internal pure {
        if (admin != caller) revert NotAdmin();
    }
}

