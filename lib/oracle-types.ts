export type OracleAttestation = {
  id: string;
  walletAddress: string;
  chain: string;
  provider: string;
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH" | "BLOCKED";
  isBlacklisted: boolean;
  reason: string;
  status: "succeeded" | "failed";
  createdAt: string;
  txHash: string;
  action: "PASS" | "REVIEW" | "FREEZE";
};

export type GateCheck = {
  address: string;
  allowed: boolean;
  reason: string;
  score: number;
  dataAge: string;
  stalenessLimit: string;
};

export type VaultConfig = {
  address: string;
  tokenLabel: string;
  complianceFeedLabel: string;
  complianceFeedAddress: string;
};

// Demo data for Oracle Dashboard - 12 data points with 5-minute intervals
export const DEMO_EVENTS: OracleAttestation[] = [
  {
    id: "demo-1",
    walletAddress: "0x7f3a8c2E9b4D1F6e5A3c7B0d2E8f4A6C9b1D3e",
    chain: "Sepolia",
    provider: "GoPlus",
    score: 285,
    level: "LOW",
    isBlacklisted: false,
    reason: "Address passed all security checks",
    status: "succeeded",
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    txHash: "0xabc123def456789012345678901234567890abcdef1234567890abcdef123456",
    action: "PASS",
  },
  {
    id: "demo-2",
    walletAddress: "0x2b1c5D8e3F7a0C4b6E9d1A5f8B2c4D7e0F3a6B",
    chain: "Sepolia",
    provider: "GoPlus",
    score: 420,
    level: "MEDIUM",
    isBlacklisted: false,
    reason: "Medium risk - flagged by one source, cleared by another",
    status: "succeeded",
    createdAt: new Date(Date.now() - 10 * 60_000).toISOString(),
    txHash: "0xdef456789012345678901234567890abcdef1234567890abcdef123456789012",
    action: "REVIEW",
  },
  {
    id: "demo-3",
    walletAddress: "0x9e4d2A7b5C1f8E3d6B0a4F7c2D5e8A1b3C6f9D",
    chain: "Sepolia",
    provider: "GoPlus + Fallback",
    score: 380,
    level: "MEDIUM",
    isBlacklisted: false,
    reason: "Medium risk - requires manual review",
    status: "succeeded",
    createdAt: new Date(Date.now() - 15 * 60_000).toISOString(),
    txHash: "0x123456789012345678901234567890abcdef1234567890abcdef1234567890ab",
    action: "REVIEW",
  },
  {
    id: "demo-4",
    walletAddress: "0xAdB60036FE9d4c269Ed5ca8C5958dd29bc66D814",
    chain: "Sepolia",
    provider: "GoPlus",
    score: 720,
    level: "HIGH",
    isBlacklisted: false,
    reason: "High-risk address detected by GoPlus Security API",
    status: "succeeded",
    createdAt: new Date(Date.now() - 20 * 60_000).toISOString(),
    txHash: "0x456789012345678901234567890abcdef1234567890abcdef1234567890123456",
    action: "FREEZE",
  },
  {
    id: "demo-5",
    walletAddress: "0xDead000000000000000000000000000000000000",
    chain: "Sepolia",
    provider: "GoPlus",
    score: 195,
    level: "LOW",
    isBlacklisted: false,
    reason: "Clean address - no risk signals detected",
    status: "succeeded",
    createdAt: new Date(Date.now() - 25 * 60_000).toISOString(),
    txHash: "0x789012345678901234567890abcdef1234567890abcdef12345678901234567890",
    action: "PASS",
  },
  {
    id: "demo-6",
    walletAddress: "0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B",
    chain: "Sepolia",
    provider: "GoPlus",
    score: 550,
    level: "MEDIUM",
    isBlacklisted: false,
    reason: "Medium risk - flagged by one source",
    status: "succeeded",
    createdAt: new Date(Date.now() - 30 * 60_000).toISOString(),
    txHash: "0x1111111111111111111111111111111111111111111111111111111111111111",
    action: "REVIEW",
  },
  {
    id: "demo-7",
    walletAddress: "0x2b3C4d5E6f7A8b9C0d1E2f3A4b5C6d7E8f9A0b1C",
    chain: "Sepolia",
    provider: "GoPlus",
    score: 890,
    level: "HIGH",
    isBlacklisted: false,
    reason: "High-risk address detected",
    status: "succeeded",
    createdAt: new Date(Date.now() - 35 * 60_000).toISOString(),
    txHash: "0x2222222222222222222222222222222222222222222222222222222222222222",
    action: "FREEZE",
  },
  {
    id: "demo-8",
    walletAddress: "0x3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B1c2D",
    chain: "Sepolia",
    provider: "GoPlus + Fallback",
    score: 310,
    level: "LOW",
    isBlacklisted: false,
    reason: "Address passed all security checks",
    status: "succeeded",
    createdAt: new Date(Date.now() - 40 * 60_000).toISOString(),
    txHash: "0x3333333333333333333333333333333333333333333333333333333333333333",
    action: "PASS",
  },
  {
    id: "demo-9",
    walletAddress: "0x4d5E6f7A8b9C0d1E2f3A4b5C6d7E8f9A0b1C2d3E",
    chain: "Sepolia",
    provider: "GoPlus",
    score: 475,
    level: "MEDIUM",
    isBlacklisted: false,
    reason: "Medium risk - requires review",
    status: "succeeded",
    createdAt: new Date(Date.now() - 45 * 60_000).toISOString(),
    txHash: "0x4444444444444444444444444444444444444444444444444444444444444444",
    action: "REVIEW",
  },
  {
    id: "demo-10",
    walletAddress: "0x5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B1c2D3e4F",
    chain: "Sepolia",
    provider: "GoPlus",
    score: 165,
    level: "LOW",
    isBlacklisted: false,
    reason: "Clean address - no risk signals",
    status: "succeeded",
    createdAt: new Date(Date.now() - 50 * 60_000).toISOString(),
    txHash: "0x5555555555555555555555555555555555555555555555555555555555555555",
    action: "PASS",
  },
  {
    id: "demo-11",
    walletAddress: "0x6f7A8b9C0d1E2f3A4b5C6d7E8f9A0b1C2d3E4f5A",
    chain: "Sepolia",
    provider: "GoPlus",
    score: 680,
    level: "HIGH",
    isBlacklisted: false,
    reason: "High-risk address flagged",
    status: "succeeded",
    createdAt: new Date(Date.now() - 55 * 60_000).toISOString(),
    txHash: "0x6666666666666666666666666666666666666666666666666666666666666666",
    action: "FREEZE",
  },
  {
    id: "demo-12",
    walletAddress: "0x7a8B9c0D1e2F3a4B5c6D7e8F9a0B1c2D3e4F5a6B",
    chain: "Sepolia",
    provider: "GoPlus",
    score: 245,
    level: "LOW",
    isBlacklisted: false,
    reason: "Address passed all security checks",
    status: "succeeded",
    createdAt: new Date(Date.now() - 60 * 60_000).toISOString(),
    txHash: "0x7777777777777777777777777777777777777777777777777777777777777777",
    action: "PASS",
  },
];

export const DEMO_VAULT_CHECKS: GateCheck[] = [
  {
    address: "0x7f3a8c2E9b4D1F6e5A3c7B0d2E8f4A6C9b1D3e",
    allowed: false,
    reason: "Risk level too high (score: 807)",
    score: 807,
    dataAge: "4min",
    stalenessLimit: "1hr",
  },
  {
    address: "0x2b1c5D8e3F7a0C4b6E9d1A5f8B2c4D7e0F3a6B",
    allowed: true,
    reason: "User is allowed",
    score: 312,
    dataAge: "2min",
    stalenessLimit: "1hr",
  },
];

export const DEMO_CONTRACTS = {
  chainlinkRisk: "0x376c431443FFFFaf23A97Ae2698664F58e3e9e5A",
  urwa: "0x704c1ea432B9bab6F9DFc6a7425a1fe6358c0a77",
  consumer: "0xF97B5E5d8724cf9e6C2e5f3C7920e31669c1Dafe",
  complianceVault: "0x71eb1C48A9504f226fE703606a7a3276a5F85815",
};
