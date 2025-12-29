/**
 * Types for ERC-7715 Advanced Permissions
 */

export type PermissionType = 'native-token-periodic' | 'erc20-token-periodic'

export interface PermissionConfig {
  permissionType: PermissionType
  tokenAddress?: string
  amount: string
  tokenDecimals: number
  periodDuration: number
  startTime?: number
  expiry: number
  justification?: string
  isAdjustmentAllowed?: boolean
  chainId: number
}

export interface PermissionResult {
  success: boolean
  permissionsContext?: string
  delegationManager?: string
  userAccountAddress?: string
  userAccountIsUpgraded?: boolean
  error?: string
}
