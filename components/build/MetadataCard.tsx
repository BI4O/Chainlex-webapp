'use client';

import { useRef, useState } from 'react';
import { AssetData, UploadedFile } from '@/lib/types';

const JURISDICTION_LABELS: Record<string, string> = {
  HK: '🇭🇰 HK',
  UAE: '🇦🇪 UAE',
  US: '🇺🇸 US',
  SG: '🇸🇬 SG',
};

// Asset type color mapping
const ASSET_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Real Estate': { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/30' },
  'Bond': { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/30' },
  'Equity': { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' },
  'Art': { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/30' },
  'default': { bg: 'bg-[var(--accent)]/10', text: 'text-[var(--accent)]', border: 'border-[var(--accent)]/30' },
};

function getAssetTypeStyle(type: string | undefined) {
  if (!type) return ASSET_TYPE_COLORS.default;
  const key = Object.keys(ASSET_TYPE_COLORS).find(k => type.toLowerCase().includes(k.toLowerCase()));
  return key ? ASSET_TYPE_COLORS[key] : ASSET_TYPE_COLORS.default;
}

const ACCEPTED_TYPES = '.pdf,.docx,.xlsx,.txt';

interface MetadataCardProps {
  assetData: AssetData;
  onUpdateAssetData?: (data: Partial<AssetData>) => void;
}

export function MetadataCard({ assetData, onUpdateAssetData }: MetadataCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const assetStyle = getAssetTypeStyle(assetData.type);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !onUpdateAssetData) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = e.target?.result as string;
        const newFile: UploadedFile = {
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          content: raw ? raw.slice(0, 2000) : '',
          uploadedAt: Date.now(),
        };
        onUpdateAssetData({
          uploadedFiles: [...(assetData.uploadedFiles ?? []), newFile],
        });
      };
      reader.readAsText(file);
    });
  };

  const removeFile = (id: string) => {
    if (!onUpdateAssetData) return;
    onUpdateAssetData({
      uploadedFiles: (assetData.uploadedFiles ?? []).filter((f) => f.id !== id),
    });
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150 rounded-xl"
      >
        <div className="flex items-center gap-2.5">
          {/* Icon */}
          <div className={`w-7 h-7 rounded-lg ${assetStyle.bg} flex items-center justify-center flex-shrink-0 border ${assetStyle.border}`}>
            <svg
              className={`w-3.5 h-3.5 ${assetStyle.text}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          {/* Name and Type */}
          <div className="text-left">
            <h3 className="font-body font-semibold text-sm text-gray-900 leading-tight">
              {assetData.name || 'New Asset'}
            </h3>
            <p className="font-body text-xs text-gray-500 leading-tight">
              {assetData.type || 'Asset Type'}
            </p>
          </div>
        </div>

        {/* Expand/Collapse Arrow */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 flex-shrink-0 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-4 pt-2 border-t border-gray-100 space-y-4">
          {/* Basic metadata */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <label className="font-body text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset Name
              </label>
              <p className="font-body text-sm text-gray-900 mt-1">
                {assetData.name || 'N/A'}
              </p>
            </div>

            <div>
              <label className="font-body text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </label>
              <p className="font-body text-sm text-gray-900 mt-1">
                {assetData.type || 'N/A'}
              </p>
            </div>

            <div className="col-span-2">
              <label className="font-body text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </label>
              <p className="font-body text-sm text-gray-900 mt-1">
                {assetData.description || 'No description provided'}
              </p>
            </div>
          </div>

          {/* Jurisdictions */}
          {assetData.jurisdictions && assetData.jurisdictions.length > 0 && (
            <div>
              <label className="font-body text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">
                📍 Jurisdictions
              </label>
              <div className="flex flex-wrap gap-2">
                {assetData.jurisdictions.map((j) => {
                  const jurColors: Record<string, string> = {
                    HK: 'bg-red-500/10 text-red-600 border-red-500/30',
                    UAE: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
                    US: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
                    SG: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
                  };
                  return (
                    <span
                      key={j}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${jurColors[j] || 'bg-gray-100 text-gray-600 border-gray-300'}`}
                    >
                      {JURISDICTION_LABELS[j] ?? j}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Materials */}
          {assetData.onboardingCompleted && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-body text-xs font-medium text-gray-500 uppercase tracking-wider">
                  📎 Materials
                </label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-[var(--accent)] hover:underline font-medium"
                >
                  + Upload
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />

              {assetData.uploadedFiles && assetData.uploadedFiles.length > 0 ? (
                <ul className="space-y-1.5">
                  {assetData.uploadedFiles.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg border border-[#E5E7EB]"
                    >
                      <span className="text-xs text-gray-700 truncate max-w-[200px]">{f.name}</span>
                      <button
                        onClick={() => removeFile(f.id)}
                        className="ml-2 text-gray-400 hover:text-red-500 text-base leading-none transition-colors"
                        aria-label="Remove file"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">No files uploaded</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
