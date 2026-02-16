'use client';

import { useState, useRef } from 'react';
import { useLexstudioStore } from '@/lib/store';

export function InputBox() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || streaming) return;

    const userInput = input.trim();
    setInput('');
    setLoading(true);
    streamingContentRef.current = '';

    // Add user message
    addMessage({
      role: 'user',
      content: userInput,
    });

    // Add placeholder for AI message with loading dots
    const placeholderId = `placeholder-${Date.now()}`;
    addMessage({
      role: 'assistant',
      content: '...',
    });

    try {
      setLoading(false);
      setStreaming(true);

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
      setStreaming(false);

      // In Build Mode, check for step completion signals
      if (mode === 'build') {
        const responseContent = streamingContentRef.current.toLowerCase();

        // Detect confirmation keywords (用户确认关键词)
        const confirmKeywords = ['confirm', 'confirmed', 'complete', 'completed', 'done', 'yes', '好的', '确认', '完成', '是的', '可以', '没问题'];
        const hasConfirmIntent = confirmKeywords.some(keyword =>
          userInput.toLowerCase().includes(keyword)
        );

        // Detect step completion signals in AI response
        const stepCompleteSignals = ['let\'s move to', 'next step', 'proceed to', 'now we can', '进入下一步', '继续下一步'];
        const aiSuggestsNextStep = stepCompleteSignals.some(signal =>
          responseContent.includes(signal)
        );

        // If user confirms or AI suggests next step, mark current step as complete
        if (hasConfirmIntent || aiSuggestsNextStep) {
          // Add current step to completed steps
          if (!completedSteps.includes(currentStep)) {
            addCompletedStep(currentStep);
          }

          // Move to next step if not at the last step
          if (currentStep < 6) {
            setCurrentStep(currentStep + 1);
          }

          // Generate content snippet based on current step
          generateContentSnippet(currentStep, phase, streamingContentRef.current);
        }

        // Update asset data based on user input
        extractAssetData(userInput, currentStep);
      }

      streamingContentRef.current = '';
    }
  };

  // Helper function to generate content snippet for whitepaper/contract
  const generateContentSnippet = (step: number, phase: string, aiResponse: string) => {
    const steps = phase === 'whitepaper'
      ? ['Asset Onboarding', 'Valuation', 'Yield Design', 'Legal Structure', 'Compliance', 'Tokenomics', 'Final Review']
      : ['Standard Select', 'Minting Logic', 'Transfer Rules', 'Compliance Integration', 'Oracle Integration', 'Testing', 'Final Review'];

    const stepName = steps[step];
    const timestamp = new Date().toLocaleString();
    const snippet = `\n\n## ${stepName}\n*${timestamp}*\n\n${aiResponse}\n---`;

    if (phase === 'whitepaper') {
      const currentContent = useLexstudioStore.getState().whitepaperContent;
      updateWhitepaper(currentContent + snippet);
    } else {
      const currentContent = useLexstudioStore.getState().contractContent;
      updateContract(currentContent + snippet);
    }
  };

  // Helper function to extract asset data from user input
  const extractAssetData = (input: string, step: number) => {
    const inputLower = input.toLowerCase();

    // Step 0: Asset Onboarding - extract name and type
    if (step === 0) {
      if (inputLower.includes('real estate') || inputLower.includes('房地产') || inputLower.includes('房产')) {
        updateAssetData({ type: 'Real Estate' });
      } else if (inputLower.includes('bond') || inputLower.includes('债券')) {
        updateAssetData({ type: 'Bond' });
      } else if (inputLower.includes('equity') || inputLower.includes('股权')) {
        updateAssetData({ type: 'Equity' });
      }
      // Extract potential asset name (simplified)
      const words = input.split(' ');
      if (words.length > 0 && words[0].length > 2) {
        updateAssetData({ name: words.slice(0, 3).join(' ') });
      }
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

  const isBuildMode = mode === 'build';

  return (
    <div
      className={`
        bottom-8
        ${isBuildMode ? 'absolute left-8 right-8' : 'fixed left-[280px] right-16 mx-8'}
      `}
      style={{
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className={`
        border-2 transition-all duration-300 ease-in-out
        ${isBuildMode
          ? 'bg-foreground border-background'
          : 'bg-background border-foreground'
        }
      `}>
        {/* Mode Toggle - Redesigned */}
        <div className={`
          flex items-center justify-between px-6 py-3 border-b-2 transition-colors duration-300
          ${isBuildMode ? 'border-background' : 'border-foreground'}
        `}>
          <span className={`
            font-mono text-xs uppercase tracking-widest transition-colors duration-300
            ${isBuildMode ? 'text-muted' : 'text-muted-foreground'}
          `}>
            Mode
          </span>

          {/* Toggle Switch */}
          <button
            onClick={() => setMode(mode === 'chat' ? 'build' : 'chat')}
            className="relative flex items-center gap-0 font-mono text-xs uppercase tracking-widest overflow-hidden"
          >
            <div className={`
              relative w-32 h-8 border-2 transition-all duration-300
              ${isBuildMode ? 'border-background' : 'border-foreground'}
            `}>
              {/* Sliding background */}
              <div
                className={`
                  absolute top-0 h-full w-1/2 transition-all duration-300 ease-out
                  ${isBuildMode
                    ? 'left-1/2 bg-background'
                    : 'left-0 bg-foreground'
                  }
                `}
                style={{
                  transform: isBuildMode ? 'translateX(0)' : 'translateX(0)',
                }}
              />

              {/* Text labels */}
              <div className="relative flex h-full">
                <div className={`
                  flex-1 flex items-center justify-center transition-all duration-300
                  ${!isBuildMode ? 'text-background font-bold' : 'text-foreground'}
                `}>
                  CHAT
                </div>
                <div className={`
                  flex-1 flex items-center justify-center transition-all duration-300
                  ${isBuildMode ? 'text-foreground font-bold' : 'text-background'}
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
            placeholder={isBuildMode ? "Build your asset..." : "Type your message..."}
            disabled={loading}
            className={`
              flex-1 bg-transparent font-body text-base outline-none disabled:opacity-50
              transition-colors duration-300
              ${isBuildMode
                ? 'text-background placeholder:text-muted'
                : 'text-foreground placeholder:text-muted-foreground'
              }
            `}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`
              w-10 h-10 flex items-center justify-center font-mono text-xl
              border-2 transition-all duration-200
              ${loading || !input.trim()
                ? 'opacity-25 cursor-not-allowed'
                : isBuildMode
                  ? 'bg-background text-foreground border-background hover:bg-foreground hover:text-background hover:scale-110'
                  : 'bg-foreground text-background border-foreground hover:bg-background hover:text-foreground hover:scale-110'
              }
            `}
          >
            {loading ? '...' : '↑'}
          </button>
        </form>
      </div>
    </div>
  );
}
