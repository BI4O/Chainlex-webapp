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

# Step-specific content generation prompts
STEP_CONTENT_PROMPTS = {
    0: """Based on the conversation, generate a structured summary for the Asset Onboarding section.
Format your response EXACTLY as follows (use Markdown):

## 资产概述

### 基本信息
- **项目名称**: [Generate a professional project name, e.g., "银河大厦RWA代币化项目"]
- **资产类型**: [Asset type]
- **地理位置**: [Location if mentioned]
- **资产描述**: [Brief description]

### 资产特征
- **规模**: [Size/scale if mentioned]
- **状态**: [Current status if mentioned]
- **其他**: [Other relevant info]

Only include information that was actually provided. Use "待补充" for missing information.""",

    1: """Based on the conversation, generate a structured summary for the Valuation section.
Format your response EXACTLY as follows:

## 估值方案

### 估值方法
- **采用方法**: [Valuation method discussed]
- **数据来源**: [Oracle/data source]

### 估值结果
- **估值金额**: [Valuation amount]
- **评估机构**: [Valuation provider if mentioned]
- **评估日期**: [Date if mentioned]

### 估值依据
[Brief explanation of valuation basis]

Only include information that was actually provided.""",

    2: """Generate structured Yield Design section:

## 收益设计

### 收益分配
- **预期年化收益率**: [Yield rate]
- **分配频率**: [Distribution frequency]
- **计算方式**: [Calculation method]

### 收益来源
[Description of yield sources]

Only include provided information.""",

    3: """Generate structured Legal Structure section:

## 法律架构

### SPV架构
- **架构类型**: [SPV type]
- **注册地**: [Jurisdiction]
- **法律顾问**: [Legal advisor if mentioned]

### 合规要点
[Key compliance considerations]

Only include provided information.""",

    4: """Generate structured Compliance section:

## 合规安排

### 投资者资格
- **合格投资者要求**: [Requirements]
- **KYC/AML**: [Procedures]

### 监管合规
- **适用法规**: [Applicable regulations]
- **备案要求**: [Filing requirements]

Only include provided information.""",

    5: """Generate structured Tokenomics section:

## 代币经济模型

### 代币发行
- **代币名称**: [Token name]
- **代币符号**: [Token symbol]
- **发行总量**: [Total supply]
- **代币精度**: [Decimals]

### 分配方案
[Token distribution plan]

Only include provided information.""",

    6: """Generate Final Review summary combining all completed sections.
Create a comprehensive summary of the entire whitepaper."""
}

TITLE_GENERATION_PROMPT = """Based on the conversation, generate a concise, professional title for this RWA tokenization project.

Rules:
1. Maximum 30 characters in Chinese or 40 characters in English
2. Format: [Asset Name] + [RWA/代币化] if applicable
3. Examples: "银河大厦RWA", "上海浦东写字楼代币化", "Manhattan Office RWA"
4. If not enough information, return "待命名项目"

Return ONLY the title, nothing else."""


def generate_step_content(
    step: int,
    phase: str,
    history: list,
    asset_data: Dict[str, Any]
) -> str:
    """Generate structured content for a completed step"""
    try:
        # Get the content prompt for this step
        if phase == "whitepaper" and step in STEP_CONTENT_PROMPTS:
            content_prompt = STEP_CONTENT_PROMPTS[step]
        else:
            return ""

        # Create a summary agent
        summary_prompt = f"""
You are a professional RWA documentation assistant.

{content_prompt}

Conversation history to extract information from:
{chr(10).join([f"{m.get('role', 'user')}: {m.get('content', '')}" for m in history[-10:]])}

Current asset data: {asset_data}

Generate the structured content now. Use Chinese for all content.
"""

        # Run LLM to generate structured content
        response = llm.invoke(summary_prompt)
        return response.content if hasattr(response, 'content') else str(response)

    except Exception as e:
        return f"内容生成错误: {str(e)}"


def generate_project_title(
    history: list,
    asset_data: Dict[str, Any]
) -> str:
    """Generate a professional project title"""
    try:
        summary_prompt = f"""
{TITLE_GENERATION_PROMPT}

Conversation history:
{chr(10).join([f"{m.get('role', 'user')}: {m.get('content', '')}" for m in history[-6:]])}

Current asset data: {asset_data}

Generate the title now. Return ONLY the title.
"""

        response = llm.invoke(summary_prompt)
        title = response.content if hasattr(response, 'content') else str(response)
        # Clean up the title
        title = title.strip().strip('"\'')
        if len(title) > 40:
            title = title[:37] + "..."
        return title

    except Exception as e:
        return "待命名项目"


def get_system_prompt(phase: str, current_step: int, completed_steps: list) -> str:
    """Generate system prompt based on current phase and step"""

    steps = WHITEPAPER_STEPS if phase == "whitepaper" else CONTRACT_STEPS
    current_step_name = steps.get(current_step, "Unknown Step")

    base_prompt = f"""
You are Lexstudio Build Mode AI. Guide users through RWA asset creation.

**Current**: Step {current_step + 1}/7 - {current_step_name}

## Response Rules
- Maximum 50 words per response
- Ask 1-2 questions at a time, not all at once
- Use bullet points for lists
- No greetings, no filler words
- When user confirms info, say "确认。进入下一步。" briefly

## Step Focus
"""

    # Add step-specific guidance - concise
    if phase == "whitepaper":
        step_focus = {
            0: "收集: 资产类型、名称、位置、规模",
            1: "收集: 估值金额、估值方法、数据来源",
            2: "收集: 预期收益率、分配频率",
            3: "收集: SPV类型、注册地",
            4: "收集: 投资者资格要求、KYC/AML",
            5: "收集: 代币总量、分配方案",
            6: "确认所有信息，请用户审核"
        }
        base_prompt += step_focus.get(current_step, "")

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
