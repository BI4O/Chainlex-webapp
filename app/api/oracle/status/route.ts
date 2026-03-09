import { NextResponse } from "next/server";
import { DEMO_CONTRACTS } from "@/lib/oracle-types";

export async function GET() {
  return NextResponse.json({
    active: true,
    network: "sepolia",
    contracts: {
      chainlinkRisk: process.env.ORACLE_CHAINLINK_RISK_ADDRESS ?? DEMO_CONTRACTS.chainlinkRisk,
      urwa: process.env.ORACLE_URWA_ADDRESS ?? DEMO_CONTRACTS.urwa,
      consumer: process.env.ORACLE_CONSUMER_ADDRESS ?? DEMO_CONTRACTS.consumer,
      complianceVault: process.env.ORACLE_COMPLIANCE_VAULT_ADDRESS ?? DEMO_CONTRACTS.complianceVault,
    },
  });
}
