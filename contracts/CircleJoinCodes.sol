// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./CircleTypes.sol";
import "./CircleEvents.sol";
import "./CircleErrors.sol";

/**
 * @title CircleJoinCodes
 * @notice Library for managing join codes functionality
 */
library CircleJoinCodes {
    using CircleEvents for *;

    /**
     * @notice Storage structure for join codes
     */
    struct JoinCodeStorage {
        mapping(uint256 => CircleTypes.JoinCode) joinCodes;
        mapping(bytes32 => bool) usedCodeHashes;
        uint256 nextCodeId;
    }

    /**
     * @notice Creates a new join code
     * @param storage_ Reference to join code storage
     * @param codeHash Hash of the join code
     * @param expiresAt Expiry timestamp (0 = no expiry)
     * @return codeId The ID of the created join code
     */
    function createJoinCode(
        JoinCodeStorage storage storage_,
        bytes32 codeHash,
        uint256 expiresAt
    ) internal returns (uint256 codeId) {
        codeId = storage_.nextCodeId;
        storage_.nextCodeId++;

        CircleTypes.JoinCode memory newCode = CircleTypes.JoinCode({
            codeId: codeId,
            codeHash: codeHash,
            isUsed: false,
            createdAt: block.timestamp,
            expiresAt: expiresAt
        });

        storage_.joinCodes[codeId] = newCode;
    }

    /**
     * @notice Validates and uses a join code
     * @param storage_ Reference to join code storage
     * @param codeId ID of the join code to validate
     * @param providedCodeHash Hash of the code provided by user
     * @return isValid True if code is valid and can be used
     */
    function validateAndUseCode(
        JoinCodeStorage storage storage_,
        uint256 codeId,
        bytes32 providedCodeHash
    ) internal returns (bool isValid) {
        CircleTypes.JoinCode storage code = storage_.joinCodes[codeId];

        // Check if code exists (createdAt will be 0 if code doesn't exist)
        if (code.createdAt == 0) {
            return false;
        }

        // Check if code is already used
        if (code.isUsed) {
            return false;
        }

        // Check if code hash matches
        if (code.codeHash != providedCodeHash) {
            return false;
        }

        // Check if code has expired
        if (code.expiresAt > 0 && block.timestamp > code.expiresAt) {
            return false;
        }

        // Mark code as used
        code.isUsed = true;
        storage_.usedCodeHashes[providedCodeHash] = true;

        return true;
    }

    /**
     * @notice Revokes a join code
     * @param storage_ Reference to join code storage
     * @param codeId ID of the join code to revoke
     */
    function revokeJoinCode(
        JoinCodeStorage storage storage_,
        uint256 codeId
    ) internal {
        CircleTypes.JoinCode storage code = storage_.joinCodes[codeId];
        if (code.createdAt == 0) revert InvalidCode();
        code.isUsed = true; // Mark as used to invalidate
    }

    /**
     * @notice Gets join code information
     * @param storage_ Reference to join code storage
     * @param codeId ID of the join code
     * @return code The join code structure
     */
    function getJoinCode(
        JoinCodeStorage storage storage_,
        uint256 codeId
    ) internal view returns (CircleTypes.JoinCode memory code) {
        code = storage_.joinCodes[codeId];
    }
}

