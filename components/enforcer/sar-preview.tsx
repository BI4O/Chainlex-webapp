"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Send, Eye, EyeOff } from "lucide-react";
import type { SARReport } from "@/lib/enforcer-types";

type SARPreviewProps = {
  report: SARReport;
};

export function SARPreview({ report }: SARPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);

  const statusColor = {
    draft: "text-yellow-600 bg-yellow-50",
    ready: "text-green-600 bg-green-50",
    submitted: "text-[#324998] bg-[#324998]/10",
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            SAR Report Preview
          </CardTitle>
          <Badge className={statusColor[report.status]}>
            {report.status.toUpperCase()}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Suspicious Activity Report
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Report Meta */}
        <div className="space-y-2 mb-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[#525252] text-xs">Subject Address</p>
              <code className="font-mono text-xs bg-[#F5F5F5] px-1.5 py-0.5 rounded">
                {report.subjectAddress.slice(0, 10)}…{report.subjectAddress.slice(-6)}
              </code>
            </div>
            <div>
              <p className="text-[#525252] text-xs">Risk Score</p>
              <span className="font-mono font-bold">{report.riskScore}</span>
              <span className="text-[#525252] text-xs ml-1">({report.riskLevel})</span>
            </div>
          </div>
          <div className="text-xs text-[#525252]">
            Generated: {new Date(report.generatedAt).toLocaleString()}
          </div>
        </div>

        {/* Preview Toggle */}
        <Button
          variant="outline"
          size="sm"
          className="mb-3"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide Preview
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Show Preview
            </>
          )}
        </Button>

        {/* Report Content Preview */}
        {showPreview && (
          <div className="flex-1 rounded-lg border border-[#E5E7EB] bg-[#F5F5F5]/30 overflow-hidden">
            <div className="h-[200px] overflow-y-auto p-4">
              <pre className="text-xs font-mono whitespace-pre-wrap text-[#525252] leading-relaxed">
                {report.content}
              </pre>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-[#E5E7EB]">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-[#324998] hover:bg-[#324998]/80"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit to Regulator
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
