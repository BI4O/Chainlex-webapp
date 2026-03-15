"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, FileText, Play, SkipForward, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { EnforcementRecord } from "@/lib/enforcer-types";

const ETHERSCAN_TX = "https://sepolia.etherscan.io/tx/";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function actionIcon(action: string) {
  switch (action) {
    case "FREEZE":
      return <Shield className="h-4 w-4 text-red-500" />;
    case "UNFREEZE":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "GENERATE_SAR":
      return <FileText className="h-4 w-4 text-[var(--accent)]" />;
    default:
      return <Shield className="h-4 w-4" />;
  }
}

function levelColor(level: string) {
  switch (level) {
    case "HIGH":
      return "border-l-red-500";
    case "BLOCKED":
      return "border-l-purple-500";
    case "MEDIUM":
      return "border-l-yellow-500";
    default:
      return "border-l-green-500";
  }
}

type ActionQueueProps = {
  pendingActions: EnforcementRecord[];
  onExecute?: (id: string) => void;
  onSkip?: (id: string) => void;
};

export function ActionQueue({ pendingActions, onExecute, onSkip }: ActionQueueProps) {
  const [executingId, setExecutingId] = useState<string | null>(null);

  const handleExecute = async (id: string) => {
    setExecutingId(id);
    // Simulate execution delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onExecute?.(id);
    setExecutingId(null);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-500" />
            Pending Actions
          </CardTitle>
          <Badge variant="outline" className="font-mono">
            {pendingActions.length}
          </Badge>
        </div>
        <p className="text-xs text-[#525252] mt-1">
          Awaiting approval for enforcement
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {pendingActions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-[#525252]">
              <CheckCircle2 className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No pending actions</p>
              <p className="text-xs mt-1">All enforcement actions completed</p>
            </div>
          )}
          {pendingActions.map((action) => (
            <div
              key={action.id}
              className={`rounded-lg border border-l-[3px] p-3 space-y-2 ${levelColor(action.riskLevel)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {actionIcon(action.action)}
                  <span className="font-mono text-sm">
                    {action.targetAddress.slice(0, 6)}…{action.targetAddress.slice(-4)}
                  </span>
                </div>
                <Badge
                  variant={
                    action.riskLevel === "HIGH" || action.riskLevel === "BLOCKED"
                      ? "destructive"
                      : action.riskLevel === "MEDIUM"
                      ? "outline"
                      : "secondary"
                  }
                >
                  {action.riskLevel}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span>
                  Score: <strong className="font-mono">{action.riskScore}</strong>
                </span>
                <span className="text-[#525252]">
                  {action.triggerSource === "oracle_event" ? "⚡ Auto" : "👤 Manual"}
                </span>
              </div>

              <p className="text-xs text-[#525252] line-clamp-2">{action.reason}</p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#525252]">{timeAgo(action.createdAt)}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => onSkip?.(action.id)}
                    disabled={executingId === action.id}
                  >
                    <SkipForward className="h-3 w-3 mr-1" />
                    Skip
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-[var(--accent)] hover:bg-[var(--accent)]/80"
                    onClick={() => handleExecute(action.id)}
                    disabled={executingId === action.id}
                  >
                    {executingId === action.id ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Play className="h-3 w-3 mr-1" />
                    )}
                    Execute
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

type ExecutedActionsProps = {
  actions: EnforcementRecord[];
};

export function ExecutedActions({ actions }: ExecutedActionsProps) {
  const todayActions = actions.filter((a) => {
    const actionDate = new Date(a.executedAt || a.createdAt);
    const today = new Date();
    return (
      actionDate.getDate() === today.getDate() &&
      actionDate.getMonth() === today.getMonth() &&
      actionDate.getFullYear() === today.getFullYear()
    );
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Executed Today
          </CardTitle>
          <Badge variant="secondary" className="font-mono">
            {todayActions.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {todayActions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-[#525252]">
              <CheckCircle2 className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No actions today</p>
            </div>
          )}
          {todayActions.map((action) => (
            <div
              key={action.id}
              className={`rounded-lg border p-3 space-y-1.5 ${
                action.status === "succeeded"
                  ? "border-green-500/30 bg-green-50/30"
                  : "border-red-500/30 bg-red-50/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {action.status === "succeeded" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-mono text-sm">
                    {action.targetAddress.slice(0, 6)}…{action.targetAddress.slice(-4)}
                  </span>
                </div>
                <Badge
                  variant={action.status === "succeeded" ? "secondary" : "destructive"}
                  className="text-[10px]"
                >
                  {action.action}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="text-[#525252]">
                  Score: <strong className="font-mono">{action.riskScore}</strong>
                </span>
                {action.txHash && (
                  <a
                    href={`${ETHERSCAN_TX}${action.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    TX: {action.txHash.slice(0, 8)}…{action.txHash.slice(-4)} ✓
                  </a>
                )}
              </div>

              <div className="text-xs text-[#525252]">
                {action.executedAt ? timeAgo(action.executedAt) : timeAgo(action.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
