/**
 * Contract ABIs for Circle and CircleFactory
 * Based on the Solidity contracts
 */

export const CircleFactoryABI = [
  {
    "inputs": [],
    "name": "getAllCircles",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalCircles",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "circles",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "circleId", "type": "uint256" }],
    "name": "getCircle",
    "outputs": [{ "internalType": "address", "name": "circleAddress", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "circleName", "type": "string" },
      { "internalType": "string", "name": "adminTokenName", "type": "string" },
      { "internalType": "address", "name": "adminTokenAddress", "type": "address" },
      { "internalType": "uint256", "name": "adminAmountGiven", "type": "uint256" },
      { "internalType": "uint256", "name": "adminExpiresAt", "type": "uint256" }
    ],
    "name": "deployCircle",
    "outputs": [
      { "internalType": "uint256", "name": "circleId", "type": "uint256" },
      { "internalType": "address", "name": "circleAddress", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export const CircleABI = [
  {
    "inputs": [{ "internalType": "address", "name": "wallet", "type": "address" }],
    "name": "isMember",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllMembers",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "codeHash", "type": "bytes32" },
      { "internalType": "uint256", "name": "expiresAt", "type": "uint256" }
    ],
    "name": "createJoinCode",
    "outputs": [{ "internalType": "uint256", "name": "codeId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "codeId", "type": "uint256" }],
    "name": "getJoinCode",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "codeId", "type": "uint256" },
          { "internalType": "bytes32", "name": "codeHash", "type": "bytes32" },
          { "internalType": "bool", "name": "isUsed", "type": "bool" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "uint256", "name": "expiresAt", "type": "uint256" }
        ],
        "internalType": "struct JoinCode",
        "name": "code",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "codeId", "type": "uint256" },
      { "internalType": "bytes32", "name": "codeHash", "type": "bytes32" },
      { "internalType": "string", "name": "tokenName", "type": "string" },
      { "internalType": "address", "name": "tokenAddress", "type": "address" },
      { "internalType": "uint256", "name": "amountGiven", "type": "uint256" },
      { "internalType": "uint256", "name": "expiresAt", "type": "uint256" },
      { "internalType": "bytes", "name": "permissionsContext", "type": "bytes" }
    ],
    "name": "joinCircle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "memberAddress", "type": "address" }],
    "name": "getMember",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "memberAddress", "type": "address" },
          {
            "components": [
              { "internalType": "string", "name": "tokenName", "type": "string" },
              { "internalType": "address", "name": "tokenAddress", "type": "address" },
              { "internalType": "uint256", "name": "amountGiven", "type": "uint256" },
              { "internalType": "uint256", "name": "amountUsed", "type": "uint256" },
              { "internalType": "uint256", "name": "amountLeft", "type": "uint256" },
              { "internalType": "uint256", "name": "expiresAt", "type": "uint256" },
              { "internalType": "bytes", "name": "permissionsContext", "type": "bytes" }
            ],
            "internalType": "struct Permission",
            "name": "permission",
            "type": "tuple"
          },
          { "internalType": "uint256", "name": "joinedAt", "type": "uint256" }
        ],
        "internalType": "struct Member",
        "name": "member",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "memberAddress", "type": "address" },
      { "internalType": "string", "name": "newTokenName", "type": "string" },
      { "internalType": "address", "name": "newTokenAddress", "type": "address" },
      { "internalType": "uint256", "name": "amountChange", "type": "uint256" },
      { "internalType": "uint8", "name": "operationType", "type": "uint8" },
      { "internalType": "uint256", "name": "newExpiresAt", "type": "uint256" },
      { "internalType": "bytes", "name": "newPermissionsContext", "type": "bytes" }
    ],
    "name": "updateMemberPermission",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "fromMember", "type": "address" },
      { "internalType": "address", "name": "tokenAddress", "type": "address" },
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "transferToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const
