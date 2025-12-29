import { useEffect, useState } from 'react'
import { createWalletClient, custom } from 'viem'
import { erc7715ProviderActions } from '@metamask/smart-accounts-kit/actions'
import { connectWallet, wrapEthereumProvider } from '@/lib/metamask-permissions/wallet'

/**
 * Build an ERC-7715-enabled viem wallet client using the Web3Auth provider.
 * Falls back to MetaMask Flask (connectWallet) if Web3Auth provider fails.
 */
export function useWalletClient(isConnected: boolean, provider: any, connectedAddress?: string | null) {
  const [walletClient, setWalletClient] = useState<any>(null)
  const [isSettingUp, setIsSettingUp] = useState(false)

  useEffect(() => {
    if (isConnected && provider) {
      const setup = async () => {
        setIsSettingUp(true)
        try {
          // Primary path: use Web3Auth provider
          const wrapped = wrapEthereumProvider(provider)
          const client = createWalletClient({ transport: custom(wrapped) }).extend(
            erc7715ProviderActions()
          )

          if (typeof client.requestExecutionPermissions !== 'function') {
            throw new Error('Failed to extend wallet client with erc7715ProviderActions()')
          }

          setWalletClient(client)
          setIsSettingUp(false)
          return
        } catch (err) {
          console.error('Wallet client setup with Web3Auth failed:', err)
        }

        // Fallback: MetaMask Flask via connectWallet()
        try {
          const result = await connectWallet()
          setWalletClient(result.walletClient)
        } catch (fallbackErr) {
          console.error('Fallback wallet client setup failed:', fallbackErr)
          setWalletClient(null)
        } finally {
          setIsSettingUp(false)
        }
      }

      setup()
    } else {
      setWalletClient(null)
      setIsSettingUp(false)
    }
  }, [isConnected, provider, connectedAddress])

  return { walletClient, isSettingUp }
}
