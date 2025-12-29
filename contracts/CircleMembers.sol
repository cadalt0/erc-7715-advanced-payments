// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./CircleTypes.sol";
import "./CircleEvents.sol";
import "./CircleErrors.sol";

/**
 * @title CircleMembers
 * @notice Library for managing circle members and their given permissions
 * @dev Members GIVE permissions - meaning the circle can spend FROM their accounts
 */
library CircleMembers {
    using CircleEvents for *;

    /**
     * @notice Storage structure for members
     */
    struct MemberStorage {
        mapping(address => CircleTypes.Member) members;
        address[] memberAddresses;
        mapping(address => uint256) memberIndex; // For efficient deletion
    }

    /**
     * @notice Adds a new member to the circle who gives permission
     * @param storage_ Reference to member storage
     * @param memberAddress Address of the member to add (account that can be spent FROM)
     * @param permission Permission details - what can be spent FROM memberAddress's account
     */
    function addMember(
        MemberStorage storage storage_,
        address memberAddress,
        CircleTypes.Permission memory permission
    ) internal {
        if (memberAddress == address(0)) revert InvalidAddress();
        if (storage_.members[memberAddress].walletAddress != address(0)) revert AlreadyMember();

        CircleTypes.Member memory newMember = CircleTypes.Member({
            walletAddress: memberAddress,
            permission: permission,
            joinedAt: block.timestamp
        });

        storage_.members[memberAddress] = newMember;
        storage_.memberIndex[memberAddress] = storage_.memberAddresses.length;
        storage_.memberAddresses.push(memberAddress);
    }

    /**
     * @notice Updates a member's given permission (additive - adds to existing amount)
     * @param storage_ Reference to member storage
     * @param memberAddress Address of the member (account that can be spent FROM)
     * @param additionalAmount Additional amount to add to existing amountGiven
     * @param newExpiresAt New expiry timestamp (0 = no expiry)
     * @param newPermissionsContext New ERC-7715 permissions context
     */
    function updateMemberPermissionAdditive(
        MemberStorage storage storage_,
        address memberAddress,
        uint256 additionalAmount,
        uint256 newExpiresAt,
        bytes memory newPermissionsContext
    ) internal {
        if (storage_.members[memberAddress].walletAddress == address(0)) revert NotMember();

        CircleTypes.Permission storage permission = storage_.members[memberAddress].permission;
        
        // Additive: new amountGiven = old amountGiven + additionalAmount
        permission.amountGiven += additionalAmount;
        permission.amountLeft += additionalAmount; // Increase available amount
        permission.expiresAt = newExpiresAt;
        permission.permissionsContext = newPermissionsContext;
    }

    /**
     * @notice Updates a member's permission with full control
     * @param storage_ Reference to member storage
     * @param memberAddress Address of the member (account that can be spent FROM)
     * @param newTokenName New token name (must be provided, cannot be empty)
     * @param newTokenAddress New token address (must be provided, cannot be address(0))
     * @param amountChange Amount to add/subtract/set (must be > 0)
     * @param operationType 0 = Add (old + amountChange), 1 = Subtract (old - amountChange), 2 = Set absolute (amountChange)
     * @param newExpiresAt New expiry timestamp (0 = no expiry, must be provided)
     * @param newPermissionsContext New ERC-7715 permissions context (must be provided)
     */
    function updateMemberPermissionFull(
        MemberStorage storage storage_,
        address memberAddress,
        string memory newTokenName,
        address newTokenAddress,
        uint256 amountChange,
        uint8 operationType,
        uint256 newExpiresAt,
        bytes memory newPermissionsContext
    ) internal {
        if (storage_.members[memberAddress].walletAddress == address(0)) revert NotMember();
        if (bytes(newTokenName).length == 0) revert InvalidName();
        if (newTokenAddress == address(0)) revert InvalidAddress();
        if (amountChange == 0) revert InvalidAmount();

        CircleTypes.Permission storage permission = storage_.members[memberAddress].permission;
        
        // Always update token name and address
        permission.tokenName = newTokenName;
        permission.tokenAddress = newTokenAddress;
        
        // Update amount based on operation type
        uint256 currentUsed = permission.amountUsed;
        uint256 newAmountGiven;
        
        if (operationType == 0) {
            // Add: old + new
            newAmountGiven = permission.amountGiven + amountChange;
        } else if (operationType == 1) {
            // Subtract: old - new
            if (permission.amountGiven < amountChange) revert InvalidAmount();
            newAmountGiven = permission.amountGiven - amountChange;
        } else if (operationType == 2) {
            // Set absolute: set to amountChange (any value allowed)
            newAmountGiven = amountChange;
        } else {
            revert InvalidAmount();
        }
        
        // Always calculate amountLeft from amountGiven - amountUsed
        permission.amountGiven = newAmountGiven;
        if (newAmountGiven >= currentUsed) {
            permission.amountLeft = newAmountGiven - currentUsed;
        } else {
            permission.amountLeft = 0;
        }
        
        // Always update expiry
        permission.expiresAt = newExpiresAt;
        
        // Always update permissions context
        permission.permissionsContext = newPermissionsContext;
    }

    /**
     * @notice Updates amount used after a transfer
     * @param storage_ Reference to member storage
     * @param memberAddress Address of the member (account that was spent FROM)
     * @param amount Amount that was used
     */
    function updateAmountUsed(
        MemberStorage storage storage_,
        address memberAddress,
        uint256 amount
    ) internal {
        CircleTypes.Permission storage permission = storage_.members[memberAddress].permission;
        permission.amountUsed += amount;
        permission.amountLeft -= amount;
    }

    /**
     * @notice Gets the permissionsContext directly from storage (avoids copying large bytes)
     * @param storage_ Reference to member storage
     * @param memberAddress Address of the member
     * @return permissionsContext The permissions context bytes
     */
    function getPermissionsContext(
        MemberStorage storage storage_,
        address memberAddress
    ) internal view returns (bytes memory permissionsContext) {
        permissionsContext = storage_.members[memberAddress].permission.permissionsContext;
    }

    /**
     * @notice Checks if a transfer can be made (validates amount and expiry)
     * @param storage_ Reference to member storage
     * @param memberAddress Address of the member (account to spend FROM)
     * @param tokenAddress Token address to check
     * @param amount Amount to check
     * @return isValid True if transfer is valid
     */
    function canTransfer(
        MemberStorage storage storage_,
        address memberAddress,
        address tokenAddress,
        uint256 amount
    ) internal view returns (bool isValid) {
        CircleTypes.Member memory member = storage_.members[memberAddress];
        
        // Check if member exists
        if (member.walletAddress == address(0)) {
            return false;
        }

        // Check if token matches
        if (member.permission.tokenAddress != tokenAddress) {
            return false;
        }

        // Check if expired
        if (member.permission.expiresAt > 0 && block.timestamp > member.permission.expiresAt) {
            return false;
        }

        // Check if enough amount left
        if (member.permission.amountLeft < amount) {
            return false;
        }

        return true;
    }

    /**
     * @notice Removes a member from the circle
     * @param storage_ Reference to member storage
     * @param memberAddress Address of the member to remove
     */
    function removeMember(
        MemberStorage storage storage_,
        address memberAddress
    ) internal {
        if (storage_.members[memberAddress].walletAddress == address(0)) revert NotMember();

        // Remove from array efficiently
        uint256 indexToRemove = storage_.memberIndex[memberAddress];
        uint256 lastIndex = storage_.memberAddresses.length - 1;

        if (indexToRemove != lastIndex) {
            address lastMember = storage_.memberAddresses[lastIndex];
            storage_.memberAddresses[indexToRemove] = lastMember;
            storage_.memberIndex[lastMember] = indexToRemove;
        }

        storage_.memberAddresses.pop();
        delete storage_.memberIndex[memberAddress];
        delete storage_.members[memberAddress];
    }

    /**
     * @notice Gets member information
     * @param storage_ Reference to member storage
     * @param memberAddress Address of the member
     * @return member The member structure
     */
    function getMember(
        MemberStorage storage storage_,
        address memberAddress
    ) internal view returns (CircleTypes.Member memory member) {
        member = storage_.members[memberAddress];
    }

    /**
     * @notice Checks if an address is a member
     * @param storage_ Reference to member storage
     * @param memberAddress Address to check
     * @return result True if address is a member
     */
    function isMember(
        MemberStorage storage storage_,
        address memberAddress
    ) internal view returns (bool result) {
        result = storage_.members[memberAddress].walletAddress != address(0);
    }

    /**
     * @notice Gets all member addresses
     * @param storage_ Reference to member storage
     * @return addresses Array of all member addresses
     */
    function getAllMembers(
        MemberStorage storage storage_
    ) internal view returns (address[] memory addresses) {
        addresses = storage_.memberAddresses;
    }

    /**
     * @notice Gets total number of members
     * @param storage_ Reference to member storage
     * @return count Total number of members
     */
    function getMemberCount(
        MemberStorage storage storage_
    ) internal view returns (uint256 count) {
        count = storage_.memberAddresses.length;
    }

    /**
     * @notice Gets all members with their full details
     * @param storage_ Reference to member storage
     * @return members Array of all member structures
     */
    function getAllMembersWithDetails(
        MemberStorage storage storage_
    ) internal view returns (CircleTypes.Member[] memory members) {
        uint256 count = storage_.memberAddresses.length;
        members = new CircleTypes.Member[](count);
        
        for (uint256 i = 0; i < count; i++) {
            members[i] = storage_.members[storage_.memberAddresses[i]];
        }
    }

    /**
     * @notice Gets all members who gave permission for a specific token
     * @param storage_ Reference to member storage
     * @param tokenName Token name to filter by (e.g., "USDC")
     * @return members Array of members who gave permission for this token
     *         Shows which accounts can be spent FROM for this token
     */
    function getMembersByToken(
        MemberStorage storage storage_,
        string memory tokenName
    ) internal view returns (CircleTypes.Member[] memory members) {
        uint256 count = storage_.memberAddresses.length;
        uint256 matchingCount = 0;
        
        // First pass: count matching members
        for (uint256 i = 0; i < count; i++) {
            address memberAddr = storage_.memberAddresses[i];
            if (
                keccak256(bytes(storage_.members[memberAddr].permission.tokenName)) ==
                keccak256(bytes(tokenName))
            ) {
                matchingCount++;
            }
        }
        
        // Second pass: collect matching members
        members = new CircleTypes.Member[](matchingCount);
        uint256 index = 0;
        for (uint256 i = 0; i < count; i++) {
            address memberAddr = storage_.memberAddresses[i];
            if (
                keccak256(bytes(storage_.members[memberAddr].permission.tokenName)) ==
                keccak256(bytes(tokenName))
            ) {
                members[index] = storage_.members[memberAddr];
                index++;
            }
        }
    }

    /**
     * @notice Gets all members who gave permissions with details in separate arrays
     * @param storage_ Reference to member storage
     * @return addresses Array of member addresses (accounts that can be spent FROM)
     * @return tokenNames Array of token names that can be spent FROM each address
     * @return maxAmounts Array of max amounts that can be spent FROM each address (amountGiven)
     * @return expiryTimestamps Array of expiry timestamps for each permission (0 = no expiry)
     */
    function getAllMembersPermissions(
        MemberStorage storage storage_
    )
        internal
        view
        returns (
            address[] memory addresses,
            string[] memory tokenNames,
            uint256[] memory maxAmounts,
            uint256[] memory expiryTimestamps
        )
    {
        uint256 count = storage_.memberAddresses.length;
        addresses = new address[](count);
        tokenNames = new string[](count);
        maxAmounts = new uint256[](count);
        expiryTimestamps = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            address memberAddr = storage_.memberAddresses[i];
            CircleTypes.Member memory member = storage_.members[memberAddr];
            
            addresses[i] = memberAddr;
            tokenNames[i] = member.permission.tokenName;
            maxAmounts[i] = member.permission.amountGiven;
            expiryTimestamps[i] = member.permission.expiresAt;
        }
    }
}

