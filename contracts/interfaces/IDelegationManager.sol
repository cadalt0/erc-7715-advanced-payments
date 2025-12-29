// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IDelegationManager
 * @notice Interface for ERC-7715 DelegationManager contract
 */
interface IDelegationManager {
    function redeemDelegations(
        bytes[] calldata permissionContexts,
        bytes32[] calldata executionModes,
        bytes[] calldata executionCalldatas
    ) external;
}

