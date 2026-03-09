import { NextResponse } from "next/server";
import { DEMO_EVENTS, type GateCheck } from "@/lib/oracle-types";

function deriveAction(score: number, level: string): "PASS" | "REVIEW" | "FREEZE" {
  if (level === "BLOCKED" || score >= 800) return "FREEZE";
  if (level === "HIGH" || score >= 600) return "FREEZE";
  if (level === "MEDIUM" || score >= 400) return "REVIEW";
  return "PASS";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  // Check if we have an attestation for this address in demo data
  const existingAttestation = DEMO_EVENTS.find(
    (e) => e.walletAddress.toLowerCase() === address.toLowerCase()
  );

  if (existingAttestation) {
    const check: GateCheck = {
      address,
      allowed: existingAttestation.action === "PASS",
      reason: existingAttestation.reason,
      score: existingAttestation.score,
      dataAge: `${Math.floor((Date.now() - new Date(existingAttestation.createdAt).getTime()) / 60_000)}min`,
      stalenessLimit: "1hr",
    };
    return NextResponse.json(check);
  }

  // Generate a mock check for unknown addresses
  const mockScore = Math.floor(Math.random() * 500);
  const action = deriveAction(mockScore, mockScore < 400 ? "LOW" : mockScore < 600 ? "MEDIUM" : "HIGH");

  const check: GateCheck = {
    address,
    allowed: action === "PASS",
    reason: action === "PASS"
      ? "Address passed security checks"
      : action === "REVIEW"
      ? "Medium risk - requires manual review"
      : "High risk - access denied",
    score: mockScore,
    dataAge: "0min",
    stalenessLimit: "1hr",
  };

  return NextResponse.json(check);
}
