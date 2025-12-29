"use client"

import { useState, useEffect } from "react"
import { type Address } from "viem"
import { findCirclesByMember, type CircleData } from "@/lib/circle-finder"

interface UseCirclesResult {
  circles: CircleData[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * React hook to fetch and manage circles for a connected wallet
 * 
 * @param walletAddress - The connected wallet address to check for circles
 * @returns Circle data, loading state, and error state
 */
export function useCircles(walletAddress: Address | undefined): UseCirclesResult {
  const [circles, setCircles] = useState<CircleData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCircles = async () => {
    if (!walletAddress) {
      setCircles([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const foundCircles = await findCirclesByMember(walletAddress)
      setCircles(foundCircles)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch circles"
      setError(errorMessage)
      console.error("useCircles error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCircles()
  }, [walletAddress])

  return {
    circles,
    loading,
    error,
    refetch: fetchCircles,
  }
}
