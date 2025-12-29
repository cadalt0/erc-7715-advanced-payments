import { WEB3AUTH_NETWORK } from "@web3auth/modal"
import { type Web3AuthContextConfig } from "@web3auth/modal/react"

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "BHgArYmWwSeq21czpcarYh0EVq2WWOzflX-NTK-tY1-1pauPzHKRRLgpABkmYiIV_og9jAvoIxQ8L3Smrwe04Lw"

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    chains: [
      {
        chainNamespace: "eip155",
        chainId: "0x14a34", // 84532 in hex
        rpcTarget: "https://sepolia.base.org",
        displayName: "Base Sepolia",
        blockExplorerUrl: "https://sepolia.basescan.org",
        ticker: "ETH",
        tickerName: "Ether",
      },
    ],
  },
}

export default web3AuthContextConfig
