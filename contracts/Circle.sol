// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./interfaces/ICircle.sol";
import "./base/CircleBase.sol";
import "./CircleErrors.sol";

/**
 * @title Circle
 * @notice Main contract for managing a circle with members, permissions, and join codes
 * @dev Each deployed Circle instance represents one circle with its own admin, members, and codes
 *      Implements ICircle interface and inherits from CircleBase
 * 
 * PERMISSION MODEL:
 * - Members GIVE permissions to the circle using ERC-7715
 * - When member X gives permission: "1000 USDC till Jan 1"
 *   This means: "Anyone in the circle can spend up to 1000 USDC FROM X's account until Jan 1"
 * - Members can call transfer() to execute real token transfers using DelegationManager
 * - Amount tracking: amountGiven, amountUsed, amountLeft
 */
contract Circle is ICircle, CircleBase {
    using CircleJoinCodes for CircleJoinCodes.JoinCodeStorage;
    using CircleMembers for CircleMembers.MemberStorage;

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
    ) CircleBase(_circleId, _circleName, _admin, _delegationManager, _adminTokenName, _adminTokenAddress, _adminAmountGiven, _adminExpiresAt) {}

    /**
     * @notice Creates a new one-time join code (admin only)
     * @param codeHash Hash of the join code (use keccak256(abi.encodePacked(code)) off-chain)
     * @param expiresAt Expiry timestamp (0 = no expiry)
     * @return codeId The ID of the created join code
     */
    function createJoinCode(
        bytes32 codeHash,
        uint256 expiresAt
    ) external override returns (uint256 codeId) {
        _requireAdmin(msg.sender);

        codeId = _joinCodes.createJoinCode(codeHash, expiresAt);

        _emitJoinCodeCreated(codeId, codeHash, expiresAt);
    }

    /**
     * @notice Joins the circle using a valid one-time code and gives permission
     * @dev Member gives permission for the circle to spend FROM their account using ERC-7715
     * @param codeId ID of the join code to use
     * @param codeHash Hash of the code (user provides the code, contract verifies hash)
     * @param tokenName Token name that can be spent FROM member's account (e.g., "USDC")
     * @param tokenAddress Address of the ERC-20 token contract
     * @param amountGiven Amount given by member (can be increased later)
     * @param expiresAt Permission expiry timestamp (0 = no expiry)
     * @param permissionsContext ERC-7715 permissions context from granted permission
     * 
     * Example: If msg.sender joins with tokenName="USDC", amountGiven=1000, expiresAt=Jan1
     *          This means: "Anyone in circle can spend up to 1000 USDC FROM msg.sender's account until Jan 1"
     */
    function joinCircle(
        uint256 codeId,
        bytes32 codeHash,
        string memory tokenName,
        address tokenAddress,
        uint256 amountGiven,
        uint256 expiresAt,
        bytes memory permissionsContext
    ) external override {
        if (_members.isMember(msg.sender)) revert AlreadyMember();
        if (tokenAddress == address(0)) revert InvalidAddress();
        if (amountGiven == 0) revert InvalidAmount();

        bool isValid = _joinCodes.validateAndUseCode(codeId, codeHash);
        if (!isValid) revert InvalidCode();

        // Create permission for the new member
        CircleTypes.Permission memory permission = CircleTypes.Permission({
            tokenName: tokenName,
            tokenAddress: tokenAddress,
            amountGiven: amountGiven,
            amountUsed: 0,
            amountLeft: amountGiven,
            expiresAt: expiresAt,
            permissionsContext: permissionsContext
        });

        // Add member
        _members.addMember(msg.sender, permission);

        // Emit event with full permission details
        _emitMemberJoined(msg.sender, codeId, tokenName, amountGiven, expiresAt);
    }

    /**
     * @notice Updates a member's given permission (member only - can only update their own) - FULL CONTROL
     * @dev Members have 100% control: can change token, amount (add/subtract/set), expiry, context
     * @param memberAddress Address of the member whose permission is being updated (must be msg.sender)
     * @param newTokenName New token name (must be provided, cannot be empty)
     * @param newTokenAddress New token address (must be provided, cannot be address(0))
     * @param amountChange Amount to add/subtract/set (must be > 0)
     * @param operationType 0 = Add (old + amountChange), 1 = Subtract (old - amountChange), 2 = Set absolute (amountChange)
     * @param newExpiresAt New expiry timestamp (0 = no expiry, must be provided)
     * @param newPermissionsContext New ERC-7715 permissions context (must be provided)
     */
    function updateMemberPermission(
        address memberAddress,
        string memory newTokenName,
        address newTokenAddress,
        uint256 amountChange,
        uint8 operationType,
        uint256 newExpiresAt,
        bytes memory newPermissionsContext
    ) external override {
        // Only the member themselves can update their own permission
        if (msg.sender != memberAddress) revert NotMember();

        _members.updateMemberPermissionFull(
            memberAddress,
            newTokenName,
            newTokenAddress,
            amountChange,
            operationType,
            newExpiresAt,
            newPermissionsContext
        );

        CircleTypes.Member memory member = _members.getMember(memberAddress);
        _emitMemberPermissionUpdated(
            memberAddress,
            member.permission.tokenName,
            member.permission.amountGiven,
            member.permission.expiresAt
        );
    }

    /**
     * @notice Removes a member from the circle
     * @dev Admin can remove any member, members can remove themselves
     * @param memberAddress Address of the member to remove
     */
    function removeMember(address memberAddress) external override {
        // Admin can remove anyone, members can only remove themselves
        if (msg.sender != admin && msg.sender != memberAddress) revert NotAdmin();

        _members.removeMember(memberAddress);

        _emitMemberRemoved(memberAddress);
    }

    /**
     * @notice Revokes a join code (admin only)
     * @param codeId ID of the join code to revoke
     */
    function revokeJoinCode(uint256 codeId) external override {
        _requireAdmin(msg.sender);

        _joinCodes.revokeJoinCode(codeId);

        _emitJoinCodeRevoked(codeId);
    }

    // View functions

    /**
     * @notice Gets member information and their given permission
     * @param memberAddress Address of the member (account that can be spent FROM)
     * @return member Member structure with permission details
     */
    function getMember(
        address memberAddress
    ) external view override returns (CircleTypes.Member memory member) {
        return _members.getMember(memberAddress);
    }

    /**
     * @notice Checks if an address is a member
     * @param memberAddress Address to check
     * @return isMember True if address is a member
     */
    function isMember(
        address memberAddress
    ) external view override returns (bool) {
        return _members.isMember(memberAddress);
    }

    /**
     * @notice Gets all member addresses
     * @return addresses Array of all member addresses
     */
    function getAllMembers()
        external
        view
        override
        returns (address[] memory)
    {
        return _members.getAllMembers();
    }

    /**
     * @notice Gets total number of members who gave permissions
     * @return count Total number of members in the circle
     */
    function getMemberCount() external view override returns (uint256) {
        return _members.getMemberCount();
    }

    /**
     * @notice Gets join code information
     * @param codeId ID of the join code
     * @return code Join code structure
     */
    function getJoinCode(
        uint256 codeId
    ) external view override returns (CircleTypes.JoinCode memory) {
        return _joinCodes.getJoinCode(codeId);
    }

    /**
     * @notice Gets all members who gave permissions with their full details
     * @return members Array of all members with their permission details
     *         Each member shows: who gave permission (walletAddress), what token (tokenName),
     *         how much can be spent FROM them (maxAmount), when it expires (expiresAt)
     */
    function getAllMembersWithDetails()
        external
        view
        override
        returns (CircleTypes.Member[] memory members)
    {
        return _members.getAllMembersWithDetails();
    }

    /**
     * @notice Gets all members who gave permission for a specific token
     * @param tokenName Token name to filter by (e.g., "USDC")
     * @return members Array of members who gave permission for this token
     *         Shows which accounts can be spent FROM for this token
     */
    function getMembersByToken(
        string memory tokenName
    )
        external
        view
        override
        returns (CircleTypes.Member[] memory members)
    {
        return _members.getMembersByToken(tokenName);
    }

    /**
     * @notice Gets all members who gave permissions with details in separate arrays
     * @return addresses Array of member addresses (accounts that can be spent FROM)
     * @return tokenNames Array of token names that can be spent FROM each address
     * @return maxAmounts Array of max amounts that can be spent FROM each address
     * @return expiryTimestamps Array of expiry timestamps for each permission (0 = no expiry)
     */
    function getAllMembersPermissions()
        external
        view
        override
        returns (
            address[] memory addresses,
            string[] memory tokenNames,
            uint256[] memory maxAmounts,
            uint256[] memory expiryTimestamps
        )
    {
        return _members.getAllMembersPermissions();
    }

    /**
     * @notice Transfers tokens using a member's permission (any member can call)
     * @dev User selects which member's permission to use and which token
     * @param fromMember Address of the member whose permission to use (account to spend FROM)
     * @param tokenAddress Address of the ERC-20 token contract
     * @param recipient Address that will receive the tokens
     * @param amount Amount of tokens to transfer
     * 
     * Requirements:
     * - Caller must be a member (or admin)
     * - fromMember must have given permission for tokenAddress
     * - Permission must not be expired
     * - amountLeft >= amount
     */
    function transferToken(
        address fromMember,
        address tokenAddress,
        address recipient,
        uint256 amount
    ) external override {
        if (!_members.isMember(msg.sender) && msg.sender != admin) revert NotMember();
        if (recipient == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();

        bool canTransfer = _members.canTransfer(fromMember, tokenAddress, amount);
        if (!canTransfer) revert InvalidCode();

        // Get permissionsContext directly from storage (avoids copying large bytes array)
        bytes memory permissionsContext = _members.getPermissionsContext(fromMember);

        // Build ERC-20 transfer calldata
        bytes memory transferCalldata = abi.encodeWithSignature(
            "transfer(address,uint256)",
            recipient,
            amount
        );

        // Encode execution as ExecutionStruct: (target, value, callData)
        bytes memory executionCalldata = abi.encodePacked(
            tokenAddress,    // target (address) - 20 bytes
            uint256(0),     // value (uint256) - 32 bytes
            transferCalldata // callData (bytes) - variable length
        );

        // Prepare arrays for DelegationManager
        bytes[] memory permissionContexts = new bytes[](1);
        permissionContexts[0] = permissionsContext;

        bytes32[] memory executionModes = new bytes32[](1);
        executionModes[0] = bytes32(0); // SingleDefault execution mode

        bytes[] memory executionCalldatas = new bytes[](1);
        executionCalldatas[0] = executionCalldata;

        // Execute transfer via DelegationManager
        delegationManager.redeemDelegations(
            permissionContexts,
            executionModes,
            executionCalldatas
        );

        // Update amount tracking
        _members.updateAmountUsed(fromMember, amount);

        // Emit event
        _emitTokenTransfer(fromMember, recipient, tokenAddress, amount, msg.sender);
    }
}
