'use client';

import { useState } from 'react';
import { AssetData } from '@/lib/types';

interface MetadataCardProps {
  assetData: AssetData;
}

export function MetadataCard({ assetData }: MetadataCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150 rounded-xl"
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="w-8 h-8 rounded-lg bg-[#324998]/10 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-[#324998]"
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
            <h3 className="font-body font-semibold text-base text-gray-900">
              {assetData.name || 'New Asset'}
            </h3>
            <p className="font-body text-sm text-gray-500">
              {assetData.type || 'Asset Type'}
            </p>
          </div>
        </div>

        {/* Expand/Collapse Arrow */}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
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
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-4 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {/* Asset Name */}
            <div>
              <label className="font-body text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset Name
              </label>
              <p className="font-body text-sm text-gray-900 mt-1">
                {assetData.name || 'N/A'}
              </p>
            </div>

            {/* Asset Type */}
            <div>
              <label className="font-body text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </label>
              <p className="font-body text-sm text-gray-900 mt-1">
                {assetData.type || 'N/A'}
              </p>
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="font-body text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </label>
              <p className="font-body text-sm text-gray-900 mt-1">
                {assetData.description || 'No description provided'}
              </p>
            </div>

            {/* Additional metadata can be added here */}
          </div>
        </div>
      </div>
    </div>
  );
}
