"use client"

import { useEffect } from "react"
import { useAccount, useChainId, useSwitchChain } from "wagmi"

const BASE_SEPOLIA_ID = 84532

export function BaseSepoliaGuard() {
  const chainId = useChainId()
  const { isConnected } = useAccount()
  const { chains, switchChainAsync, isPending } = useSwitchChain()

  useEffect(() => {
    const baseSepolia = chains.find((chain) => chain.id === BASE_SEPOLIA_ID)
    if (!isConnected || !baseSepolia || !switchChainAsync) return
    if (chainId === BASE_SEPOLIA_ID || isPending) return

    switchChainAsync({ chainId: BASE_SEPOLIA_ID }).catch((err) => {
      console.warn("Failed to switch to Base Sepolia", err)
    })
  }, [chainId, chains, isConnected, isPending, switchChainAsync])

  return null
}
