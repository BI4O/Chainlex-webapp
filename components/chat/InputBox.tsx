'use client';

import { useState, useRef } from 'react';
import { useLexstudioStore } from '@/lib/store';

export function InputBox() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const streamingContentRef = useRef('');

  const mode = useLexstudioStore((state) => state.mode);
  const setMode = useLexstudioStore((state) => state.setMode);
  const messages = useLexstudioStore((state) => state.messages);
  const addMessage = useLexstudioStore((state) => state.addMessage);

  // Build Mode state
  const currentStep = useLexstudioStore((state) => state.currentStep);
  const completedSteps = useLexstudioStore((state) => state.completedSteps);
  const phase = useLexstudioStore((state) => state.phase);
  const assetData = useLexstudioStore((state) => state.assetData);
  const setCurrentStep = useLexstudioStore((state) => state.setCurrentStep);
  const addCompletedStep = useLexstudioStore((state) => state.addCompletedStep);
  const updateAssetData = useLexstudioStore((state) => state.updateAssetData);
  const updateWhitepaper = useLexstudioStore((state) => state.updateWhitepaper);
  const updateContract = useLexstudioStore((state) => state.updateContract);
  const updateArchMap = useLexstudioStore((state) => state.updateArchMap);

  // Sidebar state for centering calculation
  const sidebarCollapsed = useLexstudioStore((state) => state.sidebarCollapsed);

  // AI generation state (global)
  const isGenerating = useLexstudioStore((state) => state.isGenerating);
  const setIsGenerating = useLexstudioStore((state) => state.setIsGenerating);

  // Onboarding modal control
  const setShowOnboardingModal = useLexstudioStore((state) => state.setShowOnboardingModal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || isGenerating) return;

    const userInput = input.trim();

    // In Build Mode, check if onboarding is completed before sending
    if (mode === 'build' && !assetData?.onboardingCompleted) {
      setShowOnboardingModal(true);
      return;
    }

    setInput('');
    setLoading(true);
    setIsGenerating(true);
    streamingContentRef.current = '';

    addMessage({ role: 'user', content: userInput });
    addMessage({ role: 'assistant', content: '...' });

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const CONNECTION_TIMEOUT = 30000; // 30s to establish connection
    const READ_TIMEOUT = 90000; // 90s max total wait time

    const connectionTimeoutId = setTimeout(() => {
      controller.abort(new Error('Connection timeout - server not responding'));
    }, CONNECTION_TIMEOUT);

    // Overall timeout
    const overallTimeoutId = setTimeout(() => {
      controller.abort(new Error('Request timeout - took too long'));
    }, READ_TIMEOUT);

    try {
      setLoading(false);

      const apiEndpoint = mode === 'build'
        ? 'http://localhost:8000/api/build/stream'
        : 'http://localhost:8000/api/chat/stream';

      const requestBody = mode === 'build'
        ? {
            user_input: userInput,
            current_step: currentStep,
            completed_steps: completedSteps,
            phase: phase,
            asset_data: assetData,
            history: messages.slice(0, -1).map(m => ({
              role: m.role,
              content: m.content,
            })),
          }
        : {
            user_input: userInput,
            history: messages.slice(0, -1).map(m => ({
              role: m.role,
              content: m.content,
            })),
          };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      // Clear connection timeout once we get a response
      clearTimeout(connectionTimeoutId);

      if (!response.ok) {
        throw new Error(`Server error (${response.status})`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response stream available');

      let lastReceivedTime = Date.now();
      const STREAM_TIMEOUT = 60000; // 60s without data = timeout

      while (true) {
        // Check if stream has been silent too long
        if (Date.now() - lastReceivedTime > STREAM_TIMEOUT) {
          throw new Error('Stream timeout - no data received');
        }

        const { done, value } = await reader.read();
        if (done) break;

        lastReceivedTime = Date.now(); // Update last received time

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.token) {
                streamingContentRef.current += parsed.token;
                const currentMessages = useLexstudioStore.getState().messages;
                const lastMessage = currentMessages[currentMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  useLexstudioStore.setState({
                    messages: [
                      ...currentMessages.slice(0, -1),
                      { ...lastMessage, content: streamingContentRef.current }
                    ]
                  });
                }
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      // Clear all timeouts
      clearTimeout(connectionTimeoutId);
      clearTimeout(overallTimeoutId);

      const errorMessage = error instanceof Error
        ? (error.name === 'AbortError'
            ? 'Request timed out. The AI service may be slow or unavailable. Please try again.'
            : error.message)
        : 'Unknown error occurred';

      const currentMessages = useLexstudioStore.getState().messages;
      useLexstudioStore.setState({
        messages: [
          ...currentMessages.slice(0, -1),
          {
            ...currentMessages[currentMessages.length - 1],
            content: `⚠️ ${errorMessage}`
          }
        ]
      });
    } finally {
      setIsGenerating(false);

      if (mode === 'build') {
        const responseContent = streamingContentRef.current.toLowerCase();

        const confirmKeywords = ['confirm', 'confirmed', 'complete', 'completed', 'done', 'yes', '好的', '确认', '完成', '是的', '可以', '没问题'];
        const hasConfirmIntent = confirmKeywords.some(keyword =>
          userInput.toLowerCase().includes(keyword)
        );

        const stepCompleteSignals = ["let's move to", 'next step', 'proceed to', 'now we can', '进入下一步', '继续下一步', '接下来'];
        const aiSuggestsNextStep = stepCompleteSignals.some(signal =>
          responseContent.includes(signal)
        );

        if (hasConfirmIntent || aiSuggestsNextStep) {
          const currentMessages = useLexstudioStore.getState().messages;
          const currentAssetData = useLexstudioStore.getState().assetData;

          // Generate structured content via unified API
          generateStepContentViaAPI(currentStep, phase, currentMessages, currentAssetData);

          // Generate project title on step 0
          if (currentStep === 0) {
            generateTitleViaAPI(currentMessages, currentAssetData);
          }

          if (!completedSteps.includes(currentStep)) {
            addCompletedStep(currentStep);
          }

          // Unified 10-step workflow: advance up to step 9
          if (currentStep < 9) {
            setCurrentStep(currentStep + 1);
          }
        }

        extractAssetData(userInput, currentStep);
      }

      streamingContentRef.current = '';
    }
  };

  // Generate structured content via the unified /api/build/content endpoint
  const generateStepContentViaAPI = async (
    step: number,
    phaseValue: string,
    history: typeof messages,
    assetDataValue: typeof assetData
  ) => {
    try {
      const response = await fetch('http://localhost:8000/api/build/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step,
          phase: phaseValue,
          history: history.map(m => ({ role: m.role, content: m.content })),
          asset_data: assetDataValue,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update whitepaper content
          if (data.whitepaper_content) {
            const currentWp = useLexstudioStore.getState().whitepaperContent;
            updateWhitepaper(currentWp + '\n\n' + data.whitepaper_content);
          }

          // Update contract content (triggers diff computation in store)
          if (data.contract_snippet) {
            const currentContract = useLexstudioStore.getState().contractContent;
            // If no existing contract, prepend to template; otherwise append snippet
            if (!currentContract) {
              updateContract(data.contract_snippet);
            } else {
              // Insert snippet before closing brace of contract
              const insertPoint = currentContract.lastIndexOf('\n}');
              if (insertPoint !== -1) {
                const updated =
                  currentContract.slice(0, insertPoint) +
                  '\n\n    // Step ' + step + ' additions\n' +
                  data.contract_snippet +
                  currentContract.slice(insertPoint);
                updateContract(updated);
              } else {
                updateContract(currentContract + '\n\n' + data.contract_snippet);
              }
            }
          }

          // Update arch map if provided
          if (data.arch_map_update) {
            updateArchMap(data.arch_map_update);
          }
        }
      }
    } catch (error) {
      console.error('Failed to generate step content:', error);
    }
  };

  const generateTitleViaAPI = async (
    history: typeof messages,
    assetDataValue: typeof assetData
  ) => {
    try {
      const response = await fetch('http://localhost:8000/api/build/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: history.map(m => ({ role: m.role, content: m.content })),
          asset_data: assetDataValue,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.title) {
          updateAssetData({ name: data.title });
        }
      }
    } catch (error) {
      console.error('Failed to generate title:', error);
    }
  };

  const extractAssetData = (userInputText: string, step: number) => {
    const inputLower = userInputText.toLowerCase();

    if (step === 0) {
      if (inputLower.includes('real estate') || inputLower.includes('房地产') || inputLower.includes('房产') || inputLower.includes('写字楼') || inputLower.includes('商业')) {
        updateAssetData({ type: 'Real Estate' });
      } else if (inputLower.includes('bond') || inputLower.includes('债券')) {
        updateAssetData({ type: 'Bond' });
      } else if (inputLower.includes('equity') || inputLower.includes('股权')) {
        updateAssetData({ type: 'Equity' });
      } else if (inputLower.includes('art') || inputLower.includes('艺术品')) {
        updateAssetData({ type: 'Art' });
      }

      // Extract token symbol
      const symbolMatch = userInputText.match(/\b([A-Z]{2,8})\b/);
      if (symbolMatch) {
        updateAssetData({ tokenSymbol: symbolMatch[1] });
      }
    }

    if (step === 1) {
      // Extract issuer info
      if (inputLower.includes('cayman') || inputLower.includes('开曼')) {
        updateAssetData({ legalStructure: 'Cayman SPV' });
      } else if (inputLower.includes('singapore') || inputLower.includes('新加坡')) {
        updateAssetData({ legalStructure: 'Singapore VCC' });
      } else if (inputLower.includes('delaware') || inputLower.includes('特拉华')) {
        updateAssetData({ legalStructure: 'Delaware LLC' });
      }
    }

    if (step === 2) {
      const supplyMatch = userInputText.match(/(\d+(?:,\d+)*)\s*(?:tokens?|代币)?/i);
      if (supplyMatch) {
        const supply = parseInt(supplyMatch[1].replace(/,/g, ''));
        updateAssetData({ totalSupply: supply });
      }
    }

    if (step === 3) {
      if (inputLower.includes('kyc')) {
        const kycMatch = userInputText.match(/kyc[:\s]+([a-z0-9\s]+)/i);
        if (kycMatch) updateAssetData({ kycProvider: kycMatch[1].trim() });
      }
      if (inputLower.includes('private placement') || inputLower.includes('私募')) {
        updateAssetData({ offeringRoute: 'Private Placement' });
      }
    }

    if (step === 4) {
      const yieldMatch = userInputText.match(/(\d+(?:\.\d+)?)\s*%/);
      if (yieldMatch) {
        updateAssetData({ yieldRate: parseFloat(yieldMatch[1]) });
      }
    }

    if (step === 7) {
      if (inputLower.includes('ethereum') || inputLower.includes('eth mainnet')) {
        updateAssetData({ deployNetwork: 'Ethereum Mainnet' });
      } else if (inputLower.includes('polygon')) {
        updateAssetData({ deployNetwork: 'Polygon' });
      } else if (inputLower.includes('base')) {
        updateAssetData({ deployNetwork: 'Base' });
      }
    }
  };

  const isBuildMode = mode === 'build';

  // Calculate sidebar width for proper centering in main content area
  // Sidebar: 192px (w-48) when expanded, 24px (w-6) when collapsed
  const sidebarWidth = sidebarCollapsed ? 24 : 192;

  return (
    <div
      className={`
        bottom-6
        ${isBuildMode ? 'absolute left-6 right-6' : 'fixed'}
      `}
      style={{
        // Center within the main content area (viewport width minus sidebar)
        left: isBuildMode ? undefined : `calc(${sidebarWidth}px + (100vw - ${sidebarWidth}px) / 2)`,
        transform: isBuildMode ? undefined : 'translateX(-50%)',
        width: isBuildMode ? undefined : '100%',
        maxWidth: isBuildMode ? undefined : '54rem', // ~864px, slightly wider than message container for visual balance
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className={`
        border transition-all duration-300 ease-in-out rounded-lg shadow-md
        ${isBuildMode
          ? 'bg-[var(--accent)] border-[var(--accent)]'
          : 'bg-white border-[#E5E7EB]'
        }
      `}>
        {/* Mode Toggle */}
        <div className={`
          flex items-center justify-between px-4 py-2 border-b transition-colors duration-300
          ${isBuildMode ? 'border-white/20' : 'border-[#E5E7EB]'}
        `}>
          <span className={`
            font-body text-[10px] font-medium uppercase tracking-wide transition-colors duration-300
            ${isBuildMode ? 'text-gray-400' : 'text-gray-500'}
          `}>
            Mode
          </span>

          <button
            onClick={() => setMode(mode === 'chat' ? 'build' : 'chat')}
            className="relative flex items-center gap-0 font-body text-[10px] font-semibold uppercase tracking-wide overflow-hidden"
          >
            <div className={`
              relative w-24 h-6 border transition-all duration-300 rounded overflow-hidden
              ${isBuildMode ? 'border-white' : 'border-[var(--accent)]'}
            `}>
              {/* Sliding background */}
              <div
                className={`
                  absolute top-0 h-full w-1/2 transition-all duration-300 ease-out
                  ${isBuildMode
                    ? 'left-1/2 bg-white'
                    : 'left-0 bg-[var(--accent)]'
                  }
                `}
              />

              {/* Text labels */}
              <div className="relative flex h-full">
                <div className={`
                  flex-1 flex items-center justify-center transition-all duration-300
                  ${!isBuildMode
                    ? 'text-white font-bold'
                    : 'text-white'
                  }
                `}>
                  CHAT
                </div>
                <div className={`
                  flex-1 flex items-center justify-center transition-all duration-300
                  ${isBuildMode
                    ? 'text-[var(--accent)] font-bold'
                    : 'text-black'
                  }
                `}>
                  BUILD
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
            placeholder={
              isGenerating
                ? "AI 正在生成内容，请稍候..."
                : isBuildMode
                  ? "Build your asset..."
                  : "Type your message..."
            }
            disabled={loading || isGenerating}
            className={`
              flex-1 bg-transparent font-body text-sm outline-none disabled:opacity-50
              transition-colors duration-300
              ${isBuildMode
                ? 'text-white placeholder:text-gray-400'
                : 'text-black placeholder:text-gray-500'
              }
            `}
          />
          <button
            type="submit"
            disabled={loading || isGenerating || !input.trim()}
            className={`
              w-8 h-8 flex items-center justify-center font-mono text-lg
              border-2 transition-all duration-200 rounded-md
              ${loading || isGenerating
                ? isBuildMode
                  ? 'bg-white/30 text-white border-white/30 cursor-not-allowed'
                  : 'bg-[var(--accent)]/30 text-[var(--accent)] border-[var(--accent)]/30 cursor-not-allowed'
                : !input.trim()
                  ? isBuildMode
                    ? 'bg-white/30 text-white border-white/30 cursor-not-allowed'
                    : 'bg-[var(--accent)]/30 text-[var(--accent)] border-[var(--accent)]/30 cursor-not-allowed'
                  : isBuildMode
                    ? 'bg-white text-[var(--accent)] border-white hover:bg-[var(--accent)] hover:text-white hover:scale-110 shadow-sm hover:shadow-md'
                    : 'bg-[var(--accent)] text-white border-[var(--accent)] hover:bg-black hover:border-black hover:scale-110 shadow-sm hover:shadow-md'
              }
            `}
          >
            {loading || isGenerating ? (
              <span className={`inline-block w-4 h-4 border-2 rounded-full animate-spin ${
                isBuildMode
                  ? 'border-white border-t-transparent'
                  : 'border-[var(--accent)] border-t-transparent'
              }`} />
            ) : '↑'}
          </button>
        </form>
      </div>
    </div>
  );
}
