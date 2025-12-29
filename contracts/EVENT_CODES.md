# Event Codes Reference

This document maps event codes to their meanings for the Circle contract system.

## Event Codes

### E1 - CircleCreated
**Event:** `E1(uint256 indexed circleId, string circleName, address indexed admin, address indexed circleAddress)`

**Meaning:** Emitted when a new circle is created via the factory.

**Parameters:**
- `circleId` - Unique identifier of the circle
- `circleName` - Name of the circle
- `admin` - Address of the circle admin (deployer)
- `circleAddress` - Address of the deployed Circle contract

---

### E2 - JoinCodeCreated
**Event:** `E2(uint256 indexed circleId, uint256 indexed codeId, bytes32 indexed codeHash, uint256 expiresAt)`

**Meaning:** Emitted when a join code is created by the admin.

**Parameters:**
- `circleId` - Circle identifier
- `codeId` - Unique identifier of the join code
- `codeHash` - Hash of the join code
- `expiresAt` - Expiry timestamp (0 = no expiry)

---

### E3 - MemberJoined
**Event:** `E3(uint256 indexed circleId, address indexed memberAddress, uint256 indexed codeId, string tokenName, uint256 amountGiven, uint256 expiresAt)`

**Meaning:** Emitted when a member joins the circle and gives permission.

**Parameters:**
- `circleId` - Circle identifier
- `memberAddress` - Address of the member who joined (account that can be spent FROM)
- `codeId` - Join code that was used
- `tokenName` - Token name for the permission given (e.g., "USDC")
- `amountGiven` - Amount given by member (can be increased later)
- `expiresAt` - Permission expiry timestamp (0 = no expiry)

---

### E4 - MemberPermissionUpdated
**Event:** `E4(uint256 indexed circleId, address indexed memberAddress, string tokenName, uint256 amountGiven, uint256 expiresAt)`

**Meaning:** Emitted when a member's permission is updated (additive - adds to existing amount).

**Parameters:**
- `circleId` - Circle identifier
- `memberAddress` - Address of the member
- `tokenName` - Token name
- `amountGiven` - Total amount given (after additive update)
- `expiresAt` - Updated expiry timestamp

---

### E5 - MemberRemoved
**Event:** `E5(uint256 indexed circleId, address indexed memberAddress)`

**Meaning:** Emitted when a member is removed from a circle.

**Parameters:**
- `circleId` - Circle identifier
- `memberAddress` - Address of the removed member

---

### E6 - JoinCodeRevoked
**Event:** `E6(uint256 indexed circleId, uint256 indexed codeId)`

**Meaning:** Emitted when a join code is revoked/invalidated.

**Parameters:**
- `circleId` - Circle identifier
- `codeId` - Join code identifier that was revoked

---

### E7 - TokenTransfer
**Event:** `E7(uint256 indexed circleId, address indexed fromMember, address indexed recipient, address tokenAddress, uint256 amount, address caller)`

**Meaning:** Emitted when a token transfer is executed using a member's permission.

**Parameters:**
- `circleId` - Circle identifier
- `fromMember` - Address of the member whose permission was used (account tokens were spent FROM)
- `recipient` - Address that received the tokens
- `tokenAddress` - Address of the ERC-20 token contract
- `amount` - Amount of tokens transferred
- `caller` - Address of the member who initiated the transfer

---

## Error Codes

The contract uses custom errors instead of revert strings to reduce bytecode size. All errors are defined in `CircleErrors.sol`.

### InvalidAddress
**Error:** `InvalidAddress()`

**Meaning:** Thrown when an address parameter is invalid (zero address).

**Used in:**
- Constructor validation
- Member address validation
- Token address validation
- Recipient address validation

---

### InvalidName
**Error:** `InvalidName()`

**Meaning:** Thrown when a name/string parameter is empty or invalid.

**Used in:**
- Circle name validation
- Empty string checks

---

### InvalidAmount
**Error:** `InvalidAmount()`

**Meaning:** Thrown when an amount parameter is zero or invalid.

**Used in:**
- Amount validation in `joinCircle()`
- Amount validation in `updateMemberPermission()`
- Amount validation in `transferToken()`

---

### AlreadyMember
**Error:** `AlreadyMember()`

**Meaning:** Thrown when trying to add a member who already exists in the circle.

**Used in:**
- `joinCircle()` - when member already exists

---

### NotMember
**Error:** `NotMember()`

**Meaning:** Thrown when an operation requires membership but the address is not a member.

**Used in:**
- Member operations validation
- Transfer function caller validation
- Member existence checks

---

### NotAdmin
**Error:** `NotAdmin()`

**Meaning:** Thrown when an admin-only function is called by a non-admin address.

**Used in:**
- Admin-only function access control

---

### InvalidCode
**Error:** `InvalidCode()`

**Meaning:** Thrown when a join code is invalid, expired, or doesn't exist.

**Used in:**
- Join code validation
- Transfer validation (when transfer conditions are not met)

---

### CodeUsed
**Error:** `CodeUsed()`

**Meaning:** Thrown when trying to use a join code that has already been used.

**Note:** Currently defined but may be used in future implementations.

---

### CodeExpired
**Error:** `CodeExpired()`

**Meaning:** Thrown when trying to use an expired join code.

**Note:** Currently defined but may be used in future implementations.

---

### InsufficientAmount
**Error:** `InsufficientAmount()`

**Meaning:** Thrown when there's not enough amount left for a transfer.

**Note:** Currently defined but may be used in future implementations.

---

### PermissionExpired
**Error:** `PermissionExpired()`

**Meaning:** Thrown when trying to use a permission that has expired.

**Note:** Currently defined but may be used in future implementations.

---

### TokenMismatch
**Error:** `TokenMismatch()`

**Meaning:** Thrown when the token address doesn't match the member's permission token.

**Note:** Currently defined but may be used in future implementations.

---

## Usage Notes

### Events
- All events use indexed parameters for the first 3 parameters (for efficient filtering)
- String parameters are not indexed (gas optimization)
- Events are emitted by the Circle and CircleFactory contracts
- Off-chain systems should listen to these events to track circle state

### Errors
- Custom errors are more gas-efficient than require strings
- Errors reduce bytecode size significantly
- Errors can be caught and decoded by off-chain systems
- All errors are defined in `CircleErrors.sol`




0xdb9B1e94B5b69Df7e401DDbedE43491141047dB3 