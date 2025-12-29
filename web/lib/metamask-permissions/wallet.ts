/**
 * Wallet Client Setup for ERC-7715 Advanced Permissions
 */

import { createWalletClient, custom, createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { erc7715ProviderActions } from '@metamask/smart-accounts-kit/actions'

/**
 * Wrap ethereum provider to add missing methods for viem compatibility
 */
export function wrapEthereumProvider(provider: any) {
  if (!provider) return provider
  
  // If provider already has addListener, return as-is
  if (provider.addListener && provider.removeListener) {
    return provider
  }
  
  // Create a wrapped provider that adds missing methods
  return new Proxy(provider, {
    get(target, prop) {
      if (prop === 'addListener' && !target.addListener) {
        return target.on || (() => {})
      }
      if (prop === 'removeListener' && !target.removeListener) {
        return target.off || (() => {})
      }
      return target[prop as keyof typeof target]
    },
  })
}

/**
 * Set up Public Client for Base Sepolia
 */
export function setupPublicClient() {
  const customRpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL
  const rpcUrl = customRpcUrl || 'https://sepolia.base.org'
  
  return createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl, {
      timeout: 10000,
      retryCount: 2,
      retryDelay: 1000,
    }),
  })
}

/**
 * Create a session account object from address only (for permission requests)
 * Private key is not needed for requesting permissions
 */
export function createSessionAccountFromAddress(address: string) {
  return {
    address: address as `0x${string}`,
  } as any
}

/**
 * Get MetaMask Flask provider specifically (not Web3Auth or other wallets)
 */
function getMetaMaskFlaskProvider() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum provider found. Please install MetaMask Flask.')
  }

  // If window.ethereum.providers exists, search for MetaMask Flask
  if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
    const flaskProvider = window.ethereum.providers.find(
      (p: any) => p.isMetaMask && p.isFlask
    )
    if (flaskProvider) return flaskProvider

    // Fallback: try to find any MetaMask provider
    const metamaskProvider = window.ethereum.providers.find((p: any) => p.isMetaMask)
    if (metamaskProvider) return metamaskProvider
  }

  // If no providers array, check if the main provider is MetaMask Flask
  if (window.ethereum.isMetaMask) {
    return window.ethereum
  }

  throw new Error(
    'MetaMask Flask not detected. Please install MetaMask Flask and ensure it is enabled.'
  )
}

/**
 * Set up Wallet Client extended with ERC-7715 actions
 * Requires MetaMask Flask 13.5.0+
 */
export function setupWalletClient() {
  try {
    const flaskProvider = getMetaMaskFlaskProvider()
    const wrappedProvider = wrapEthereumProvider(flaskProvider)
    const walletClient = createWalletClient({
      transport: custom(wrappedProvider),
    }).extend(erc7715ProviderActions())

    // Verify the extension worked
    if (typeof walletClient.requestExecutionPermissions !== 'function') {
      throw new Error(
        'ERC-7715 middleware not configured in MetaMask Flask. ' +
        'Please ensure Flask 13.5.0+ is installed and restart Flask completely.'
      )
    }

    return walletClient
  } catch (error: any) {
    if (error?.message?.includes('no middleware configured') || error?.message?.includes('not supported')) {
      throw new Error(
        'MetaMask Flask ERC-7715 middleware is not configured. ' +
        'Please: 1) Restart MetaMask Flask completely, 2) Refresh this page, 3) Ensure Flask 13.5.0+ is installed. ' +
        'The "no middleware configured" error means Flask needs to be restarted to enable ERC-7715 support.'
      )
    }
    throw error
  }
}

/**
 * Connect Wallet and get extended client
 */
export async function connectWallet() {
  if (typeof window === 'undefined') {
    throw new Error('This function must be called in the browser.')
  }

  try {
    const flaskProvider = getMetaMaskFlaskProvider()
    const wrappedProvider = wrapEthereumProvider(flaskProvider)
    const walletClient = createWalletClient({
      transport: custom(wrappedProvider),
    }).extend(erc7715ProviderActions())

    if (typeof walletClient.requestExecutionPermissions !== 'function') {
      throw new Error(
        'Failed to extend wallet client with erc7715ProviderActions(). ' +
        'Make sure MetaMask Flask 13.5.0+ is installed and restart Flask.'
      )
    }

    const addresses = await walletClient.requestAddresses()
    const address = addresses[0]

    if (!address) {
      throw new Error('No accounts found. Please connect your MetaMask Flask wallet.')
    }

    return {
      address,
      walletClient,
    }
  } catch (error: any) {
    console.error('Connect wallet error:', error)
    
    if (error?.code === 4001) {
      throw new Error('User rejected the connection request. Please approve the connection in MetaMask Flask.')
    }
    
    if (error?.message) {
      throw error
    }
    
    throw new Error(`Failed to connect wallet: ${error?.message || String(error)}`)
  }
}
