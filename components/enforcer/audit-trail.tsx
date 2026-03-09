"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, User, Bot, ExternalLink } from "lucide-react";
import type { AuditLogEntry, EnforcementAction } from "@/lib/enforcer-types";

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

function actionColor(action: EnforcementAction): string {
  switch (action) {
    case "FREEZE":
      return "text-red-500 bg-red-50";
    case "UNFREEZE":
      return "text-green-500 bg-green-50";
    case "FORCE_TRANSFER":
      return "text-purple-500 bg-purple-50";
    case "GENERATE_SAR":
      return "text-[#324998] bg-[#324998]/10";
    default:
      return "text-gray-500 bg-gray-50";
  }
}

type AuditTrailProps = {
  entries: AuditLogEntry[];
};

export function AuditTrail({ entries }: AuditTrailProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Audit Trail
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs">
            {entries.length} entries
          </Badge>
        </div>
        <p className="text-xs text-[#525252] mt-1">
          Immutable log of all enforcement actions
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {entries.length === 0 && (
            <div className="text-center py-8 text-[#525252] text-sm">
              No audit entries yet
            </div>
          )}
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#F5F5F5]/50 transition-colors"
            >
              {/* Operator Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  entry.operator === "SYSTEM" ? "bg-[#324998]/10" : "bg-green-100"
                }`}
              >
                {entry.operator === "SYSTEM" ? (
                  <Bot className="h-3.5 w-3.5 text-[#324998]" />
                ) : (
                  <User className="h-3.5 w-3.5 text-green-600" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${actionColor(entry.action)}`}>
                    {entry.action}
                  </span>
                  <span className="font-mono text-xs text-[#525252]">
                    {entry.targetAddress.slice(0, 6)}…{entry.targetAddress.slice(-4)}
                  </span>
                  {entry.txHash && (
                    <a
                      href={`${ETHERSCAN_TX}${entry.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                {entry.details && (
                  <p className="text-xs text-[#525252] mt-1 line-clamp-1">{entry.details}</p>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-[#525252] flex-shrink-0">
                {timeAgo(entry.timestamp)}
              </span>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
          <button className="text-xs text-[#324998] hover:underline font-medium">
            View Full Audit Log →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
