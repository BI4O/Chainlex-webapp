"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Wifi, WifiOff } from "lucide-react";
import { DEMO_CONTRACTS_ENFORCER } from "@/lib/enforcer-types";

const ETHERSCAN_ADDR = "https://sepolia.etherscan.io/address/";

function truncateAddress(addr: string) {
  if (addr.length <= 13) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

type ListenerStatusProps = {
  isConnected: boolean;
  lastEventAt: string | null;
  eventsProcessed: number;
};

export function ListenerStatus({ isConnected, lastEventAt, eventsProcessed }: ListenerStatusProps) {
  const timeAgo = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Radio className="h-4 w-4" />
            Event Listener Status
          </CardTitle>
          <Badge variant={isConnected ? "secondary" : "destructive"} className="gap-1">
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                Connected
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Disconnected
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Connection Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#525252] text-xs uppercase tracking-wide mb-1">Network</p>
            <p className="font-medium">Sepolia Testnet</p>
          </div>
          <div>
            <p className="text-[#525252] text-xs uppercase tracking-wide mb-1">Events Processed</p>
            <p className="font-medium font-mono">{eventsProcessed}</p>
          </div>
        </div>

        {/* Contract Links */}
        <div className="space-y-2">
          <p className="text-[#525252] text-xs uppercase tracking-wide">Listening To</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#525252]">ChainlinkRisk</span>
              <a
                href={`${ETHERSCAN_ADDR}${DEMO_CONTRACTS_ENFORCER.chainlinkRisk}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-blue-500 hover:underline"
              >
                {truncateAddress(DEMO_CONTRACTS_ENFORCER.chainlinkRisk)}
              </a>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#525252]">uRWA Token</span>
              <a
                href={`${ETHERSCAN_ADDR}${DEMO_CONTRACTS_ENFORCER.uRWA}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-blue-500 hover:underline"
              >
                {truncateAddress(DEMO_CONTRACTS_ENFORCER.uRWA)}
              </a>
            </div>
          </div>
        </div>

        {/* Event Type */}
        <div className="pt-2 border-t border-[#E5E7EB]">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-[#525252]">RiskAssessmentUpdated</span>
            </div>
            <span className="text-xs text-[#525252]">
              {lastEventAt ? timeAgo(lastEventAt) : "No events"}
            </span>
          </div>
        </div>

        {/* Auto-enforcement Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
          <span className="text-sm text-[#525252]">Auto-enforcement</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-600 font-medium">ENABLED</span>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
