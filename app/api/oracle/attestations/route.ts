import { NextResponse } from "next/server";
import { DEMO_EVENTS } from "@/lib/oracle-types";

// In-memory store for demo purposes
// In production, this would be a database
let attestationsStore = [...DEMO_EVENTS];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 20;

  const items = attestationsStore.slice(0, limit);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newAttestation = {
      id: `att-${Date.now()}`,
      createdAt: new Date().toISOString(),
      txHash: "",
      action: "PASS" as const,
      ...body,
    };

    attestationsStore = [newAttestation, ...attestationsStore].slice(0, 100);
    return NextResponse.json(newAttestation);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
