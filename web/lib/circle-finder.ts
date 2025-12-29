"use client"

import { createPublicClient, http, type Address } from "viem"
import { baseSepolia } from "viem/chains"
import { CircleFactoryABI, CircleABI } from "./circle-abis"

// Hardcoded contract addresses
const FACTORY_ADDRESS = "0x1e30ca31827b66E9b7d4d32e67F59F7E83983213" as Address
const RPC_URL = "https://sepolia.base.org"

/**
 * Circle data returned from queries
 */
export interface CircleData {
  address: Address
  name: string
  admin: Address
  members: Address[]
}

/**
 * Setup Public Client for Base Sepolia
 */
function setupPublicClient() {
  return createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
  })
}

/**
 * Get all circles from the factory
 */
export async function getAllCircles(): Promise<Address[]> {
  const client = setupPublicClient()
  
  try {
    // Try getAllCircles() first
    const circles = await client.readContract({
      address: FACTORY_ADDRESS,
      abi: CircleFactoryABI,
      functionName: "getAllCircles",
    }) as Address[]
    
    return circles
  } catch (error) {
    console.warn("getAllCircles() failed, trying getTotalCircles():", error)
    
    // Fallback to getTotalCircles() + circles(i)
    try {
      const total = await client.readContract({
        address: FACTORY_ADDRESS,
        abi: CircleFactoryABI,
        functionName: "getTotalCircles",
      }) as bigint
      
      const circleAddresses: Address[] = []
      for (let i = 0; i < Number(total); i++) {
        const addr = await client.readContract({
          address: FACTORY_ADDRESS,
          abi: CircleFactoryABI,
          functionName: "circles",
          args: [BigInt(i)],
        }) as Address
        circleAddresses.push(addr)
      }
      
      return circleAddresses
    } catch (fallbackError) {
      console.error("Failed to get circles:", fallbackError)
      return []
    }
  }
}

/**
 * Check if a wallet is a member of a specific circle
 */
export async function isMemberOfCircle(circleAddress: Address, walletAddress: Address): Promise<boolean> {
  const client = setupPublicClient()
  
  try {
    const isMember = await client.readContract({
      address: circleAddress,
      abi: CircleABI,
      functionName: "isMember",
      args: [walletAddress],
    }) as boolean
    
    return isMember
  } catch (error) {
    console.error(`Failed to check membership for ${circleAddress}:`, error)
    return false
  }
}

/**
 * Get detailed information about a circle
 */
export async function getCircleInfo(circleAddress: Address): Promise<CircleData | null> {
  const client = setupPublicClient()
  
  try {
    // Try to get admin and members
    const [admin, members] = await Promise.all([
      client.readContract({
        address: circleAddress,
        abi: CircleABI,
        functionName: "admin",
      }).catch(() => null) as Promise<Address | null>,
      client.readContract({
        address: circleAddress,
        abi: CircleABI,
        functionName: "getAllMembers",
      }).catch(() => []) as Promise<Address[]>,
    ])
    
    // Try to get name, but fall back to address if it fails
    let name = ""
    try {
      name = await client.readContract({
        address: circleAddress,
        abi: CircleABI,
        functionName: "name",
      }) as string
    } catch (e) {
      // Circle doesn't have name() function or it reverted
      // Use the short address as a fallback
      name = `Circle ${circleAddress.slice(0, 6)}...${circleAddress.slice(-4)}`
    }
    
    return {
      address: circleAddress,
      name,
      admin: admin || ("0x" as Address),
      members: members || [],
    }
  } catch (error) {
    console.error(`Failed to get circle info for ${circleAddress}:`, error)
    // Return minimal data with a placeholder name
    return {
      address: circleAddress,
      name: `Circle ${circleAddress.slice(0, 6)}...${circleAddress.slice(-4)}`,
      admin: "0x" as Address,
      members: [],
    }
  }
}

/**
 * Find all circles that a wallet is a member of
 */
export async function findCirclesByMember(walletAddress: Address): Promise<CircleData[]> {
  try {
    console.log(`Finding circles for wallet: ${walletAddress}`)
    
    // Get all circles
    const allCircles = await getAllCircles()
    console.log(`Found ${allCircles.length} total circles`)
    
    // Check membership for each circle
    const membershipChecks = await Promise.all(
      allCircles.map(async (circleAddress) => ({
        address: circleAddress,
        isMember: await isMemberOfCircle(circleAddress, walletAddress),
      }))
    )
    
    // Filter to only circles where wallet is a member
    const memberCircleAddresses = membershipChecks
      .filter((check) => check.isMember)
      .map((check) => check.address)
    
    console.log(`Wallet is member of ${memberCircleAddresses.length} circles`)
    
    // Get detailed info for each circle
    const circleInfos = await Promise.all(
      memberCircleAddresses.map((addr) => getCircleInfo(addr))
    )
    
    // Filter out any failed fetches
    return circleInfos.filter((info): info is CircleData => info !== null)
  } catch (error) {
    console.error("Failed to find circles by member:", error)
    return []
  }
}
