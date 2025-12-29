"use client"

import { requestPermission } from './metamask-permissions/request-permission'
import { connectWallet } from './metamask-permissions/wallet'
import type { PermissionConfig } from './metamask-permissions/types'

export interface GrantDelegationConfig {
  circleAddress: string
  tokenAddress: string
  tokenDecimals: number
  amount: string // human units
  periodDuration: number // seconds
  expiry: number // unix seconds
  justification?: string
  chainId: number
}

export interface GrantDelegationResult {
  success: boolean
  permissionsContext?: string
  delegationManager?: string
  userAccountAddress?: string
  userAccountIsUpgraded?: boolean
  error?: string
}

/**
 * Grant ERC-7715 delegation permission
 * Primary path: use provided walletClient/userAddress (Web3Auth provider)
 * Fallback: connect to MetaMask Flask and use its address
 */
export async function grantCircleDelegation(
  sessionAccountAddress: string,
  config: GrantDelegationConfig,
  walletClient?: any,
  userAddress?: string
): Promise<GrantDelegationResult> {
  try {
    if (!sessionAccountAddress) throw new Error("Missing session account address")

    let client = walletClient
    let delegatorAddress = userAddress

    // Fallback to MetaMask Flask if no walletClient/userAddress provided
    if (!client) {
      const { address: flaskAddress, walletClient: flaskClient } = await connectWallet()
      client = flaskClient
      delegatorAddress = flaskAddress
    }

    if (!delegatorAddress) {
      throw new Error('Connected delegator address not available')
    }

    // Build permission config
    const permissionConfig: PermissionConfig = {
      permissionType: 'erc20-token-periodic',
      tokenAddress: config.tokenAddress,
      amount: config.amount,
      tokenDecimals: config.tokenDecimals,
      periodDuration: config.periodDuration,
      expiry: config.expiry,
      justification: config.justification || "Circle recurring allowance",
      isAdjustmentAllowed: false,
      chainId: config.chainId,
    }

    // Request permission using proper ERC-7715 flow
    const result = await requestPermission(
      permissionConfig,
      sessionAccountAddress,
      client,
      delegatorAddress
    )

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to grant permission',
      }
    }

    return {
      success: true,
      permissionsContext: result.permissionsContext,
      delegationManager: result.delegationManager,
      userAccountAddress: result.userAccountAddress,
      userAccountIsUpgraded: result.userAccountIsUpgraded,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("grantCircleDelegation error", error)
    return { success: false, error: message }
  }
}
