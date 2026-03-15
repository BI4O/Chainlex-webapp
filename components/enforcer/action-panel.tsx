"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, ArrowRightLeft, FileText, Loader2, AlertTriangle } from "lucide-react";
import type { EnforcementAction } from "@/lib/enforcer-types";

type ActionPanelProps = {
  onAction?: (action: EnforcementAction, address: string) => void;
};

const ACTION_BUTTONS: { action: EnforcementAction; label: string; icon: React.ReactNode; color: string; hoverColor: string }[] = [
  {
    action: "FREEZE",
    label: "Freeze",
    icon: <Shield className="h-4 w-4" />,
    color: "bg-red-500",
    hoverColor: "hover:bg-red-600",
  },
  {
    action: "UNFREEZE",
    label: "Unfreeze",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
  },
  {
    action: "FORCE_TRANSFER",
    label: "Force Transfer",
    icon: <ArrowRightLeft className="h-4 w-4" />,
    color: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
  },
  {
    action: "GENERATE_SAR",
    label: "Generate SAR",
    icon: <FileText className="h-4 w-4" />,
    color: "bg-[var(--accent)]",
    hoverColor: "hover:bg-[var(--accent)]/80",
  },
];

export function ActionPanel({ onAction }: ActionPanelProps) {
  const [address, setAddress] = useState("");
  const [executing, setExecuting] = useState<EnforcementAction | null>(null);
  const [lastAction, setLastAction] = useState<{ action: EnforcementAction; address: string } | null>(null);

  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address);

  const handleAction = useCallback(
    async (action: EnforcementAction) => {
      if (!isValidAddress) return;

      setExecuting(action);
      // Simulate execution
      await new Promise((resolve) => setTimeout(resolve, 1200));

      onAction?.(action, address);
      setLastAction({ action, address });
      setExecuting(null);
    },
    [address, isValidAddress, onAction]
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Manual Action Panel
        </CardTitle>
        <CardDescription className="text-xs">
          Execute enforcement actions on specific addresses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address Input */}
        <div className="space-y-2">
          <label className="text-xs text-[#525252] uppercase tracking-wide">Target Address</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              className={`flex-1 h-10 rounded-lg border px-3 py-2 text-sm font-mono transition-all duration-200 focus:outline-none focus:ring-2 ${
                address && !isValidAddress
                  ? "border-red-300 bg-red-50/30 focus:ring-red-200"
                  : "border-[#E5E7EB] bg-white focus:ring-[var(--accent)]/20"
              }`}
            />
            {address && isValidAddress && (
              <Badge variant="secondary" className="h-10 px-3 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                Valid
              </Badge>
            )}
          </div>
          {address && !isValidAddress && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Invalid Ethereum address format
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {ACTION_BUTTONS.map(({ action, label, icon, color, hoverColor }) => (
            <Button
              key={action}
              className={`${color} ${hoverColor} text-white h-11 text-sm gap-2`}
              disabled={!isValidAddress || executing !== null}
              onClick={() => handleAction(action)}
            >
              {executing === action ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                icon
              )}
              {label}
            </Button>
          ))}
        </div>

        {/* Last Action Confirmation */}
        {lastAction && (
          <div className="rounded-lg border border-green-500/30 bg-green-50/50 p-3 text-sm">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                <strong>{lastAction.action}</strong> executed on{" "}
                <code className="font-mono text-xs bg-green-100 px-1.5 py-0.5 rounded">
                  {lastAction.address.slice(0, 6)}…{lastAction.address.slice(-4)}
                </code>
              </span>
            </div>
          </div>
        )}

        {/* Warning Notice */}
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-50/50 p-3 text-xs text-yellow-700">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Manual actions are logged and auditable. Ensure proper authorization before executing enforcement actions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
