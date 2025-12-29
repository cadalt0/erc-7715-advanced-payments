/**
 * ERC-7715 Permission Request Functions
 */

import { parseUnits } from 'viem'
import { setupWalletClient, setupPublicClient } from './wallet'
import { createSessionAccountFromAddress } from './wallet'
import { checkAccountUpgrade } from './account'
import type { PermissionConfig } from './types'

/**
 * Request ERC-7715 advanced permission using MetaMask Flask
 * Mirrors learn2 requestCustomPermission pattern
 */
export async function requestPermission(
  config: PermissionConfig,
  sessionAccountAddress: string,
  walletClient?: any, // viem WalletClient extended with erc7715ProviderActions
  userAddress?: string // Currently-connected Flask account
) {
  try {
    // Step 1: Set up Wallet Client (if not provided)
    const client = walletClient || setupWalletClient()
    
    // Verify the client has requestExecutionPermissions method
    if (typeof client.requestExecutionPermissions !== 'function') {
      throw new Error(
        'Wallet client not properly extended with erc7715ProviderActions(). ' +
        'Make sure MetaMask Flask 13.5.0+ is installed and the wallet client is properly configured.'
      )
    }

    // Step 2: Set up public client for account checks
    const publicClient = setupPublicClient()

    // Step 3: Create session account from address
    const sessionAccount = createSessionAccountFromAddress(sessionAccountAddress)

    // Step 4: Validate the user address (currently-connected Flask account)
    let connectedAddress = userAddress
    if (!connectedAddress) {
      // If no user address provided, this is an error - we need the connected address
      throw new Error(
        'userAddress (currently-connected Flask account) is required. ' +
        'Please ensure user is connected via MetaMask Flask before requesting permissions.'
      )
    }

    // Check account upgrade status for the connected address
    const accountCheck = await checkAccountUpgrade(publicClient, connectedAddress)
    
    // Verify addresses match to ensure we're using the correct account
    if (accountCheck.address.toLowerCase() !== connectedAddress.toLowerCase()) {
      throw new Error(
        'Connected account address mismatch during upgrade check'
      )
    }

    // Build permission data based on type
    const currentTime = Math.floor(Date.now() / 1000)
    const isNative = config.permissionType === 'native-token-periodic'

    let permissionData: any
    if (isNative) {
      // Native token periodic permission
      const periodAmount = parseUnits(config.amount, 18) // ETH has 18 decimals
      permissionData = {
        periodAmount,
        periodDuration: config.periodDuration,
        startTime: config.startTime || currentTime,
        justification: config.justification || 'Native token allowance',
      }
    } else {
      // ERC-20 token periodic permission
      const periodAmount = parseUnits(config.amount, config.tokenDecimals)
      permissionData = {
        tokenAddress: config.tokenAddress!,
        periodAmount,
        periodDuration: config.periodDuration,
        justification: config.justification || 'Token allowance',
      }
    }

    // Request Advanced Permissions using the session account as signer
    const grantedPermissions = await client.requestExecutionPermissions([
      {
        chainId: config.chainId,
        expiry: config.expiry,
        signer: {
          type: 'account',
          data: {
            address: sessionAccount.address,
          },
        },
        permission: {
          type: config.permissionType,
          data: permissionData,
        },
        isAdjustmentAllowed: config.isAdjustmentAllowed ?? false,
      },
    ])

    const grantedPermission = grantedPermissions[0]

    return {
      success: true,
      permissionsContext: (grantedPermission as any).permissionsContext ?? (grantedPermission as any).context,
      delegationManager: grantedPermission.signerMeta?.delegationManager,
      userAccountAddress: connectedAddress,
      userAccountIsUpgraded: accountCheck.isAccountUpgraded,
    }
  } catch (error: any) {
    // Handle the "no middleware configured" error specifically
    const errorMessage = error?.message || String(error) || ''
    const errorDetails = error?.details || ''
    
    if (errorMessage.includes('no middleware configured') || 
        errorMessage.includes('not supported') ||
        errorMessage.includes('wallet_requestExecutionPermissions') ||
        errorDetails.includes('no middleware configured')) {
      throw new Error(
        'MetaMask Flask ERC-7715 middleware is not configured. ' +
        'Please: 1) Completely close MetaMask Flask, 2) Restart Flask, 3) Refresh this page, ' +
        '4) Ensure Flask 13.5.0+ is installed.'
      )
    }
    
    // Handle user rejection
    if (error?.code === 4001) {
      throw new Error('User rejected the permission request.')
    }
    
    // Re-throw other errors
    return {
      success: false,
      error: errorMessage || 'Failed to request permission',
    }
  }
}
