# Contracts README (ERC-7715 Circles)

Developer-focused reference for the smart contracts that implement ERC-7715 style delegated spending inside a "circle" of members.

## Architecture
- **CircleFactory**: Deploys circles, assigns incrementing `circleId`, and records address/id maps. Uses a dedicated **CircleDeployer** to keep factory bytecode small. Constructor requires an ERC-7715 `DelegationManager` address shared by all circles.
- **Circle**: Main instance per group. Inherits **CircleBase** for storage/utilities and implements **ICircle**. Manages admin, join codes, membership, permissions, and delegated transfers through ERC-7715.
- **CircleBase**: Shared storage (ids, admin, `delegationManager`, member/join-code storage) plus internal event helpers and an admin guard.
- **CircleMembers** (library): Manages member records and permission accounting (`amountGiven`, `amountUsed`, `amountLeft`, expiry, token binding, permissions context bytes).
- **CircleJoinCodes** (library): One-time join-code lifecycle (create, validate/use, revoke).
- **CircleAdmin** (library): Minimal admin gate.
- **CircleTypes**: Structs for `Permission`, `Member`, and `JoinCode`.
- **CircleEvents**: Compact event set (E1–E7) emitted by factory/circle actions.
- **CircleErrors**: Custom errors shared across contracts.
- **Interfaces**: `ICircle`, `ICircleFactory`, `IDelegationManager` document the public surface and ERC-7715 integration point.

## Permission Model (ERC-7715 oriented)
- Members **give** spending permission from their own account to the circle. A permission binds `(tokenName, tokenAddress, amountGiven, expiresAt, permissionsContext)`.
- `permissionsContext` is the ERC-7715 payload obtained off-chain when the member grants delegation to the circle. The circle forwards it directly to `DelegationManager.redeemDelegations` when executing transfers.
- Accounting tracks `amountUsed` and `amountLeft`; updates occur on each transfer and when a member edits their grant.
- Expiry is enforced per permission; `0` means no expiry.

## Lifecycle
1. **Deploy factory**: `new CircleFactory(delegationManager)`.
2. **Deploy a circle**: `deployCircle(circleName, adminTokenName, adminTokenAddress, adminAmountGiven, adminExpiresAt)`.
   - The caller becomes `admin` and is auto-added as the first member with the provided initial permission.
3. **Create join code (admin)**: `createJoinCode(codeHash, expiresAt)`; `codeHash = keccak256(abi.encodePacked(rawCode))` off-chain.
4. **Join with code (member)**: `joinCircle(codeId, codeHash, tokenName, tokenAddress, amountGiven, expiresAt, permissionsContext)`.
   - Validates one-time code, stores permission, initializes accounting, and emits join event.
5. **Update permission (member self-serve)**: `updateMemberPermission(memberAddress, newTokenName, newTokenAddress, amountChange, operationType, newExpiresAt, newPermissionsContext)`.
   - `operationType`: `0` add, `1` subtract, `2` set absolute. Always recomputes `amountLeft = amountGiven - amountUsed`.
6. **Transfers using ERC-7715**: Any member (or admin) calls `transferToken(fromMember, tokenAddress, recipient, amount)`.
   - Validates membership, token match, expiry, and `amountLeft`.
   - Builds ERC-20 `transfer` calldata and wraps it as a single `ExecutionStruct` equivalent, then forwards to `DelegationManager.redeemDelegations(permissionContexts, executionModes, executionCalldatas)`.
   - Updates accounting and emits `E7`.
7. **Admin/member exits**: `removeMember(memberAddress)` (admin or the member themselves). Deletes records; does not claw back past spends.
8. **Revoke join code (admin)**: `revokeJoinCode(codeId)` marks code used/invalid.

## Contract Surfaces
### CircleFactory
- `deployCircle(...) -> (circleId, circleAddress)`
- Views: `getCircle(id)`, `getCircleId(address)`, `getTotalCircles()`, `getAllCircles()`, plus public maps `circles`, `circleIds`, `allCircles`.

### Circle
- **Admin**: `createJoinCode`, `revokeJoinCode`.
- **Members (self)**: `joinCircle`, `updateMemberPermission`, `removeMember` (self) or by admin.
- **Transfers**: `transferToken(fromMember, tokenAddress, recipient, amount)` executes via ERC-7715 DelegationManager.
- **Views**: `getMember`, `isMember`, `getAllMembers`, `getMemberCount`, `getJoinCode`, `getAllMembersWithDetails`, `getMembersByToken`, `getAllMembersPermissions`.

### Libraries (internal)
- **CircleMembers**: `addMember`, `updateMemberPermissionFull`, `updateAmountUsed`, `canTransfer`, `removeMember`, `getMember*` helpers, permission-context accessor.
- **CircleJoinCodes**: `createJoinCode`, `validateAndUseCode`, `revokeJoinCode`, `getJoinCode`.
- **CircleAdmin**: `requireAdmin` guard.

### Events (CircleEvents)
- `E1(circleId, circleName, admin, circleAddress)` — factory deployment.
- `E2(circleId, codeId, codeHash, expiresAt)` — join code created.
- `E3(circleId, member, codeId, tokenName, amountGiven, expiresAt)` — member joined.
- `E4(circleId, member, tokenName, amountGiven, expiresAt)` — permission updated.
- `E5(circleId, member)` — member removed.
- `E6(circleId, codeId)` — join code revoked.
- `E7(circleId, fromMember, recipient, tokenAddress, amount, caller)` — delegated transfer executed.

### Errors (CircleErrors)
`InvalidAddress`, `InvalidName`, `InvalidAmount`, `AlreadyMember`, `NotMember`, `NotAdmin`, `InvalidCode`, `CodeUsed`, `CodeExpired`, `InsufficientAmount`, `PermissionExpired`, `TokenMismatch`, `AmountTooLow`.

## ERC-7715 Execution Flow (transferToken)
1. Validate caller membership/admin, target token, expiry, and available `amountLeft` via `CircleMembers.canTransfer`.
2. Read `permissionsContext` directly from storage for `fromMember`.
3. Build ERC-20 `transfer` calldata and pack into a single execution tuple `(tokenAddress, 0 value, transferCalldata)`.
4. Call `delegationManager.redeemDelegations([permissionsContext], [bytes32(0)], [executionCalldata])`.
5. On success, update accounting and emit `E7`.

## Invariants and Design Notes
- Admin set once at construction; only guard is `CircleAdmin.requireAdmin`.
- Member self-sovereignty: only the member can mutate their permission; admin can only remove members or manage join codes.
- Accounting uses `amountUsed` and `amountLeft`; `updateMemberPermissionFull` always recomputes `amountLeft` from `amountGiven - amountUsed`.
- Join codes are one-time, hash-checked, optional expiry; invalid or expired codes revert or return false (handled by caller).
- Token binding is single-token per member record; switching tokens requires the member to update permission with the new token address/name.
- Expiry handling is enforced on transfer and update; `0` means indefinite.

## Usage Tips
- Derive `codeHash` off-chain: `keccak256(abi.encodePacked(codeString))` and keep `codeString` secret to the invitee.
- Store and pass `permissionsContext` exactly as returned by your ERC-7715 DelegationManager client flow; the contract treats it as an opaque blob.
- For UI/backends, prefer `getAllMembersWithDetails` for full structs or `getAllMembersPermissions` for flattened arrays.
- If a member lowers `amountGiven` below `amountUsed`, `amountLeft` bottoms at `0`; further transfers will fail until increased.
