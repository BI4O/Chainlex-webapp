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
    model=os.getenv("MODEL_NAME"),
    temperature=0.7,
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL"),
)

# Whitepaper steps
WHITEPAPER_STEPS = {
    0: "Executive Summary - Token symbol, contract address, basic project info",
    1: "Issuer & Governance - Corporate structure, core team responsibilities",
    2: "Token Overview & Classification - Token utility, legal classification",
    3: "Legal & Regulatory - Offering routes, KYC/AML compliance",
    4: "Tokenomics - Supply, allocation, unlock schedule, treasury",
    5: "Fundraising & Use of Proceeds - Past rounds, current funding usage",
    6: "Technology & Security - Blockchain & contract info, security audits",
    7: "Listing & Trading - Exchange platforms, trading pairs setup",
    8: "Market Integrity & Disclosure - Insider policy, disclosure requirements",
    9: "Key Risks - Legal, technical, market risk assessment",
    10: "Incident Response & Delisting - Emergency procedures, delisting triggers",
    11: "Declarations & Signatures - Authenticity statements, risk disclosures",
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
    0: """Based on the conversation, generate structured content for the Executive Summary section.
Format your response EXACTLY as follows (use Markdown):

## Executive Summary

- **Project Name**: [Project name]
- **Token Symbol**: [Symbol, e.g. RWA-XXX]
- **Contract Address**: [If provided, else "TBD"]
- **Blockchain**: [Network, e.g. Ethereum / Polygon]
- **Token Standard**: [ERC-20 / ERC-3643 / etc.]
- **Offering Type**: [Security Token / Utility Token / etc.]
- **Brief Description**: [1-2 sentence project description]

Only include information that was actually provided. Use "TBD" for missing fields.""",

    1: """Based on the conversation, generate structured content for the Issuer & Governance section.
Format your response EXACTLY as follows:

## Issuer & Governance

### Issuer Information
- **Legal Entity Name**: [Entity name]
- **Registration Jurisdiction**: [Country/Region]
- **Registration Number**: [If provided]
- **Registered Address**: [If provided]

### Core Team & Responsibilities
[List key team members and their roles if mentioned]

### Governance Structure
[Describe decision-making structure if discussed]

Only include information that was actually provided.""",

    2: """Generate structured content for the Token Overview & Classification section:

## Token Overview & Classification

### Token Utility
[Describe what the token represents and how it is used]

### Legal Classification
- **Classification**: [Security Token / Payment Token / Utility Token]
- **Applicable Standard**: [MAS / SEC / FINMA / etc.]
- **Transferability**: [Restricted / Unrestricted]

### Token Rights
[Describe holder rights: voting, dividends, redemption, etc.]

Only include provided information.""",

    3: """Generate structured content for the Legal & Regulatory section:

## Legal & Regulatory

### Offering Structure
- **Offering Route**: [Private Placement / Public Offering / Regulation D / etc.]
- **Jurisdictions**: [Countries where offering is valid]
- **Exemptions Applied**: [If any regulatory exemptions]

### Investor Eligibility
- **Eligible Investors**: [Accredited / Qualified / Institutional / Retail]
- **Minimum Investment**: [If mentioned]

### KYC/AML Compliance
- **KYC Provider**: [If mentioned]
- **AML Policy**: [Brief description]

### Regulatory Filings
[Any filings or registrations required]

Only include provided information.""",

    4: """Generate structured content for the Tokenomics section:

## Tokenomics

### Token Supply
- **Total Supply**: [Total token amount]
- **Initial Circulating Supply**: [If mentioned]
- **Hard Cap**: [If applicable]

### Allocation
[Token distribution table: Team / Investors / Treasury / Public / etc.]

### Unlock Schedule
[Vesting / lock-up periods if mentioned]

### Treasury Management
[How treasury funds are managed]

Only include provided information.""",

    5: """Generate structured content for the Fundraising & Use of Proceeds section:

## Fundraising & Use of Proceeds

### Funding History
[Past funding rounds, amounts, and investors if mentioned]

### Current Offering
- **Fundraising Target**: [Amount]
- **Token Price**: [If mentioned]
- **Offering Period**: [Dates if mentioned]

### Use of Proceeds
[How raised funds will be allocated — development, operations, reserves, etc.]

Only include provided information.""",

    6: """Generate structured content for the Technology & Security section:

## Technology & Security

### Blockchain Infrastructure
- **Network**: [Blockchain platform]
- **Smart Contract Address**: [If provided]
- **Token Standard**: [ERC-20 / ERC-3643 / ERC-1400]

### Smart Contract Features
[Key contract functions and mechanisms]

### Security Audits
- **Auditor**: [Audit firm if mentioned]
- **Audit Date**: [If mentioned]
- **Audit Report**: [Link or status]

### Custody & Key Management
[How keys and assets are secured]

Only include provided information.""",

    7: """Generate structured content for the Listing & Trading section:

## Listing & Trading

### Exchange Listings
[List of exchanges or platforms where token will be / is listed]

### Trading Pairs
[Token trading pairs, e.g. TOKEN/USDT, TOKEN/ETH]

### Liquidity Provisions
[Market maker arrangements, liquidity pool details if mentioned]

### Transfer Restrictions
[Any lock-up periods post-listing or transfer restrictions for holders]

Only include provided information.""",

    8: """Generate structured content for the Market Integrity & Disclosure section:

## Market Integrity & Disclosure

### Insider Trading Policy
[Rules for team/insider trading, lock-up periods]

### Disclosure Obligations
[Ongoing disclosure requirements: financial reports, material events, etc.]

### Price Manipulation Prevention
[Measures to prevent wash trading or price manipulation]

### Investor Communication
[Channels and frequency of investor updates]

Only include provided information.""",

    9: """Generate structured content for the Key Risks section:

## Key Risks

### Legal & Regulatory Risks
[Regulatory changes, licensing risks, jurisdictional risks]

### Technical Risks
[Smart contract vulnerabilities, network risks, custody risks]

### Market Risks
[Liquidity risk, price volatility, market conditions]

### Operational Risks
[Team, execution, counterparty risks]

### Issuer-Specific Risks
[Risks specific to the underlying asset or business]

Only include provided information. Be concise and factual.""",

    10: """Generate structured content for the Incident Response & Delisting section:

## Incident Response & Delisting

### Incident Response Procedures
- **Security Breach Protocol**: [Steps if contract is compromised]
- **Emergency Pause**: [Whether contract has pause functionality]
- **Communication Plan**: [How incidents are communicated to holders]

### Delisting Triggers
[Conditions that would lead to exchange delisting or offering termination]

### Redemption & Wind-Down
[Procedures for token buyback, redemption, or project wind-down]

Only include provided information.""",

    11: """Generate structured content for the Declarations & Signatures section:

## Declarations & Signatures

### Authenticity Statement
[Statement confirming accuracy of information in the whitepaper]

### Risk Disclosure
[Formal risk disclosure statement: investment involves risk, no guaranteed returns, etc.]

### Regulatory Disclaimer
[Jurisdiction-specific disclaimers, not financial advice, etc.]

### Signatories
[Authorized representatives signing the document — names, titles, date]

Only include provided information. Use formal legal language.""",
}

# Contract step content generation prompts
CONTRACT_CONTENT_PROMPTS = {
    0: """Based on the conversation, generate structured content for the Standard Selection section.
Format your response EXACTLY as follows (use Markdown):

## 合约标准选择

### 选择标准
- **采用标准**: ERC-3643 / ERC-1400
- **选择理由**: [Why this standard is suitable for the asset]

### 标准特性
- **合规支持**: [Compliance features]
- **转账限制**: [Transfer restrictions support]
- **兼容性**: [Compatibility notes]

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the selected standard
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
```

Only include information that was actually provided. Use "待补充" for missing information.""",

    1: """Generate structured Minting Logic section:

## 铸造逻辑

### 铸造权限
- **铸造者**: [Who can mint tokens]
- **铸造上限**: [Maximum mint amount if any]
- **铸造条件**: [Conditions for minting]

### 代码实现

```solidity
// Minting function
function mint(address to, uint256 amount) external onlyMinter {
    require(balanceOf(to) + amount <= maxBalance, "Exceeds max balance");
    _mint(to, amount);
}

// Minting modifiers
modifier onlyMinter() {
    require(isMinter[msg.sender], "Not authorized to mint");
    _;
}
```

Only include provided information.""",

    2: """Generate structured Transfer Rules section:

## 转账规则

### 转账限制
- **白名单要求**: [Whitelist requirement]
- **转账冷却**: [Transfer cooldown if any]
- **单笔限额**: [Per-transfer limits]

### 代码实现

```solidity
// Transfer function with whitelist check
function transfer(address to, uint256 amount) public override returns (bool) {
    require(whitelist[to], "Recipient not whitelisted");
    require(block.timestamp >= lastTransferTime[msg.sender] + cooldownPeriod, "Transfer cooldown");
    return super.transfer(to, amount);
}

// Whitelist management
mapping(address => bool) public whitelist;

function addToWhitelist(address account) external onlyAdmin {
    whitelist[account] = true;
}
```

Only include provided information.""",

    3: """Generate structured Compliance Integration section:

## 合规集成

### Enforcer 集成
- **KYC验证**: [KYC verification process]
- **AML检查**: [AML check requirements]
- **投资者资格**: [Qualified investor requirements]

### 代码实现

```solidity
// Compliance interface
interface ICompliance {
    function canTransfer(address from, address to, uint256 amount) external view returns (bool);
}

// Compliance check in transfer
function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
    require(compliance.canTransfer(from, to, amount), "Compliance check failed");
}

// Compliance contract address
ICompliance public compliance;
```

Only include provided information.""",

    4: """Generate structured Oracle Integration section:

## Oracle 集成

### 数据源配置
- **估值Oracle**: [Valuation oracle address]
- **价格Oracle**: [Price feed oracle]
- **更新频率**: [Update frequency]

### 代码实现

```solidity
// Oracle interface
interface IOracle {
    function getAssetValue() external view returns (uint256);
    function getLastUpdateTime() external view returns (uint256);
}

// Oracle integration
IOracle public valuationOracle;

function get NAV() public view returns (uint256) {
    return valuationOracle.getAssetValue();
}

// Oracle update function
function updateOracle() external {
    // Oracle update logic
}
```

Only include provided information.""",

    5: """Generate structured Testing section:

## 合约测试

### 测试覆盖
- **单元测试**: [Unit test coverage]
- **集成测试**: [Integration tests]
- **安全审计**: [Security audit status]

### 测试代码

```solidity
// Test cases (Foundry format)
// function testMint() public {
//     vm.prank(minter);
//     token.mint(user, 1000 * 10**decimals());
//     assertEq(token.balanceOf(user), 1000 * 10**decimals());
// }

// function testTransferWhitelist() public {
//     vm.prank(admin);
//     token.addToWhitelist(recipient);
//     vm.prank(user);
//     token.transfer(recipient, 100 * 10**decimals());
//     assertEq(token.balanceOf(recipient), 100 * 10**decimals());
// }
```

Only include provided information.""",

    6: """Generate Final Review for contract combining all completed sections.
Create a comprehensive summary of the entire smart contract design."""
}

TITLE_GENERATION_PROMPT = """Based on the conversation, generate a concise, professional title for this RWA tokenization project.

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
        # Get the content prompt for this step based on phase
        if phase == "whitepaper" and step in STEP_CONTENT_PROMPTS:
            content_prompt = STEP_CONTENT_PROMPTS[step]
        elif phase == "contract" and step in CONTRACT_CONTENT_PROMPTS:
            content_prompt = CONTRACT_CONTENT_PROMPTS[step]
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

    total_steps = len(WHITEPAPER_STEPS) if phase == "whitepaper" else len(CONTRACT_STEPS)

    base_prompt = f"""
You are Lexstudio Build Mode AI. Guide users through RWA whitepaper creation.

**Current**: Step {current_step + 1}/{total_steps} - {current_step_name}

## CRITICAL: Language Rule
**Always respond to the user in the SAME language they use (Chinese/English).**
However, when generating whitepaper content, use professional English for international standards.
- Conversation: Match user's language
- Generated documents: English

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
            0: "Collect: token symbol, contract address, blockchain network, brief project description",
            1: "Collect: legal entity name, registration jurisdiction, core team roles and responsibilities",
            2: "Collect: token utility, legal classification (security/utility/payment), holder rights",
            3: "Collect: offering route, eligible investor types, KYC/AML provider, applicable regulations",
            4: "Collect: total supply, allocation breakdown, vesting/unlock schedule, treasury management",
            5: "Collect: past funding rounds, current fundraising target, token price, use of proceeds breakdown",
            6: "Collect: blockchain network, smart contract standard, security audit firm and status",
            7: "Collect: exchange listing plans, trading pairs, liquidity provisions, post-listing transfer restrictions",
            8: "Collect: insider trading policy, ongoing disclosure obligations, investor communication channels",
            9: "Collect: legal risks, technical risks, market risks, operational and issuer-specific risks",
            10: "Collect: incident response procedures, emergency pause capability, delisting triggers, wind-down process",
            11: "Confirm all information is accurate; collect authorized signatories and finalize risk disclaimers",
        }
        base_prompt += step_focus.get(current_step, "")
    else:  # contract phase
        step_focus = {
            0: "收集: 合约标准选择 (ERC-3643/ERC-1400)、选择理由",
            1: "收集: 铸造权限、铸造上限、铸造条件",
            2: "收集: 白名单要求、转账限制、单笔限额",
            3: "收集: KYC/AML要求、合规检查集成",
            4: "收集: Oracle数据源、更新频率",
            5: "确认测试计划、安全审计安排",
            6: "确认合约设计，请用户审核"
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
