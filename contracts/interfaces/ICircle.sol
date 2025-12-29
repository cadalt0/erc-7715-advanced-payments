// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../CircleTypes.sol";

/**
 * @title ICircle
 * @notice Interface for Circle contract
 */
interface ICircle {
    // Note: circleId, circleName, and admin are public state variables
    // in CircleBase, so they automatically have getter functions

    // Admin functions
    function createJoinCode(
        bytes32 codeHash,
        uint256 expiresAt
    ) external returns (uint256 codeId);

    function updateMemberPermission(
        address memberAddress,
        string memory newTokenName,
        address newTokenAddress,
        uint256 amountChange,
        uint8 operationType,
        uint256 newExpiresAt,
        bytes memory newPermissionsContext
    ) external;

    function removeMember(address memberAddress) external;

    function revokeJoinCode(uint256 codeId) external;

    // Member functions
    function joinCircle(
        uint256 codeId,
        bytes32 codeHash,
        string memory tokenName,
        address tokenAddress,
        uint256 amountGiven,
        uint256 expiresAt,
        bytes memory permissionsContext
    ) external;

    function transferToken(
        address fromMember,
        address tokenAddress,
        address recipient,
        uint256 amount
    ) external;

    // View functions
    function getMember(
        address memberAddress
    ) external view returns (CircleTypes.Member memory member);

    function isMember(address memberAddress) external view returns (bool);

    function getAllMembers() external view returns (address[] memory);

    function getMemberCount() external view returns (uint256);

    function getJoinCode(
        uint256 codeId
    ) external view returns (CircleTypes.JoinCode memory);

    // Enhanced query functions
    function getAllMembersWithDetails()
        external
        view
        returns (CircleTypes.Member[] memory members);

    function getMembersByToken(
        string memory tokenName
    ) external view returns (CircleTypes.Member[] memory members);

    function getAllMembersPermissions()
        external
        view
        returns (
            address[] memory addresses,
            string[] memory tokenNames,
            uint256[] memory maxAmounts,
            uint256[] memory expiryTimestamps
        );
}

