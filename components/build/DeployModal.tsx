'use client';

import { useState, useEffect } from 'react';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EVM_CHAINS = [
  { id: 1, name: 'Ethereum Mainnet', symbol: 'ETH' },
  { id: 56, name: 'BNB Smart Chain', symbol: 'BNB' },
  { id: 137, name: 'Polygon', symbol: 'MATIC' },
  { id: 42161, name: 'Arbitrum One', symbol: 'ETH' },
  { id: 10, name: 'Optimism', symbol: 'ETH' },
  { id: 8453, name: 'Base', symbol: 'ETH' },
  { id: 43114, name: 'Avalanche C-Chain', symbol: 'AVAX' },
  { id: 250, name: 'Fantom', symbol: 'FTM' },
  { id: 59144, name: 'Linea', symbol: 'ETH' },
  { id: 534352, name: 'Scroll', symbol: 'ETH' },
];

type DeployState = 'select' | 'deploying' | 'success';

export function DeployModal({ isOpen, onClose }: DeployModalProps) {
  const [selectedChain, setSelectedChain] = useState(EVM_CHAINS[0]);
  const [deployState, setDeployState] = useState<DeployState>('select');
  const [progress, setProgress] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setDeployState('select');
      setProgress(0);
      setSelectedChain(EVM_CHAINS[0]);
    }
  }, [isOpen]);

  // Fake progress animation
  useEffect(() => {
    if (deployState === 'deploying') {
      const duration = 3000; // 3 seconds
      const interval = 50; // Update every 50ms
      const steps = duration / interval;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const newProgress = Math.min((currentStep / steps) * 100, 100);
        setProgress(newProgress);

        if (currentStep >= steps) {
          clearInterval(timer);
          setTimeout(() => {
            setDeployState('success');
          }, 200);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [deployState]);

  // Auto close on success
  useEffect(() => {
    if (deployState === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [deployState, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={deployState === 'select' ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB]">
          <h2 className="font-body text-lg font-semibold text-black">
            {deployState === 'success' ? '🎉 Deployment Successful!' : 'Deploy Contract'}
          </h2>
          {deployState === 'select' && (
            <p className="mt-1 font-body text-sm text-gray-500">
              Select a network to deploy your smart contract
            </p>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {deployState === 'select' && (
            <>
              {/* Chain Selector */}
              <label className="block font-body text-sm font-medium text-gray-700 mb-2">
                Target Network
              </label>
              <div className="relative">
                <select
                  value={selectedChain.id}
                  onChange={(e) => {
                    const chain = EVM_CHAINS.find((c) => c.id === Number(e.target.value));
                    if (chain) setSelectedChain(chain);
                  }}
                  className="w-full h-12 px-4 pr-10 font-body text-sm bg-white border border-[#E5E7EB] rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all"
                >
                  {EVM_CHAINS.map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-4 p-4 bg-[var(--background-canvas)] rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="font-body text-sm text-gray-600">
                    <p className="font-medium text-gray-700">Demo Mode</p>
                    <p className="mt-1">This is a demonstration. No actual contract will be deployed to the blockchain.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {deployState === 'deploying' && (
            <div className="py-4">
              {/* Chain Info */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div>
                  <p className="font-body text-sm font-medium text-gray-900">{selectedChain.name}</p>
                  <p className="font-body text-xs text-gray-500">Deploying HXCASH Token...</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between font-body text-xs">
                  <span className="text-gray-500">Deploying...</span>
                  <span className="text-[var(--accent)] font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] rounded-full transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="font-body text-xs text-gray-400 mt-2">
                  {progress < 30 && 'Compiling contract...'}
                  {progress >= 30 && progress < 60 && 'Estimating gas...'}
                  {progress >= 60 && progress < 90 && 'Submitting transaction...'}
                  {progress >= 90 && 'Confirming deployment...'}
                </p>
              </div>
            </div>
          )}

          {deployState === 'success' && (
            <div className="py-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-body text-sm text-gray-600 mb-4">
                Your contract has been successfully deployed to <span className="font-medium text-gray-900">{selectedChain.name}</span>
              </p>
              <div className="p-3 bg-gray-50 rounded-lg font-mono text-xs text-gray-500 break-all">
                0x742d35Cc6634C0532925a3b844Bc9e7595f8bDe7
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {deployState === 'select' && (
          <div className="px-6 py-4 bg-gray-50 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-10 px-4 font-body text-sm font-medium text-gray-700 bg-white border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => setDeployState('deploying')}
              className="flex-1 h-10 px-4 font-body text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:bg-[#2a3d7f] transition-all"
            >
              Deploy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
