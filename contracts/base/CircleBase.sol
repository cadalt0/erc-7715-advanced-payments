// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../CircleTypes.sol";
import "../CircleEvents.sol";
import "../CircleJoinCodes.sol";
import "../CircleMembers.sol";
import "../CircleAdmin.sol";
import "../interfaces/IDelegationManager.sol";
import "../CircleErrors.sol";

/**
 * @title CircleBase
 * @notice Abstract base contract containing shared functionality for Circle
 * @dev This contract provides the core storage and internal functions
 */
abstract contract CircleBase {
    using CircleJoinCodes for CircleJoinCodes.JoinCodeStorage;
    using CircleMembers for CircleMembers.MemberStorage;
    using CircleAdmin for *;

    // Circle properties
    uint256 public immutable circleId;
    string public circleName;
    address public admin;

    // ERC-7715 DelegationManager
    IDelegationManager public immutable delegationManager;

    // Storage structures
    CircleJoinCodes.JoinCodeStorage internal _joinCodes;
    CircleMembers.MemberStorage internal _members;

    /**
     * @notice Constructor - initializes a new circle with admin auto-join
     * @param _circleId Unique identifier for this circle
     * @param _circleName Name of the circle
     * @param _admin Address of the admin (deployer)
     * @param _delegationManager Address of the ERC-7715 DelegationManager contract
     * @param _adminTokenName Token name for admin's initial permission
     * @param _adminTokenAddress Address of the ERC-20 token contract
     * @param _adminAmountGiven Amount of tokens admin is giving to the circle
     * @param _adminExpiresAt Permission expiry timestamp (0 = no expiry)
     */
    constructor(
        uint256 _circleId,
        string memory _circleName,
        address _admin,
        address _delegationManager,
        string memory _adminTokenName,
        address _adminTokenAddress,
        uint256 _adminAmountGiven,
        uint256 _adminExpiresAt
    ) {
        if (_admin == address(0)) revert InvalidAddress();
        if (_delegationManager == address(0)) revert InvalidAddress();
        if (bytes(_circleName).length == 0) revert InvalidName();
        if (_adminTokenAddress == address(0)) revert InvalidAddress();
        if (_adminAmountGiven == 0) revert InvalidAmount();

        circleId = _circleId;
        circleName = _circleName;
        admin = _admin;
        delegationManager = IDelegationManager(_delegationManager);

        // Auto-join admin with initial permission
        CircleTypes.Permission memory adminPermission = CircleTypes.Permission({
            tokenName: _adminTokenName,
            tokenAddress: _adminTokenAddress,
            amountGiven: _adminAmountGiven,
            amountUsed: 0,
            amountLeft: _adminAmountGiven,
            expiresAt: _adminExpiresAt,
            permissionsContext: ""
        });

        // Add admin as member
        _members.addMember(_admin, adminPermission);
    }

    /**
     * @notice Internal function to check admin access
     * @param caller Address of the function caller
     */
    function _requireAdmin(address caller) internal view {
        CircleAdmin.requireAdmin(admin, caller);
    }

    /**
     * @notice Internal function to emit join code created event
     */
    function _emitJoinCodeCreated(
        uint256 codeId,
        bytes32 codeHash,
        uint256 expiresAt
    ) internal {
        emit CircleEvents.E2(circleId, codeId, codeHash, expiresAt);
    }

    function _emitMemberJoined(
        address memberAddress,
        uint256 codeId,
        string memory tokenName,
        uint256 amountGiven,
        uint256 expiresAt
    ) internal {
        emit CircleEvents.E3(circleId, memberAddress, codeId, tokenName, amountGiven, expiresAt);
    }

    function _emitMemberPermissionUpdated(
        address memberAddress,
        string memory tokenName,
        uint256 amountGiven,
        uint256 expiresAt
    ) internal {
        emit CircleEvents.E4(circleId, memberAddress, tokenName, amountGiven, expiresAt);
    }

    function _emitMemberRemoved(address memberAddress) internal {
        emit CircleEvents.E5(circleId, memberAddress);
    }

    function _emitJoinCodeRevoked(uint256 codeId) internal {
        emit CircleEvents.E6(circleId, codeId);
    }

    function _emitTokenTransfer(
        address fromMember,
        address recipient,
        address tokenAddress,
        uint256 amount,
        address caller
    ) internal {
        emit CircleEvents.E7(circleId, fromMember, recipient, tokenAddress, amount, caller);
    }
}

