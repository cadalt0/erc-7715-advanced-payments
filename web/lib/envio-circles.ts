"use client"

import { type Address } from "viem"
import { getCircleInfo, isMemberOfCircle, type CircleData } from "./circle-finder"

/**
 * Fetch circle addresses from Envio GraphQL API
 * Then fetch detailed info from RPC
 */
export async function getCirclesFromEnvio(walletAddress: Address): Promise<CircleData[]> {
  const graphqlUrl = process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_URL
  const adminSecret = process.env.NEXT_PUBLIC_ENVIO_ADMIN_SECRET

  if (!graphqlUrl) {
    throw new Error("NEXT_PUBLIC_ENVIO_GRAPHQL_URL is not set")
  }

  try {
    // Query all circle addresses from Envio (fast index lookup)
    // Map: a=circleId, b=circleName, c=admin, d=circleAddress
    const response = await fetch(graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(adminSecret && { "x-hasura-admin-secret": adminSecret }),
      },
      body: JSON.stringify({
        query: `
          query {
            Circle_E1(order_by: {id: desc}) {
              d
            }
          }
        `,
      }),
    })

    if (!response.ok) {
      throw new Error(`Envio GraphQL error: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.errors) {
      throw new Error(`GraphQL error: ${data.errors[0]?.message || "Unknown error"}`)
    }

    const events = data.data?.Circle_E1 || []
    const circleAddresses = [...new Set(events.map((e: any) => e.d as Address))]

    console.log(`[Envio] Found ${circleAddresses.length} unique circles`)

    // Now check membership and fetch details via RPC
    const membershipChecks = await Promise.all(
      circleAddresses.map(async (circleAddress) => ({
        address: circleAddress,
        isMember: await isMemberOfCircle(circleAddress, walletAddress),
      }))
    )

    const memberCircleAddresses = membershipChecks
      .filter((check) => check.isMember)
      .map((check) => check.address)

    console.log(`[Envio] Wallet is member of ${memberCircleAddresses.length} circles`)

    // Fetch detailed info (members, admin, name) from RPC
    const circleInfos = await Promise.all(
      memberCircleAddresses.map((addr) => getCircleInfo(addr))
    )

    return circleInfos.filter((info): info is CircleData => info !== null)
  } catch (error) {
    console.error("[Envio] Failed to fetch circles:", error)
    throw error
  }
}
