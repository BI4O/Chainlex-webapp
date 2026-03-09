"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { EnforcerKPICards } from "./enforcer-kpi-cards";
import { ListenerStatus } from "./listener-status";
import { ActionQueue, ExecutedActions } from "./action-queue";
import { ActionPanel } from "./action-panel";
import { AuditTrail } from "./audit-trail";
import { SARPreview } from "./sar-preview";
import {
  DEMO_PENDING_ACTIONS,
  DEMO_EXECUTED_ACTIONS,
  DEMO_AUDIT_LOG,
  DEMO_SAR_REPORT,
  type EnforcementRecord,
  type AuditLogEntry,
} from "@/lib/enforcer-types";

export function EnforcerDashboard() {
  const [loading, setLoading] = useState(true);
  const [pendingActions, setPendingActions] = useState<EnforcementRecord[]>([]);
  const [executedActions, setExecutedActions] = useState<EnforcementRecord[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [listenerConnected, setListenerConnected] = useState(true);

  useEffect(() => {
    // Simulate initial data load
    const timer = setTimeout(() => {
      setPendingActions(DEMO_PENDING_ACTIONS);
      setExecutedActions(DEMO_EXECUTED_ACTIONS);
      setAuditLog(DEMO_AUDIT_LOG);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Simulate connection status changes
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly toggle connection for demo
      if (Math.random() > 0.95) {
        setListenerConnected(false);
        setTimeout(() => setListenerConnected(true), 3000);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleExecuteAction = useCallback((id: string) => {
    setPendingActions((prev) => {
      const action = prev.find((a) => a.id === id);
      if (action) {
        // Add to executed actions with a new unique ID
        setExecutedActions((executed) => [
          {
            ...action,
            id: `exec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            status: "succeeded",
            txHash: `0x${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`,
            executedAt: new Date().toISOString(),
          },
          ...executed,
        ]);

        // Add audit log entry
        setAuditLog((log) => [
          {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: action.action,
            targetAddress: action.targetAddress,
            operator: "USER",
            txHash: `0x${Math.random().toString(16).slice(2)}`,
            details: `Manual execution via dashboard`,
          },
          ...log,
        ]);
      }
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const handleSkipAction = useCallback((id: string) => {
    setPendingActions((prev) => {
      const action = prev.find((a) => a.id === id);
      if (action) {
        // Add audit log entry
        setAuditLog((log) => [
          {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: action.action,
            targetAddress: action.targetAddress,
            operator: "USER",
            details: `Skipped by operator`,
          },
          ...log,
        ]);
      }
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const handleManualAction = useCallback((action: string, address: string) => {
    // Add to audit log
    setAuditLog((log) => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: action as any,
        targetAddress: address,
        operator: "USER",
        txHash: `0x${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`,
        details: `Manual action via dashboard`,
      },
      ...log,
    ]);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#525252]" />
      </div>
    );
  }

  const stats = {
    pending: pendingActions.length,
    executedToday: executedActions.filter((a) => {
      const d = new Date(a.executedAt || a.createdAt);
      const today = new Date();
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    }).length,
    totalFreezes: executedActions.filter((a) => a.action === "FREEZE" && a.status === "succeeded").length,
    sarGenerated: executedActions.filter((a) => a.action === "GENERATE_SAR" && a.status === "succeeded").length,
    autoEnforced: executedActions.filter((a) => a.triggerSource === "oracle_event" && a.status === "succeeded").length,
  };

  const lastEventAt = executedActions[0]?.executedAt || executedActions[0]?.createdAt || null;

  return (
    <section className="space-y-6 p-6 animate-fade-in">
      {/* KPI Cards */}
      <EnforcerKPICards
        pendingActions={stats.pending}
        executedToday={stats.executedToday}
        totalFreezes={stats.totalFreezes}
        sarGenerated={stats.sarGenerated}
        autoEnforced={stats.autoEnforced}
      />

      {/* Top Section: Listener Status + Action Panel */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <ListenerStatus
          isConnected={listenerConnected}
          lastEventAt={lastEventAt}
          eventsProcessed={executedActions.length}
        />
        <ActionPanel onAction={handleManualAction} />
      </div>

      {/* Middle Section: Pending + Executed Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <ActionQueue
          pendingActions={pendingActions}
          onExecute={handleExecuteAction}
          onSkip={handleSkipAction}
        />
        <ExecutedActions actions={executedActions} />
      </div>

      {/* Bottom Section: Audit Trail + SAR Preview */}
      <div className="grid gap-6 lg:grid-cols-[0.6fr_0.4fr]">
        <AuditTrail entries={auditLog} />
        <SARPreview report={DEMO_SAR_REPORT} />
      </div>
    </section>
  );
}
