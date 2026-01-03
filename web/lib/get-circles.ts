"use client"

import { type Address } from "viem"
import { findCirclesByMember, type CircleData } from "./circle-finder"
import { getCirclesFromEnvio } from "./envio-circles"

/**
 * Smart circle fetcher that switches between Envio and RPC based on env config
 * 
 * @param walletAddress - Connected wallet address
 * @returns Circles array
 */
export async function getCircles(walletAddress: Address): Promise<CircleData[]> {
  const envioMode = process.env.NEXT_PUBLIC_ENVIO_MODE?.toLowerCase()
  const isEnvioEnabled = envioMode === "on"

  console.log(`[GetCircles] Mode: ${isEnvioEnabled ? "ENVIO" : "RPC"}`)

  try {
    if (isEnvioEnabled) {
      // Use Envio GraphQL
      return await getCirclesFromEnvio(walletAddress)
    } else {
      // Use RPC (current implementation)
      return await findCirclesByMember(walletAddress)
    }
  } catch (error) {
    console.error("[GetCircles] Error fetching circles:", error)
    
    // Fallback to RPC if Envio fails
    if (isEnvioEnabled) {
      console.warn("[GetCircles] Envio failed, falling back to RPC")
      try {
        return await findCirclesByMember(walletAddress)
      } catch (fallbackError) {
        console.error("[GetCircles] RPC fallback also failed:", fallbackError)
        return []
      }
    }
    
    return []
  }
}
