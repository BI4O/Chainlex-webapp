"""
LangChain Chat Agent for Lexstudio with Streaming Support
"""

from langchain.agents import create_agent, AgentState
from langchain_openai import ChatOpenAI
from langchain.tools import tool, ToolRuntime
from langgraph.types import Command
from langchain.messages import ToolMessage
from dotenv import load_dotenv
from typing import Optional, AsyncIterator
import os

# Load environment variables
load_dotenv()

# Initialize LLM with environment variables
llm = ChatOpenAI(
    model="kimi-k2",
    temperature=0.7,
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL"),
)

# System prompt for Chat Mode
CHAT_SYSTEM_PROMPT = """
You are Lexstudio AI, an expert assistant for Real World Asset (RWA) tokenization.

## Response Style
- Be concise and professional. Maximum 3-4 sentences per response unless detailed explanation is requested.
- Use bullet points for lists, not long paragraphs.
- Get straight to the point. No filler words or excessive politeness.
- Use simple language. Avoid jargon unless necessary.

## Your Role
- Answer RWA, tokenization, and blockchain questions precisely
- If users want to create an asset, briefly suggest switching to Build Mode
- Provide actionable, specific advice

Keep responses under 100 words unless the question requires detailed explanation.
"""

# Define a simple tool for demonstration
@tool
def get_rwa_info(topic: str, runtime: ToolRuntime) -> Command:
    """Get information about RWA topics"""
    tool_call_id = runtime.tool_call_id

    info = {
        "tokenization": "RWA tokenization converts real-world assets into digital tokens on blockchain.",
        "compliance": "RWA projects must comply with securities regulations like SEC rules.",
        "benefits": "Benefits include fractional ownership, liquidity, and 24/7 trading.",
    }

    content = info.get(topic.lower(), f"Information about {topic} in RWA context.")

    return Command(update={
        "messages": [
            ToolMessage(content=content, tool_call_id=tool_call_id)
        ]
    })

# Create chat agent
chat_agent = create_agent(
    model=llm,
    tools=[get_rwa_info],
    system_prompt=CHAT_SYSTEM_PROMPT,
    state_schema=AgentState,
)

async def stream_chat_agent(user_input: str, history: list) -> AsyncIterator[str]:
    """
    Stream the chat agent response token by token

    Args:
        user_input: User's message
        history: List of previous messages

    Yields:
        Token strings as they are generated
    """
    try:
        # Convert history to LangChain message format
        messages = []
        for msg in history:
            messages.append(msg.get("content", ""))

        # Add current user input
        messages.append(user_input)

        # Stream agent with astream_events
        async for event in chat_agent.astream_events(
            {"messages": messages},
            version="v2"
        ):
            # Filter for LLM token events
            if event["event"] == "on_chat_model_stream":
                chunk = event["data"]["chunk"]
                if hasattr(chunk, 'content') and chunk.content:
                    yield chunk.content

    except Exception as e:
        yield f"\n\nError: {str(e)}"

def run_chat_agent(user_input: str, history: list) -> str:
    """
    Run the chat agent with user input and history (non-streaming version)

    Args:
        user_input: User's message
        history: List of previous messages

    Returns:
        AI's response message
    """
    try:
        # Convert history to LangChain message format
        messages = []
        for msg in history:
            messages.append(msg.get("content", ""))

        # Add current user input
        messages.append(user_input)

        # Run agent
        state = chat_agent.invoke({"messages": messages})

        # Extract last AI message
        if state and "messages" in state:
            last_message = state["messages"][-1]
            if hasattr(last_message, 'content'):
                return last_message.content
            return str(last_message)

        return "I'm here to help with RWA and tokenization questions!"

    except Exception as e:
        return f"I encountered an error: {str(e)}. Please try again."
