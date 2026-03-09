import { Session, Message, AssetData } from './types';

// Mock chat messages for Money Market Fund RWA example
const mockMessages: Message[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: '我想代币化一个货币市场基金，用于链上流动性管理',
    timestamp: Date.now() - 100000,
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: `很好的想法！货币市场基金是 RWA 代币化的理想标的，因为它们具有稳定的净值和良好的流动性。

让我帮您开始这个流程。首先，请告诉我您要代币化的货币基金的基本信息：

1. **基金名称**：请提供完整的法定名称
2. **基金管理人**：负责管理该基金的机构
3. **基金规模**：当前资产管理规模（AUM）
4. **投资标的**：主要投资于哪些资产类别？（如银行存款、国债、央行票据等）

您可以简要描述，我会帮您整理成结构化的资产档案。`,
    timestamp: Date.now() - 99000,
  },
  {
    id: 'msg-3',
    role: 'user',
    content: '华夏现金增利货币基金，华夏基金管理，规模10亿人民币，主要投资银行存款、国债和央行票据',
    timestamp: Date.now() - 98000,
  },
  {
    id: 'msg-4',
    role: 'assistant',
    content: `已记录您的资产信息：

**资产概要**
- 名称：华夏现金增利货币基金
- 管理人：华夏基金管理有限公司
- 规模：¥1,000,000,000 (10亿 CNY)
- 类型：货币市场基金
- 投资标的：银行存款、国债、央行票据

接下来，我们需要确定代币的法律结构。请问您计划采用哪种发行架构？

1. **Singapore VCC** - 新加坡可变资本公司架构，适合亚洲市场
2. **BVI BC** - 英属维尔京群岛商业公司，设立速度快
3. **Cayman SPC** - 开曼群岛独立投资组合公司，适合多资产发行
4. **Switzerland SPV** - 瑞士特殊目的载体，适合欧洲市场
5. **Custom** - 自定义架构（请说明）`,
    timestamp: Date.now() - 97000,
  },
  {
    id: 'msg-5',
    role: 'user',
    content: '我选择 Singapore VCC 架构',
    timestamp: Date.now() - 96000,
  },
  {
    id: 'msg-6',
    role: 'assistant',
    content: `很好！Singapore VCC 是亚洲 RWA 代币化的热门选择，具有以下优势：
- 灵活的资本结构
- 良好的监管环境
- 税务效率

现在让我们讨论代币经济模型。对于货币市场基金，通常采用 **1:1 净值锚定** 的模式：

**代币参数建议**
- 代币符号：HXCASH（华夏现金）
- 初始供应量：1,000,000,000 tokens
- 每份净值：¥1.00 CNY
- 年化收益：约 2.5%（每日复利）

您希望代币持有者如何获得收益？
1. **每日自动复投** - 收益自动增加持币数量
2. **每周分红** - 每周结算并发放收益
3. **净值增值** - 代币净值随收益增长
4. **自定义** - 请描述您的偏好`,
    timestamp: Date.now() - 95000,
  },
  {
    id: 'msg-7',
    role: 'user',
    content: '采用净值增值模式，代币净值随收益增长',
    timestamp: Date.now() - 94000,
  },
  {
    id: 'msg-8',
    role: 'assistant',
    content: `已确认净值增值模式。接下来是法律合规路径：

**建议双辖区合规方案**

| 管辖区 | 角色 | 监管要求 |
|--------|------|----------|
| 🇸🇬 新加坡 | 发行主体 | MAS 数字代币发行指南 |
| 🇭🇰 香港 | 销售市场 | SFC 虚拟资产交易平台牌照 |

**KYC/AML 提供商选择**
1. Onfido - 全球覆盖，API 友好
2. Jumio - 银行级合规
3. Veriff - 快速验证
4. Sumsub - 综合合规平台

请选择您的 KYC 提供商：`,
    timestamp: Date.now() - 93000,
  },
  {
    id: 'msg-9',
    role: 'user',
    content: '选择 Onfido 作为 KYC 提供商，确认香港+新加坡双辖区',
    timestamp: Date.now() - 92000,
  },
  {
    id: 'msg-10',
    role: 'assistant',
    content: `合规方案已确认！现在让我总结您的 RWA 代币化项目：

---

## 📋 项目摘要

### 资产信息
- **名称**：华夏现金增利货币基金 Token
- **类型**：货币市场基金 (Money Market Fund)
- **规模**：¥1,000,000,000 (10亿 CNY)
- **年化收益**：2.5%

### 代币参数
- **符号**：HXCASH
- **供应量**：1,000,000,000 tokens
- **净值锚定**：¥1.00/token（动态增值）
- **收益模式**：净值增值

### 法律架构
- **发行结构**：Singapore VCC
- **管辖区**：新加坡 + 香港
- **发行路径**：私募 (Private Placement)
- **KYC/AML**：Onfido

### 技术方案
- **区块链**：Ethereum Mainnet
- **标准**：ERC-3643 (T-REX)
- **审计机构**：Trail of Bits

---

我已为您生成完整的白皮书、智能合约和技术架构图。您可以切换到 **Build 模式** 查看所有文档。

是否需要我对任何部分进行调整？`,
    timestamp: Date.now() - 91000,
  },
  {
    id: 'msg-11',
    role: 'user',
    content: '看起来很完善，请生成最终文档',
    timestamp: Date.now() - 90000,
  },
  {
    id: 'msg-12',
    role: 'assistant',
    content: `✅ 所有文档已生成完成！

**已生成的文档：**
- 📄 白皮书 (Whitepaper) - 包含执行摘要、资产概述、代币经济模型、法律合规等章节
- ⚙️ 智能合约 (Smart Contract) - 基于 ERC-3643 标准的完整 Solidity 代码
- 🏗️ 架构图 (Architecture) - 系统架构 Mermaid 流程图

您可以随时在 Build 模式中查看和下载这些文档。如需修改任何内容，请直接告诉我！

祝您的 RWA 代币化项目顺利进行！🚀`,
    timestamp: Date.now() - 89000,
  },
];

// Mock asset data for Money Market Fund
const mockAssetData: AssetData = {
  name: '华夏现金增利货币基金 Token',
  type: 'Money Market Fund',
  description: '华夏货币市场基金 - 低风险流动性管理工具，主要投资于银行存款、国债及央行票据',
  valuation: 1000000000,
  yieldRate: 2.5,
  totalSupply: 1000000000,
  navPerToken: 1.0,
  tokenSymbol: 'HXCASH',
  issuerLegalName: '华夏基金管理有限公司',
  legalStructure: 'Singapore VCC',
  jurisdictions: ['SG', 'HK'],
  offeringRoute: 'Private Placement',
  kycProvider: 'Onfido',
  deployNetwork: 'Ethereum Mainnet',
  auditFirm: 'Trail of Bits',
  multisigConfig: '3-of-5 Gnosis Safe',
  upgradeStrategy: 'UUPS Proxy',
  complianceStatus: 'Pending Review',
  onboardingCompleted: true,
};

// Mock whitepaper content (Chinese)
const mockWhitepaperContent = `# 华夏现金增利货币基金 Token 白皮书

## 执行摘要

华夏现金增利货币基金 Token（HXCASH）是一种基于区块链技术的货币市场基金代币化产品，旨在为投资者提供安全、透明、高效的链上流动性管理工具。本产品采用新加坡可变资本公司（VCC）架构，在香港和新加坡双辖区合规运营，通过 ERC-3643 标准实现链上资产表示。

**核心优势：**
- 稳定净值：每份代币初始净值 ¥1.00 CNY，每日动态增值
- 高流动性：T+0 申购赎回，链上 24/7 交易
- 合规透明：双辖区监管，链上实时审计
- 低风险投资：主要配置银行存款、国债等优质资产

---

## 第一章 项目概述

### 1.1 背景与愿景

传统货币市场基金作为现金管理工具，具有低风险、高流动性的特点，是机构和个人投资者进行短期资金配置的重要选择。然而，传统基金产品存在以下痛点：

1. **结算效率低**：申购赎回通常需要 T+1 至 T+2 工作日
2. **透明度不足**：投资者难以实时了解资产配置情况
3. **跨境投资障碍**：受限于不同司法管辖区的监管要求
4. **运营成本高**：中介机构多，管理费用较高

通过区块链技术代币化，我们可以：
- 实现 24/7 全球交易
- 提供实时透明的资产证明
- 降低跨境投资门槛
- 减少中介成本，提高收益

### 1.2 产品定位

HXCASH 定位为机构级链上现金管理工具，目标客户包括：
- 加密货币机构投资者
- DeFi 协议财库管理
- 跨境企业现金管理
- 家族办公室资产配置

---

## 第二章 资产概述

### 2.1 基础资产

华夏现金增利货币基金是华夏基金管理有限公司发行的货币市场基金产品，主要投资于以下资产类别：

| 资产类别 | 配置比例 | 信用评级 |
|----------|----------|----------|
| 银行存款 | 40-60% | AAA |
| 国债 | 20-40% | AAA |
| 央行票据 | 10-30% | AAA |
| 同业存单 | 0-20% | AA+ |

### 2.2 风险收益特征

- **预期年化收益**：2.0% - 3.0%
- **波动率**：< 0.5%
- **最大回撤**：< 0.1%
- **夏普比率**：> 4.0

### 2.3 净值计算

基金净值采用摊余成本法计算，每日计提收益。代币净值与基金净值保持 1:1 锚定，通过 Chainlink 预言机实时更新链上净值数据。

---

## 第三章 代币经济模型

### 3.1 代币参数

| 参数 | 数值 |
|------|------|
| 代币符号 | HXCASH |
| 代币名称 | Huaxia Cash Token |
| 初始供应量 | 1,000,000,000 |
| 代币精度 | 18 decimals |
| 初始净值 | ¥1.00 CNY |
| 管理费 | 0.15%/年 |

### 3.2 收益分配机制

采用 **净值增值模式**：
- 每日收益自动计入代币净值
- 投资者无需主动领取收益
- 净值增长即代表收益实现

**示例**：
- 初始投资：100,000 HXCASH @ ¥1.00 = ¥100,000
- 一年后净值：¥1.025
- 投资价值：100,000 × ¥1.025 = ¥102,500
- 年化收益：2.5%

### 3.3 申购与赎回

**申购流程**：
1. 完成 KYC/AML 认证
2. 法币入金至托管账户
3. 系统按当日净值铸造代币
4. 代币发放至投资者钱包

**赎回流程**：
1. 提交赎回申请
2. 系统按当日净值计算金额
3. 代币销毁
4. 法币划转至投资者银行账户

---

## 第四章 法律与合规

### 4.1 发行架构

采用 **新加坡可变资本公司（VCC）** 架构：

\`\`\`
投资者
    ↓
KYC/AML (Onfido)
    ↓
VCC 子基金
    ↓
Token Agent
    ↓
HXCASH Token (ERC-3643)
\`\`\`

### 4.2 监管合规

| 管辖区 | 监管机构 | 合规要求 |
|--------|----------|----------|
| 新加坡 | MAS | 数字代币发行指南、证券与期货法 |
| 香港 | SFC | 虚拟资产交易平台牌照、专业投资者规定 |

### 4.3 投资者适当性

本产品面向 **专业投资者** 发售：
- 机构投资者：资产管理规模 > USD 10M
- 个人投资者：金融资产 > USD 1M 或年收入 > USD 200K

### 4.4 KYC/AML

由 Onfido 提供身份验证服务，包括：
- 身份证件验证
- 活体检测
- 制裁名单筛查
- 政治敏感人物（PEP）筛查

---

## 第五章 技术架构

### 5.1 区块链选择

**主网**：Ethereum Mainnet
- 安全性高，去中心化程度高
- 丰富的 DeFi 生态系统
- 完善的合规工具支持

**未来扩展**：Layer 2（Arbitrum、Optimism）

### 5.2 智能合约标准

采用 **ERC-3643 (T-REX)** 标准：
- 内置 KYC/AML 合规检查
- 可转移限制
- 冻结/解冻功能
- 身份注册表集成

### 5.3 预言机集成

**Chainlink** 提供以下数据：
- 每日净值更新
- 汇率数据
- 市场数据

### 5.4 安全审计

智能合约由 **Trail of Bits** 进行安全审计，审计范围包括：
- 逻辑漏洞
- 重入攻击
- 权限控制
- 经济模型风险

---

## 第六章 风险披露

### 6.1 市场风险

- 利率波动可能影响基金收益
- 汇率波动可能影响代币净值
- 流动性风险可能影响赎回

### 6.2 技术风险

- 智能合约可能存在漏洞
- 区块链网络可能发生拥堵
- 预言机数据可能出现偏差

### 6.3 监管风险

- 数字资产监管政策可能变化
- 跨境监管要求可能调整
- 税务政策可能变化

### 6.4 运营风险

- 托管机构可能面临风险
- 服务提供商可能违约
- 系统可能出现技术故障

---

## 第七章 团队与合作伙伴

### 7.1 核心团队

- **基金管理人**：华夏基金管理有限公司
- **技术提供商**：ChainLex Protocol
- **法律顾问**：Allen & Overy
- **审计机构**：Trail of Bits

### 7.2 合作伙伴

- **托管银行**：星展银行（DBS）
- **KYC 提供商**：Onfido
- **预言机**：Chainlink Labs

---

## 附录

### A. 术语表

| 术语 | 定义 |
|------|------|
| VCC | 可变资本公司（Variable Capital Company） |
| ERC-3643 | 以太坊合规代币标准 |
| KYC | 了解你的客户（Know Your Customer） |
| AML | 反洗钱（Anti-Money Laundering） |
| NAV | 净资产价值（Net Asset Value） |

### B. 联系方式

- **官方网站**：https://chainlex.ai
- **邮箱**：info@chainlex.ai
- **Twitter**：@ChainLexProtocol

---

*本白皮书仅供参考，不构成投资建议。投资者应独立进行尽职调查，并咨询专业顾问。*
`;

// Mock contract content (Solidity - ERC-3643)
const mockContractContent = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title HuaxiaCashToken
 * @author ChainLex Protocol
 * @notice ERC-3643 compliant Money Market Fund Token
 * @dev Implements T-REX standard with NAV oracle integration
 */
contract HuaxiaCashToken is
    ERC20Upgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    PausableUpgradeable
{
    // ============ Roles ============
    bytes32 public constant TOKEN_AGENT_ROLE = keccak256("TOKEN_AGENT_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    // ============ State Variables ============

    /// @notice Identity Registry contract for KYC/AML
    IIdentityRegistry public identityRegistry;

    /// @notice Compliance module
    ICompliance public compliance;

    /// @notice NAV oracle (Chainlink)
    AggregatorV3Interface public navOracle;

    /// @notice Current NAV per token (in 18 decimals)
    uint256 public currentNAV;

    /// @notice Last NAV update timestamp
    uint256 public lastNAVUpdate;

    /// @notice Minimum time between NAV updates
    uint256 public constant MIN_NAV_UPDATE_INTERVAL = 1 hours;

    /// @notice Token frozen status mapping
    mapping(address => bool) private _frozen;

    /// @notice Address frozen events
    event AddressFrozen(address indexed account, bool frozen, address indexed operator);
    event NAVUpdated(uint256 newNAV, uint256 timestamp);
    event Minted(address indexed to, uint256 amount, uint256 nav);
    event Burned(address indexed from, uint256 amount, uint256 nav);

    // ============ Errors ============
    error AddressFrozenError(address account);
    error NotKYCed(address account);
    error TransferNotAllowed(address from, address to);
    error InvalidNAV();
    error UpdateTooFrequent();

    // ============ Initializer ============

    /// @notice Initialize the token (proxy pattern)
    /// @param admin Admin address
    /// @param identityRegistry_ Identity registry contract
    /// @param compliance_ Compliance contract
    /// @param navOracle_ Chainlink NAV oracle
    function initialize(
        address admin,
        address identityRegistry_,
        address compliance_,
        address navOracle_
    ) public initializer {
        __ERC20_init("Huaxia Cash Token", "HXCASH");
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __PausableUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(TOKEN_AGENT_ROLE, admin);
        _grantRole(COMPLIANCE_ROLE, admin);
        _grantRole(ORACLE_ROLE, admin);

        identityRegistry = IIdentityRegistry(identityRegistry_);
        compliance = ICompliance(compliance_);
        navOracle = AggregatorV3Interface(navOracle_);

        currentNAV = 1e18; // Initial NAV: 1.00
        lastNAVUpdate = block.timestamp;
    }

    // ============ NAV Functions ============

    /// @notice Update NAV from oracle
    /// @dev Only callable by ORACLE_ROLE
    function updateNAV() external onlyRole(ORACLE_ROLE) {
        if (block.timestamp < lastNAVUpdate + MIN_NAV_UPDATE_INTERVAL) {
            revert UpdateTooFrequent();
        }

        (
            /* uint80 roundID */,
            int256 price,
            /* uint startedAt */,
            /* uint timeStamp */,
            /* uint80 answeredInRound */
        ) = navOracle.latestRoundData();

        if (price <= 0) revert InvalidNAV();

        currentNAV = uint256(price);
        lastNAVUpdate = block.timestamp;

        emit NAVUpdated(currentNAV, block.timestamp);
    }

    /// @notice Get current NAV per token
    /// @return NAV in 18 decimals
    function getNAV() external view returns (uint256) {
        return currentNAV;
    }

    /// @notice Get token value in CNY
    /// @param amount Token amount
    /// @return Value in CNY (18 decimals)
    function getValueInCNY(uint256 amount) external view returns (uint256) {
        return (amount * currentNAV) / 1e18;
    }

    // ============ Mint/Burn Functions ============

    /// @notice Mint tokens (only for verified addresses)
    /// @param to Recipient address
    /// @param amount Amount to mint
    function mint(address to, uint256 amount) external onlyRole(TOKEN_AGENT_ROLE) {
        if (!identityRegistry.isVerified(to)) revert NotKYCed(to);
        if (_frozen[to]) revert AddressFrozenError(to);

        _mint(to, amount);
        emit Minted(to, amount, currentNAV);
    }

    /// @notice Burn tokens
    /// @param from Address to burn from
    /// @param amount Amount to burn
    function burn(address from, uint256 amount) external onlyRole(TOKEN_AGENT_ROLE) {
        _burn(from, amount);
        emit Burned(from, amount, currentNAV);
    }

    // ============ Transfer Override ============

    /// @notice Override transfer with compliance checks
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPaused {
        // Skip checks for mint/burn
        if (from == address(0) || to == address(0)) {
            super._beforeTokenTransfer(from, to, amount);
            return;
        }

        // Check KYC status
        if (!identityRegistry.isVerified(from)) revert NotKYCed(from);
        if (!identityRegistry.isVerified(to)) revert NotKYCed(to);

        // Check frozen status
        if (_frozen[from]) revert AddressFrozenError(from);
        if (_frozen[to]) revert AddressFrozenError(to);

        // Check compliance rules
        if (!compliance.canTransfer(from, to, amount)) {
            revert TransferNotAllowed(from, to);
        }

        super._beforeTokenTransfer(from, to, amount);
    }

    // ============ Freeze Functions ============

    /// @notice Freeze an address
    /// @param account Address to freeze
    /// @param freeze Freeze status
    function setFreeze(address account, bool freeze)
        external
        onlyRole(COMPLIANCE_ROLE)
    {
        _frozen[account] = freeze;
        emit AddressFrozen(account, freeze, _msgSender());
    }

    /// @notice Check if address is frozen
    /// @param account Address to check
    /// @return Frozen status
    function isFrozen(address account) external view returns (bool) {
        return _frozen[account];
    }

    // ============ Pause Functions ============

    /// @notice Pause all transfers
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpause all transfers
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // ============ Upgrade Function ============

    /// @notice Authorize upgrade (UUPS)
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {}

    // ============ View Functions ============

    /// @notice Get token info
    function getTokenInfo() external view returns (
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 totalSupply_,
        uint256 nav_,
        uint256 lastUpdate_
    ) {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            currentNAV,
            lastNAVUpdate
        );
    }
}

// ============ Interfaces ============

/**
 * @title IIdentityRegistry
 * @notice Interface for KYC/AML identity registry
 */
interface IIdentityRegistry {
    function isVerified(address account) external view returns (bool);
    function addIdentity(address account, bytes calldata identity) external;
    function removeIdentity(address account) external;
}

/**
 * @title ICompliance
 * @notice Interface for compliance module
 */
interface ICompliance {
    function canTransfer(
        address from,
        address to,
        uint256 amount
    ) external view returns (bool);

    function transferred(
        address from,
        address to,
        uint256 amount
    ) external;

    function created(address to, uint256 amount) external;
    function destroyed(address from, uint256 amount) external;
}
`;

// Mock architecture diagram (Mermaid)
const mockArchMapContent = `graph TB
    subgraph Investors["👥 投资者"]
        I1[机构投资者]
        I2[DeFi 协议]
        I3[个人投资者]
    end

    subgraph KYC["🔐 身份验证层"]
        ONF[Onfido<br/>KYC/AML]
        IDREG[Identity Registry<br/>身份注册表]
    end

    subgraph Compliance["⚖️ 合规层"]
        COMP[Compliance Module<br/>合规模块]
        FREEZE[Freeze Control<br/>冻结控制]
    end

    subgraph TokenLayer["🪙 代币层"]
        HXCASH[HXCASH Token<br/>ERC-3643]
        NAV[NAV Oracle<br/>Chainlink]
    end

    subgraph Operations["🏢 运营层"]
        AGENT[Token Agent<br/>代币代理]
        MANAGER[Fund Manager<br/>基金管理人]
    end

    subgraph Assets["💰 底层资产"]
        DEPOSIT[银行存款<br/>40-60%]
        GOV[国债<br/>20-40%]
        CB[央行票据<br/>10-30%]
    end

    subgraph Custody["🏦 托管层"]
        CUSTODY[DBS Custody<br/>星展银行托管]
        BANK[Bank Accounts<br/>银行账户]
    end

    %% Investor flows
    I1 -->|注册| ONF
    I2 -->|注册| ONF
    I3 -->|注册| ONF
    ONF -->|验证| IDREG
    IDREG -->|授权| HXCASH

    %% Compliance flows
    IDREG --> COMP
    COMP --> FREEZE
    FREEZE --> HXCASH

    %% Token operations
    AGENT -->|Mint/Burn| HXCASH
    NAV -->|每日净值| HXCASH
    HXCASH -->|转账检查| COMP

    %% Fund operations
    MANAGER -->|资产配置| DEPOSIT
    MANAGER -->|资产配置| GOV
    MANAGER -->|资产配置| CB

    %% Custody
    DEPOSIT --> CUSTODY
    GOV --> CUSTODY
    CB --> CUSTODY
    CUSTODY --> BANK

    %% Redemptions
    HXCASH -->|赎回| AGENT
    AGENT -->|法币划转| BANK
    BANK -->|出金| I1

    classDef investor fill:#e1f5fe,stroke:#01579b
    classDef kyc fill:#fff3e0,stroke:#e65100
    classDef compliance fill:#fce4ec,stroke:#880e4f
    classDef token fill:#e8f5e9,stroke:#1b5e20
    classDef ops fill:#f3e5f5,stroke:#4a148c
    classDef asset fill:#fff8e1,stroke:#f57f17
    classDef custody fill:#eceff1,stroke:#37474f

    class I1,I2,I3 investor
    class ONF,IDREG kyc
    class COMP,FREEZE compliance
    class HXCASH,NAV token
    class AGENT,MANAGER ops
    class DEPOSIT,GOV,CB asset
    class CUSTODY,BANK custody
`;

// Factory function to create example session
export function createExampleSession(): Session {
  return {
    id: 'example-session',
    title: '📋 示例: 货币基金 RWA',
    mode: 'build',
    messages: mockMessages,
    createdAt: Date.now() - 86400000, // 1 day ago
    updatedAt: Date.now() - 3600000,  // 1 hour ago
    assetData: mockAssetData,
    whitepaperContent: mockWhitepaperContent,
    contractContent: mockContractContent,
    archMapContent: mockArchMapContent,
    currentStep: 9, // Final Review (all steps completed)
    completedSteps: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    phase: 'unified',
    isExample: true,
  };
}

// Check if example session exists in sessions array
export function hasExampleSession(sessions: Session[]): boolean {
  return sessions.some(s => s.id === 'example-session');
}
