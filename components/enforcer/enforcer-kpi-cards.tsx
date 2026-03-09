"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2, AlertTriangle, Shield, FileText } from "lucide-react";
import type { ReactNode } from "react";

type KPI = { value: number; label: string; icon: ReactNode; color: string };

type EnforcerKPICardsProps = {
  pendingActions: number;
  executedToday: number;
  totalFreezes: number;
  sarGenerated: number;
  autoEnforced: number;
};

export function EnforcerKPICards({
  pendingActions,
  executedToday,
  totalFreezes,
  sarGenerated,
  autoEnforced,
}: EnforcerKPICardsProps) {
  const cards: KPI[] = [
    {
      value: pendingActions,
      label: "Pending Actions",
      icon: <Clock className="h-5 w-5 text-orange-500" />,
      color: "bg-orange-500/10",
    },
    {
      value: executedToday,
      label: "Executed Today",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      color: "bg-green-500/10",
    },
    {
      value: totalFreezes,
      label: "Total Freezes",
      icon: <Shield className="h-5 w-5 text-red-500" />,
      color: "bg-red-500/10",
    },
    {
      value: sarGenerated,
      label: "SAR Generated",
      icon: <FileText className="h-5 w-5 text-[#324998]" />,
      color: "bg-[#324998]/10",
    },
    {
      value: autoEnforced,
      label: "Auto-Enforced",
      icon: <AlertTriangle className="h-5 w-5 text-purple-500" />,
      color: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${c.color}`}>{c.icon}</div>
              <div>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-sm text-[#525252]">{c.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
