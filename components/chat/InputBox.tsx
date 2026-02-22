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

  // Sidebar state for dynamic positioning
  const sidebarCollapsed = useLexstudioStore((state) => state.sidebarCollapsed);

  // AI generation state (global)
  const isGenerating = useLexstudioStore((state) => state.isGenerating);
  const setIsGenerating = useLexstudioStore((state) => state.setIsGenerating);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Block submission when generating or no input
    if (!input.trim() || loading || isGenerating) return;

    const userInput = input.trim();
    setInput('');
    setLoading(true);
    setIsGenerating(true);
    streamingContentRef.current = '';

    // Add user message
    addMessage({
      role: 'user',
      content: userInput,
    });

    // Add placeholder for AI message with loading dots
    addMessage({
      role: 'assistant',
      content: '...',
    });

    try {
      setLoading(false);

      // Choose API endpoint based on mode
      const apiEndpoint = mode === 'build'
        ? 'http://localhost:8000/api/build/stream'
        : 'http://localhost:8000/api/chat/stream';

      // Prepare request body based on mode
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

      // Use EventSource for Server-Sent Events
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.token) {
                streamingContentRef.current += parsed.token;
                // Update the last message with accumulated content
                const currentMessages = useLexstudioStore.getState().messages;
                const lastMessage = currentMessages[currentMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  // Force update by creating new array
                  useLexstudioStore.setState({
                    messages: [
                      ...currentMessages.slice(0, -1),
                      { ...lastMessage, content: streamingContentRef.current }
                    ]
                  });
                }
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      // Update last message with error
      const currentMessages = useLexstudioStore.getState().messages;
      useLexstudioStore.setState({
        messages: [
          ...currentMessages.slice(0, -1),
          {
            ...currentMessages[currentMessages.length - 1],
            content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ]
      });
    } finally {
      setIsGenerating(false);

      // In Build Mode, check for step completion signals
      if (mode === 'build') {
        const responseContent = streamingContentRef.current.toLowerCase();

        // Detect confirmation keywords (用户确认关键词)
        const confirmKeywords = ['confirm', 'confirmed', 'complete', 'completed', 'done', 'yes', '好的', '确认', '完成', '是的', '可以', '没问题'];
        const hasConfirmIntent = confirmKeywords.some(keyword =>
          userInput.toLowerCase().includes(keyword)
        );

        // Detect step completion signals in AI response
        const stepCompleteSignals = ['let\'s move to', 'next step', 'proceed to', 'now we can', '进入下一步', '继续下一步', '接下来'];
        const aiSuggestsNextStep = stepCompleteSignals.some(signal =>
          responseContent.includes(signal)
        );

        // If user confirms or AI suggests next step, mark current step as complete
        if (hasConfirmIntent || aiSuggestsNextStep) {
          // Get current state for API call
          const currentMessages = useLexstudioStore.getState().messages;
          const currentAssetData = useLexstudioStore.getState().assetData;

          // Generate structured content via API
          generateStepContentViaAPI(currentStep, phase, currentMessages, currentAssetData);

          // Generate/update project title (especially for first step)
          if (currentStep === 0) {
            generateTitleViaAPI(currentMessages, currentAssetData);
          }

          // Add current step to completed steps
          if (!completedSteps.includes(currentStep)) {
            addCompletedStep(currentStep);
          }

          // Move to next step if not at the last step
          if (currentStep < 11) {
            setCurrentStep(currentStep + 1);
          }
        }

        // Update asset data based on user input
        extractAssetData(userInput, currentStep);
      }

      streamingContentRef.current = '';
    }
  };

  // Helper function to generate structured content via API
  const generateStepContentViaAPI = async (
    step: number,
    phase: string,
    history: typeof messages,
    assetDataValue: typeof assetData
  ) => {
    try {
      const response = await fetch('http://localhost:8000/api/build/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step,
          phase,
          history: history.map(m => ({
            role: m.role,
            content: m.content,
          })),
          asset_data: assetDataValue,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.content) {
          // Append structured content to whitepaper/contract
          if (phase === 'whitepaper') {
            const currentContent = useLexstudioStore.getState().whitepaperContent;
            updateWhitepaper(currentContent + '\n\n' + data.content);
          } else {
            const currentContent = useLexstudioStore.getState().contractContent;
            updateContract(currentContent + '\n\n' + data.content);
          }
        }
      }
    } catch (error) {
      console.error('Failed to generate step content:', error);
    }
  };

  // Helper function to generate project title via API
  const generateTitleViaAPI = async (
    history: typeof messages,
    assetDataValue: typeof assetData
  ) => {
    try {
      const response = await fetch('http://localhost:8000/api/build/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: history.map(m => ({
            role: m.role,
            content: m.content,
          })),
          asset_data: assetDataValue,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.title) {
          // Update asset data with generated title
          updateAssetData({ name: data.title });
        }
      }
    } catch (error) {
      console.error('Failed to generate title:', error);
    }
  };

  // Helper function to extract asset data from user input
  const extractAssetData = (input: string, step: number) => {
    const inputLower = input.toLowerCase();

    // Step 0: Asset Onboarding - extract type only (name will be generated by AI)
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
      // Name will be generated by AI via generateTitleViaAPI
    }

    // Step 2: Yield Design - extract yield rate
    if (step === 2) {
      const yieldMatch = input.match(/(\d+(?:\.\d+)?)\s*%/);
      if (yieldMatch) {
        updateAssetData({ yieldRate: parseFloat(yieldMatch[1]) });
      }
    }

    // Step 3: Legal Structure - extract jurisdiction
    if (step === 3) {
      if (inputLower.includes('cayman') || inputLower.includes('开曼')) {
        updateAssetData({ legalStructure: 'Cayman SPV' });
      } else if (inputLower.includes('singapore') || inputLower.includes('新加坡')) {
        updateAssetData({ legalStructure: 'Singapore VCC' });
      } else if (inputLower.includes('delaware') || inputLower.includes('特拉华')) {
        updateAssetData({ legalStructure: 'Delaware LLC' });
      }
    }

    // Step 5: Tokenomics - extract total supply
    if (step === 5) {
      const supplyMatch = input.match(/(\d+(?:,\d+)*)\s*(?:tokens?|代币)?/i);
      if (supplyMatch) {
        const supply = parseInt(supplyMatch[1].replace(/,/g, ''));
        updateAssetData({ totalSupply: supply });
      }
    }
  };

  // Phase switch state
  const setPhase = useLexstudioStore((state) => state.setPhase);
  const [showPhaseSwitch, setShowPhaseSwitch] = useState(false);

  // Check if whitepaper is complete (all 7 steps done)
  const isWhitepaperComplete = phase === 'whitepaper' && completedSteps.includes(11);

  // Show phase switch prompt when whitepaper is complete
  if (isWhitepaperComplete && !showPhaseSwitch) {
    setShowPhaseSwitch(true);
  }

  const handlePhaseSwitch = (confirm: boolean) => {
    if (confirm) {
      setPhase('contract');
    }
    setShowPhaseSwitch(false);
  };

  const isBuildMode = mode === 'build';

  // Calculate left position based on sidebar state
  // Sidebar is 240px (w-60) when expanded, 32px (w-8) when collapsed
  const sidebarWidth = sidebarCollapsed ? 32 : 240;
  const leftPosition = isBuildMode ? 'auto' : `${sidebarWidth + 40}px`;

  return (
    <div
      className={`
        bottom-8
        ${isBuildMode ? 'absolute left-8 right-8' : 'fixed right-16 mx-8'}
      `}
      style={{
        left: isBuildMode ? undefined : leftPosition,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Phase Switch Confirmation */}
      {showPhaseSwitch && isBuildMode && (
        <div className="mb-4 border-2 border-white bg-[#324998] p-4 rounded-xl shadow-lg">
          <p className="text-white font-body text-sm mb-3">
            商业逻辑已锁定，是否开始技术建模？
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handlePhaseSwitch(true)}
              className="px-4 py-2 bg-white text-[#324998] font-body text-sm font-medium hover:bg-[#f0f2f5] transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
            >
              开始合约设计
            </button>
            <button
              onClick={() => handlePhaseSwitch(false)}
              className="px-4 py-2 border-2 border-white text-white font-body text-sm font-medium hover:bg-white hover:text-[#324998] transition-all duration-200 rounded-lg"
            >
              稍后
            </button>
          </div>
        </div>
      )}
      <div className={`
        border transition-all duration-300 ease-in-out rounded-xl shadow-lg
        ${isBuildMode
          ? 'bg-[#324998] border-[#324998]'
          : 'bg-white border-[#E5E7EB]'
        }
      `}>
        {/* Mode Toggle - Redesigned */}
        <div className={`
          flex items-center justify-between px-6 py-3 border-b transition-colors duration-300
          ${isBuildMode ? 'border-white/20' : 'border-[#E5E7EB]'}
        `}>
          <span className={`
            font-body text-xs font-medium uppercase tracking-wide transition-colors duration-300
            ${isBuildMode ? 'text-gray-400' : 'text-gray-500'}
          `}>
            Mode
          </span>

          {/* Toggle Switch */}
          <button
            onClick={() => setMode(mode === 'chat' ? 'build' : 'chat')}
            className="relative flex items-center gap-0 font-body text-xs font-semibold uppercase tracking-wide overflow-hidden"
          >
            <div className={`
              relative w-32 h-8 border-2 transition-all duration-300 rounded-lg overflow-hidden
              ${isBuildMode ? 'border-white' : 'border-[#324998]'}
            `}>
              {/* Sliding background */}
              <div
                className={`
                  absolute top-0 h-full w-1/2 transition-all duration-300 ease-out
                  ${isBuildMode
                    ? 'left-1/2 bg-white'
                    : 'left-0 bg-[#324998]'
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
                    ? 'text-[#324998] font-bold'
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
        <form onSubmit={handleSubmit} className="flex items-center gap-4 p-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isGenerating
                ? "AI 正在生成内容，请稍候..."
                : isBuildMode
                  ? "Build your asset..."
                  : "Type your message..."
            }
            disabled={loading || isGenerating}
            className={`
              flex-1 bg-transparent font-body text-base outline-none disabled:opacity-50
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
              w-10 h-10 flex items-center justify-center font-mono text-xl
              border-2 transition-all duration-200 rounded-lg
              ${loading || isGenerating
                ? isBuildMode
                  ? 'bg-white/30 text-white border-white/30 cursor-not-allowed'
                  : 'bg-[#324998]/30 text-[#324998] border-[#324998]/30 cursor-not-allowed'
                : !input.trim()
                  ? isBuildMode
                    ? 'bg-white/30 text-white border-white/30 cursor-not-allowed'
                    : 'bg-[#324998]/30 text-[#324998] border-[#324998]/30 cursor-not-allowed'
                  : isBuildMode
                    ? 'bg-white text-[#324998] border-white hover:bg-[#324998] hover:text-white hover:scale-110 shadow-sm hover:shadow-md'
                    : 'bg-[#324998] text-white border-[#324998] hover:bg-black hover:border-black hover:scale-110 shadow-sm hover:shadow-md'
              }
            `}
          >
            {loading || isGenerating ? (
              <span className={`inline-block w-5 h-5 border-2 rounded-full animate-spin ${
                isBuildMode
                  ? 'border-white border-t-transparent'
                  : 'border-[#324998] border-t-transparent'
              }`} />
            ) : '↑'}
          </button>
        </form>
      </div>
    </div>
  );
}
