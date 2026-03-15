'use client';

import { useState, useRef, useEffect } from 'react';
import { useLexstudioStore } from '@/lib/store';
import { UploadedFile } from '@/lib/types';

const JURISDICTIONS = [
  { code: 'HK', label: 'Hong Kong', flag: '🇭🇰' },
  { code: 'UAE', label: 'UAE', flag: '🇦🇪' },
  { code: 'US', label: 'United States', flag: '🇺🇸' },
  { code: 'SG', label: 'Singapore', flag: '🇸🇬' },
];

const ACCEPTED_TYPES = '.pdf,.docx,.xlsx,.txt';

export function OnboardingModal() {
  const { showOnboardingModal, setShowOnboardingModal, updateAssetData } = useLexstudioStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Reset internal state every time the modal is shown
  useEffect(() => {
    if (showOnboardingModal) {
      setStep(1);
      setSelectedJurisdictions([]);
      setUploadedFiles([]);
      // Trigger animation after a brief delay
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
    }
  }, [showOnboardingModal]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!showOnboardingModal) return null;

  const toggleJurisdiction = (code: string) => {
    setSelectedJurisdictions((prev) =>
      prev.includes(code) ? prev.filter((j) => j !== code) : [...prev, code]
    );
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
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
        setUploadedFiles((prev) => [...prev, newFile]);
      };
      reader.readAsText(file);
    });
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowOnboardingModal(false);
    }, 200); // Match transition duration
  };

  const handleFinish = () => {
    updateAssetData({
      jurisdictions: selectedJurisdictions,
      uploadedFiles,
      onboardingCompleted: true,
    });
    handleClose();
  };

  return (
    <div
      className={`fixed inset-0 bg-black/40 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        className={`bg-white rounded-2xl border border-[#E5E7EB] shadow-lg w-[480px] max-w-[90vw] pointer-events-auto relative transition-all duration-200 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-150"
          aria-label="Close"
        >
          ×
        </button>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-6 pb-2">
          <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-[var(--accent)]' : 'bg-[var(--accent)]'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-[var(--accent)]' : 'bg-[#E5E7EB]'}`} />
        </div>

        {step === 1 ? (
          /* ── Step 1: Jurisdictions ── */
          <div className="px-8 pb-8 pt-4">
            <h2 className="font-semibold text-xl text-gray-900 mb-1">
              Where will you issue this token?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Select all jurisdictions. This determines the regulatory framework applied throughout your whitepaper.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {JURISDICTIONS.map(({ code, label, flag }) => {
                const selected = selectedJurisdictions.includes(code);
                return (
                  <button
                    key={code}
                    onClick={() => toggleJurisdiction(code)}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150
                      ${selected
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                        : 'bg-white text-gray-900 border-[#E5E7EB] hover:border-[var(--accent)]'
                      }
                    `}
                  >
                    <span className="text-base">{flag}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-gray-400 mb-6">
              Jurisdiction cannot be changed from the UI later. Ask the AI to revise if needed.
            </p>

            <button
              onClick={() => setStep(2)}
              disabled={selectedJurisdictions.length === 0}
              className={`
                w-full py-3 rounded-xl text-sm font-semibold transition-all duration-150
                ${selectedJurisdictions.length > 0
                  ? 'bg-[var(--accent)] text-white hover:bg-[#2a3d82]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Continue →
            </button>
          </div>
        ) : (
          /* ── Step 2: File Upload ── */
          <div className="px-8 pb-8 pt-4">
            <h2 className="font-semibold text-xl text-gray-900 mb-1">
              Upload supporting materials
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Optional. Prospectus, financials, legal docs — the AI will reference these during the build.
            </p>

            {/* Drop zone */}
            <div
              className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 text-center mb-4 hover:border-[var(--accent)] transition-colors duration-150 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileSelect(e.dataTransfer.files);
              }}
            >
              <div className="text-3xl mb-2">📄</div>
              <p className="text-sm text-gray-600 font-medium">
                Drop files here or <span className="text-[var(--accent)]">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, DOCX, XLSX, TXT
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />

            {/* File list */}
            {uploadedFiles.length > 0 && (
              <ul className="space-y-2 mb-4">
                {uploadedFiles.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-[#E5E7EB]"
                  >
                    <span className="text-sm text-gray-700 truncate max-w-[340px]">{f.name}</span>
                    <button
                      onClick={() => removeFile(f.id)}
                      className="ml-2 text-gray-400 hover:text-red-500 text-lg leading-none transition-colors"
                      aria-label="Remove file"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors duration-150"
              >
                Skip
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-[var(--accent)] hover:bg-[#2a3d82] transition-colors duration-150"
              >
                Start Building →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
