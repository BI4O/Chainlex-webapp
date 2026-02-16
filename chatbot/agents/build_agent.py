"""
LangChain Build Agent for Lexstudio
Task-oriented agent for Build Mode with 7-step workflow
"""

from langchain.agents import create_agent, AgentState
from langchain_openai import ChatOpenAI
from langchain.tools import tool, ToolRuntime
from langgraph.types import Command
from langchain.messages import ToolMessage
from dotenv import load_dotenv
from typing import Optional, AsyncIterator, Dict, Any
import os

# Load environment variables
load_dotenv()

# Initialize LLM
llm = ChatOpenAI(
    model="kimi-k2",
    temperature=0.7,
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL"),
)

# Whitepaper steps
WHITEPAPER_STEPS = {
    0: "Asset Onboarding - Define underlying asset information",
    1: "Valuation - Connect Oracle for valuation data",
    2: "Yield Design - Set yield rate and distribution frequency",
    3: "Legal Structure - Choose SPV structure and jurisdiction",
    4: "Compliance - Enforcer intervention for qualified investor restrictions",
    5: "Tokenomics - Define token supply and distribution logic",
    6: "Final Review - Review and confirm the complete whitepaper",
}

# Contract steps
CONTRACT_STEPS = {
    0: "Standard Select - Choose ERC-3643 or ERC-1400 RWA standard",
    1: "Minting Logic - Set minting permissions and limits",
    2: "Transfer Rules - Configure whitelist and transfer restrictions",
    3: "Compliance Integration - Integrate Enforcer compliance checks",
    4: "Oracle Integration - Integrate Oracle data sources",
    5: "Testing - Contract testing and verification",
    6: "Final Review - Review and confirm the complete contract",
}

def get_system_prompt(phase: str, current_step: int, completed_steps: list) -> str:
    """Generate system prompt based on current phase and step"""

    steps = WHITEPAPER_STEPS if phase == "whitepaper" else CONTRACT_STEPS
    current_step_name = steps.get(current_step, "Unknown Step")

    base_prompt = f"""
You are Lexstudio AI Build Mode Assistant, guiding users through RWA asset creation.

Current Phase: {phase.upper()}
Current Step: {current_step + 1}/7 - {current_step_name}
Completed Steps: {len(completed_steps)}/7

Your role:
- Guide the user through the current step
- Ask relevant questions to gather necessary information
- Provide clear explanations and examples
- Confirm information before moving to next step
- If user jumps to a step, remind them of incomplete prerequisites

Keep responses focused and actionable.
"""

    # Add step-specific guidance
    if phase == "whitepaper":
        if current_step == 0:
            base_prompt += "\n\nFor Asset Onboarding, ask about: asset type, name, description, underlying value."
        elif current_step == 1:
            base_prompt += "\n\nFor Valuation, discuss: valuation method, Oracle integration, data sources."
        elif current_step == 2:
            base_prompt += "\n\nFor Yield Design, ask about: expected yield rate, distribution frequency, calculation method."
        elif current_step == 3:
            base_prompt += "\n\nFor Legal Structure, discuss: SPV type, jurisdiction, legal entity structure."
        elif current_step == 4:
            base_prompt += "\n\nFor Compliance, cover: investor qualifications, KYC/AML requirements, regulatory compliance."
        elif current_step == 5:
            base_prompt += "\n\nFor Tokenomics, ask about: total supply, token distribution, vesting schedule."
        elif current_step == 6:
            base_prompt += "\n\nFor Final Review, summarize all collected information and ask for confirmation."

    return base_prompt

# Create build agent
def create_build_agent_instance(phase: str, current_step: int, completed_steps: list):
    """Create a build agent with current context"""
    system_prompt = get_system_prompt(phase, current_step, completed_steps)

    return create_agent(
        model=llm,
        tools=[],  # No tools for now, can add later
        system_prompt=system_prompt,
        state_schema=AgentState,
    )

async def stream_build_agent(
    user_input: str,
    history: list,
    current_step: int,
    completed_steps: list,
    phase: str,
    asset_data: Dict[str, Any]
) -> AsyncIterator[str]:
    """
    Stream the build agent response token by token
    """
    try:
        # Create agent with current context
        agent = create_build_agent_instance(phase, current_step, completed_steps)

        # Convert history to messages
        messages = []
        for msg in history:
            messages.append(msg.get("content", ""))

        # Add current user input
        messages.append(user_input)

        # Stream agent
        async for event in agent.astream_events(
            {"messages": messages},
            version="v2"
        ):
            if event["event"] == "on_chat_model_stream":
                chunk = event["data"]["chunk"]
                if hasattr(chunk, 'content') and chunk.content:
                    yield chunk.content

    except Exception as e:
        yield f"\n\nError: {str(e)}"

def run_build_agent(
    user_input: str,
    history: list,
    current_step: int,
    completed_steps: list,
    phase: str,
    asset_data: Dict[str, Any]
) -> str:
    """
    Run the build agent (non-streaming version)
    """
    try:
        # Create agent with current context
        agent = create_build_agent_instance(phase, current_step, completed_steps)

        # Convert history to messages
        messages = []
        for msg in history:
            messages.append(msg.get("content", ""))

        # Add current user input
        messages.append(user_input)

        # Run agent
        state = agent.invoke({"messages": messages})

        # Extract last AI message
        if state and "messages" in state:
            last_message = state["messages"][-1]
            if hasattr(last_message, 'content'):
                return last_message.content
            return str(last_message)

        return "I'm here to help you build your RWA asset!"

    except Exception as e:
        return f"I encountered an error: {str(e)}. Please try again."
