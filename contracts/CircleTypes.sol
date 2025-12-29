// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title CircleTypes
 * @notice Contains all type definitions for Circle contracts
 * @dev Permissions are GIVEN BY members - meaning the circle can spend FROM their account
 */
library CircleTypes {
    /**
     * @notice Permission structure - defines spending limits FROM a member's account
     * @dev When a member gives permission, ANYONE in the circle can spend FROM their account
     * @param tokenName Token identifier/name that can be spent (e.g., "USDC", "DAI")
     * @param tokenAddress Address of the ERC-20 token contract
     * @param amountGiven Total amount given by member (can be increased additively)
     * @param amountUsed Amount already used/spent FROM member's account
     * @param amountLeft Remaining amount available (amountGiven - amountUsed)
     * @param expiresAt Timestamp when permission expires (0 = no expiry)
     * @param permissionsContext ERC-7715 permissions context for DelegationManager
     * 
     * Example: If member X gives permission with tokenName="USDC", amountGiven=1000, expiresAt=Jan1
     *          This means: "Anyone in the circle can spend up to 1000 USDC FROM X's account until Jan 1"
     *          If 100 USDC is spent, amountUsed=100, amountLeft=900
     */
    struct Permission {
        string tokenName;
        address tokenAddress;
        uint256 amountGiven;
        uint256 amountUsed;
        uint256 amountLeft;
        uint256 expiresAt;
        bytes permissionsContext; // ERC-7715 permission context
    }

    /**
     * @notice Member information structure
     * @param walletAddress The account address that GAVE the permission (can be spent FROM)
     * @param permission Permission details - what can be spent FROM this account
     * @param joinedAt Timestamp when member joined the circle
     */
    struct Member {
        address walletAddress;
        Permission permission;
        uint256 joinedAt;
    }

    /**
     * @notice Join code structure
     * @param codeId Unique identifier for the join code
     * @param codeHash Hash of the join code (for verification)
     * @param isUsed Whether this code has been used
     * @param createdAt Timestamp when code was created
     * @param expiresAt Timestamp when code expires (0 = no expiry)
     */
    struct JoinCode {
        uint256 codeId;
        bytes32 codeHash;
        bool isUsed;
        uint256 createdAt;
        uint256 expiresAt;
    }
}

