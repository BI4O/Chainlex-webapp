/**
 * API client for Lexstudio backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ChatRequest {
  user_input: string;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface BuildRequest {
  user_input: string;
  current_step: number;
  completed_steps: number[];
  phase: 'whitepaper' | 'contract';
  asset_data: Record<string, any>;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ChatResponse {
  message: string;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface BuildResponse {
  message: string;
  current_step: number;
  completed_steps: number[];
  asset_data: Record<string, any>;
  whitepaper_content: string;
  contract_content: string;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

/**
 * Send a chat message to the backend
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Send a build mode message to the backend
 */
export async function sendBuildMessage(request: BuildRequest): Promise<BuildResponse> {
  const response = await fetch(`${API_BASE_URL}/api/build`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Build API error: ${response.statusText}`);
  }

  return response.json();
}
