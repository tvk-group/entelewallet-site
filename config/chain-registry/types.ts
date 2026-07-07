export type ChainStatus = "active" | "testnet" | "planned" | "experimental";

export type UiCategory =
  | "active"
  | "testnet"
  | "tvk-ecosystem"
  | "coming-soon"
  | "experimental";

export type RiskFlag = "low" | "medium" | "high" | "unverified";

export type TokenStandard = "native" | "ERC-20" | "ERC-721" | "ERC-1155";

export type ChainVerification = {
  rpcVerified: boolean;
  explorerVerified: boolean;
  signingTested: boolean;
  balanceDetectionTested: boolean;
  tokenDetectionTested: boolean;
};

export type ChainCapabilities = {
  watchOnly: boolean;
  walletConnect: boolean;
  /** Real transactions — only true when every verification gate passes */
  transactions: boolean;
};

export type ChainDefinition = {
  id: string;
  chainId: number | null;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  icon: string;
  status: ChainStatus;
  uiCategory: UiCategory;
  tokenStandards: TokenStandard[];
  riskFlag: RiskFlag;
  capabilities: ChainCapabilities;
  verification: ChainVerification;
  notes?: string;
};

export type TvkModuleType = "ecosystem-module" | "chain-integration";

export type TvkModule = {
  id: string;
  name: string;
  type: TvkModuleType;
  description: string;
  status: ChainStatus;
  uiCategory: "tvk-ecosystem";
  icon: string;
  supportedChains: string[];
  riskFlag: RiskFlag;
  capabilities: ChainCapabilities;
  notes?: string;
};

export type ChainRegistry = {
  version: string;
  updatedAt: string;
  chains: ChainDefinition[];
  tvkModules: TvkModule[];
};

export type RegistrySection = {
  id: UiCategory;
  title: string;
  items: Array<ChainDefinition | TvkModule>;
};
