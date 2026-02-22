"""
Chat Agent for Lexstudio with Streaming Support
Uses openai client directly for compatibility with third-party API providers.
"""

from openai import AsyncOpenAI, OpenAI, APITimeoutError, APIConnectionError
from dotenv import load_dotenv
from typing import AsyncIterator
import os
import asyncio

load_dotenv()

# Configure timeout settings
REQUEST_TIMEOUT = 60.0  # 60 seconds timeout
CONNECT_TIMEOUT = 10.0  # 10 seconds to establish connection

_async_client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL"),
    timeout=REQUEST_TIMEOUT,
)

_sync_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL"),
    timeout=REQUEST_TIMEOUT,
)

MODEL = os.getenv("MODEL_NAME", "gpt-4o")

CHAT_SYSTEM_PROMPT = """You are Lexstudio AI, an expert assistant for Real World Asset (RWA) tokenization.

## CRITICAL: Language Rule
**You MUST respond in the SAME language as the user's input.**
- If user writes in Chinese (中文), respond in Chinese
- If user writes in English, respond in English
- Always match the user's language exactly - this is non-negotiable

## Response Style
- Be concise and professional. Maximum 3-4 sentences per response unless detailed explanation is requested.
- Use bullet points for lists, not long paragraphs.
- Get straight to the point. No filler words or excessive politeness.

## Your Role
- Answer RWA, tokenization, and blockchain questions precisely
- If users want to create an asset, briefly suggest switching to Build Mode
- Provide actionable, specific advice

Keep responses under 100 words unless the question requires detailed explanation."""


def _build_messages(user_input: str, history: list) -> list:
    messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}]
    for msg in history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role in ("user", "assistant"):
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": user_input})
    return messages


async def stream_chat_agent(user_input: str, history: list) -> AsyncIterator[str]:
    """Stream chat response token by token with timeout handling."""
    try:
        messages = _build_messages(user_input, history)

        # Create stream with timeout
        stream = await asyncio.wait_for(
            _async_client.chat.completions.create(
                model=MODEL,
                messages=messages,
                stream=True,
            ),
            timeout=CONNECT_TIMEOUT
        )

        async for chunk in stream:
            delta = chunk.choices[0].delta.content if chunk.choices else None
            if delta:
                yield delta

    except asyncio.TimeoutError:
        yield "\n\n⚠️ Connection timeout. The AI service is taking too long to respond. Please try again."
    except APITimeoutError:
        yield "\n\n⚠️ API timeout. Please check your network connection and try again."
    except APIConnectionError as e:
        yield f"\n\n⚠️ Connection error: {str(e)}. Please check if the API endpoint is accessible."
    except Exception as e:
        yield f"\n\n⚠️ Error: {str(e)}"


def run_chat_agent(user_input: str, history: list) -> str:
    """Non-streaming fallback."""
    try:
        messages = _build_messages(user_input, history)
        response = _sync_client.chat.completions.create(
            model=MODEL,
            messages=messages,
            stream=False,
        )
        return response.choices[0].message.content or ""
    except APITimeoutError:
        return "⚠️ Request timed out. The AI service may be slow. Please try again."
    except APIConnectionError:
        return "⚠️ Connection error. Please check your network and try again."
    except Exception as e:
        return f"⚠️ Error: {str(e)}. Please try again."
