// Enforcer Types for LexEnforcer Dashboard

export type EnforcementAction = "FREEZE" | "UNFREEZE" | "FORCE_TRANSFER" | "GENERATE_SAR";

export type EnforcementStatus = "pending" | "executing" | "succeeded" | "failed" | "skipped";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "BLOCKED";

export type EnforcementRecord = {
  id: string;
  targetAddress: string;
  action: EnforcementAction;
  status: EnforcementStatus;
  triggerSource: "oracle_event" | "manual";
  riskScore: number;
  riskLevel: RiskLevel;
  reason: string;
  txHash?: string;
  createdAt: string;
  executedAt?: string;
  // Legacy compatibility
  risk?: number;
  level?: RiskLevel;
  walletAddress?: string;
};

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  action: EnforcementAction;
  targetAddress: string;
  operator: "SYSTEM" | "USER";
  txHash?: string;
  details?: string;
};

export type SARReport = {
  id: string;
  subjectAddress: string;
  riskScore: number;
  riskLevel: RiskLevel;
  generatedAt: string;
  status: "draft" | "ready" | "submitted";
  content: string;
};

// Demo data for Enforcer Dashboard
export const DEMO_PENDING_ACTIONS: EnforcementRecord[] = [
  {
    id: "pending-1",
    targetAddress: "0x7f3a8c2E9b4D1F6e5A3c7B0d2E8f4A6C9b1D3e",
    action: "FREEZE",
    status: "pending",
    triggerSource: "oracle_event",
    riskScore: 807,
    riskLevel: "HIGH",
    reason: "High-risk address detected by GoPlus Security API - Score: 807",
    createdAt: new Date(Date.now() - 2 * 60_000).toISOString(),
  },
  {
    id: "pending-2",
    targetAddress: "0x9e4d2A7b5C1f8E3d6B0a4F7c2D5e8A1b3C6f9D",
    action: "GENERATE_SAR",
    status: "pending",
    triggerSource: "oracle_event",
    riskScore: 650,
    riskLevel: "MEDIUM",
    reason: "Medium risk - manual review required",
    createdAt: new Date(Date.now() - 15 * 60_000).toISOString(),
  },
];

export const DEMO_EXECUTED_ACTIONS: EnforcementRecord[] = [
  {
    id: "exec-1",
    targetAddress: "0xDead000000000000000000000000000000000000",
    action: "FREEZE",
    status: "succeeded",
    triggerSource: "oracle_event",
    riskScore: 950,
    riskLevel: "BLOCKED",
    reason: "Known malicious address - blacklisted by multiple providers",
    txHash: "0x789012345678901234567890abcdef1234567890abcdef12345678901234567890",
    createdAt: new Date(Date.now() - 45 * 60_000).toISOString(),
    executedAt: new Date(Date.now() - 44 * 60_000).toISOString(),
  },
  {
    id: "exec-2",
    targetAddress: "0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B",
    action: "FREEZE",
    status: "succeeded",
    triggerSource: "manual",
    riskScore: 720,
    riskLevel: "HIGH",
    reason: "Manual enforcement - suspicious activity pattern detected",
    txHash: "0xabc123def456789012345678901234567890abcdef1234567890abcdef123456",
    createdAt: new Date(Date.now() - 90 * 60_000).toISOString(),
    executedAt: new Date(Date.now() - 89 * 60_000).toISOString(),
  },
  {
    id: "exec-3",
    targetAddress: "0x7f3a8c2E9b4D1F6e5A3c7B0d2E8f4A6C9b1D3e",
    action: "GENERATE_SAR",
    status: "succeeded",
    triggerSource: "manual",
    riskScore: 807,
    riskLevel: "HIGH",
    reason: "SAR generated for regulatory submission",
    createdAt: new Date(Date.now() - 120 * 60_000).toISOString(),
    executedAt: new Date(Date.now() - 118 * 60_000).toISOString(),
  },
];

export const DEMO_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: "audit-1",
    timestamp: new Date(Date.now() - 2 * 60_000).toISOString(),
    action: "FREEZE",
    targetAddress: "0x7f3a8c2E9b4D1F6e5A3c7B0d2E8f4A6C9b1D3e",
    operator: "SYSTEM",
    details: "Auto-triggered from RiskAssessmentUpdated event",
  },
  {
    id: "audit-2",
    timestamp: new Date(Date.now() - 45 * 60_000).toISOString(),
    action: "FREEZE",
    targetAddress: "0xDead000000000000000000000000000000000000",
    operator: "SYSTEM",
    txHash: "0x789012345678901234567890abcdef1234567890abcdef12345678901234567890",
    details: "Executed via uRWA.setFrozen()",
  },
  {
    id: "audit-3",
    timestamp: new Date(Date.now() - 90 * 60_000).toISOString(),
    action: "FREEZE",
    targetAddress: "0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B",
    operator: "USER",
    txHash: "0xabc123def456789012345678901234567890abcdef1234567890abcdef123456",
    details: "Manual enforcement by @Founder",
  },
  {
    id: "audit-4",
    timestamp: new Date(Date.now() - 120 * 60_000).toISOString(),
    action: "GENERATE_SAR",
    targetAddress: "0x7f3a8c2E9b4D1F6e5A3c7B0d2E8f4A6C9b1D3e",
    operator: "USER",
    details: "SAR report generated and downloaded",
  },
  {
    id: "audit-5",
    timestamp: new Date(Date.now() - 180 * 60_000).toISOString(),
    action: "UNFREEZE",
    targetAddress: "0x2b1c5D8e3F7a0C4b6E9d1A5f8B2c4D7e0F3a6B",
    operator: "USER",
    txHash: "0xdef456789012345678901234567890abcdef1234567890abcdef123456789012",
    details: "False positive - cleared after manual review",
  },
];

export const DEMO_SAR_REPORT: SARReport = {
  id: "sar-demo-1",
  subjectAddress: "0x7f3a8c2E9b4D1F6e5A3c7B0d2E8f4A6C9b1D3e",
  riskScore: 807,
  riskLevel: "HIGH",
  generatedAt: new Date().toISOString(),
  status: "draft",
  content: `# Suspicious Activity Report (SAR)

## Report Information
- **Report ID**: SAR-2024-0001
- **Generated**: ${new Date().toLocaleDateString()}
- **Status**: Draft - Pending Review

## Subject Information
- **Wallet Address**: \`0x7f3a8c2E9b4D1F6e5A3c7B0d2E8f4A6C9b1D3e\`
- **Risk Score**: 807
- **Risk Level**: HIGH
- **Chain**: Sepolia Testnet

## Detection Summary
The subject address was flagged by the ChainLex Oracle system following an automated risk assessment triggered by transfer activity.

### Risk Indicators Detected
- High-risk address classification by GoPlus Security API
- Suspicious transaction patterns identified
- Potential connection to sanctioned entities

## Timeline of Events
1. **Transfer Detected**: Token transfer initiated from subject address
2. **Oracle Assessment**: GoPlus API returned risk score of 807
3. **Automatic Freeze**: uRWA contract executed setFrozen()
4. **SAR Generation**: This report generated for regulatory review

## Recommended Actions
- [ ] Submit to relevant regulatory authority
- [ ] Conduct enhanced due diligence
- [ ] Consider permanent blacklist if confirmed

## Supporting Evidence
- Transaction Hash: \`0xabc123def456789012345678901234567890abcdef1234567890abcdef123456\`
- Assessment Timestamp: ${new Date(Date.now() - 2 * 60_000).toISOString()}

---
*This report was automatically generated by ChainLex LexEnforcer module.*
*For questions, contact compliance@chainlex.ai*`,
};

export const DEMO_CONTRACTS_ENFORCER = {
  uRWA: "0x704c1ea432B9bab6F9DFc6a7425a1fe6358c0a77",
  chainlinkRisk: "0x376c431443FFFFaf23A97Ae2698664F58e3e9e5A",
  consumer: "0xF97B5E5d8724cf9e6C2e5f3C7920e31669c1Dafe",
};
