"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import type { OracleAttestation } from "@/lib/oracle-types";
import { DEMO_EVENTS, DEMO_VAULT_CHECKS, DEMO_CONTRACTS } from "@/lib/oracle-types";
import { WorkflowStatusBar } from "./workflow-status-bar";
import { KPICards } from "./kpi-cards";
import { CREPipeline } from "./cre-pipeline";
import { OracleEventFeed } from "./oracle-event-feed";
import { ComplianceVaultGate } from "./compliance-vault-gate";
import { RiskScoreTrend, RiskDistribution } from "./risk-charts";

const CONTRACTS = [
  { label: "ChainlinkRisk", envKey: "chainlinkRisk" },
  { label: "uRWA", envKey: "urwa" },
  { label: "Consumer", envKey: "consumer" },
] as const;

type OracleStatusResponse = {
  contracts: {
    chainlinkRisk: string;
    urwa: string;
    consumer: string;
    complianceVault: string;
  };
};

export function OracleDashboard() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<OracleAttestation[]>([]);
  const [contractAddresses, setContractAddresses] = useState(DEMO_CONTRACTS);

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, attestationsRes] = await Promise.all([
        fetch("/api/oracle/status").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch("/api/oracle/attestations?limit=50").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);

      if (statusRes?.contracts) {
        setContractAddresses(statusRes.contracts);
      }

      const items: OracleAttestation[] = attestationsRes?.items ?? [];
      const normalized = items.map((item) => ({
        ...item,
        txHash: item.txHash ?? "",
        action: item.action ?? deriveAction(item.score, item.level),
      }));

      setEvents(normalized.length > 0 ? normalized : DEMO_EVENTS);
    } catch {
      setEvents(DEMO_EVENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#525252]" />
      </div>
    );
  }

  const latest = events[0] ?? null;
  const succeededCount = events.filter((e) => e.status === "succeeded").length;
  const highRiskCount = events.filter((e) => e.level === "HIGH" || e.level === "BLOCKED").length;
  const freezeCount = events.filter((e) => e.action === "FREEZE").length;
  const vaultRejectedCount = DEMO_VAULT_CHECKS.filter((c) => !c.allowed).length;

  const contracts = CONTRACTS.map((c) => ({
    label: c.label,
    address: contractAddresses[c.envKey] || "0x0000000000000000000000000000000000000000",
  }));

  return (
    <section className="space-y-6 p-6">
      {/* Section 1: Workflow Status Bar */}
      <WorkflowStatusBar
        lastRunAt={latest?.createdAt ?? null}
        contracts={contracts}
      />

      {/* Section 2: KPI Cards */}
      <KPICards
        oracleChecks={events.length}
        onChainWrites={succeededCount}
        highRisk={highRiskCount}
        freezeActions={freezeCount}
        vaultRejected={vaultRejectedCount}
      />

      {/* Section 3: CRE Pipeline */}
      <CREPipeline latest={latest} />

      {/* Data flow diagram */}
      <div className="rounded-lg border border-[#E5E7EB] bg-[#F5F5F5]/30 px-4 py-3 text-xs">
        <p className="text-[#525252] mb-2">数据流：</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-medium">Oracle Event Feed</span>
          <span className="text-[#525252]">(CRE 写入)</span>
          <span className="text-[#525252]">→</span>
          <span className="font-medium">ChainlinkRisk 链上</span>
          <span className="text-[#525252]">←</span>
          <span className="text-[#525252]">(ComplianceVault 读取)</span>
          <span className="font-medium">ComplianceVault Gate</span>
        </div>
      </div>

      {/* Section 4 + 5: Event Feed + Vault Gate */}
      <div className="grid gap-6 lg:grid-cols-[0.6fr_0.4fr]">
        <OracleEventFeed events={events} />
        <ComplianceVaultGate
          vault={{
            address: contractAddresses.complianceVault || "0x0000000000000000000000000000000000000000",
            tokenLabel: "uRWA (ccTMMF)",
            complianceFeedLabel: "ChainlinkRisk",
            complianceFeedAddress: contractAddresses.chainlinkRisk || "0x0000000000000000000000000000000000000000",
          }}
          checks={DEMO_VAULT_CHECKS}
          events={events.map((e) => ({ walletAddress: e.walletAddress, createdAt: e.createdAt }))}
        />
      </div>

      {/* Section 6: Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <RiskScoreTrend attestations={events} />
        <RiskDistribution attestations={events} />
      </div>
    </section>
  );
}

function deriveAction(score: number, level: string): "PASS" | "REVIEW" | "FREEZE" {
  if (level === "BLOCKED" || score >= 800) return "FREEZE";
  if (level === "HIGH" || score >= 600) return "FREEZE";
  if (level === "MEDIUM" || score >= 400) return "REVIEW";
  return "PASS";
}
