import chainsData from "./chains.json" with { type: "json" };
import tvkModulesData from "./tvk-modules.json" with { type: "json" };
import type {
  ChainDefinition,
  ChainRegistry,
  ChainStatus,
  TvkModule,
  UiCategory,
} from "./types.ts";
import { withTransactionGate } from "./verification.ts";

const UI_SECTION_ORDER: UiCategory[] = [
  "active",
  "testnet",
  "tvk-ecosystem",
  "coming-soon",
  "experimental",
];

export function loadChains(): ChainDefinition[] {
  return (chainsData as ChainDefinition[]).map(withTransactionGate);
}

export function loadTvkModules(): TvkModule[] {
  return tvkModulesData as TvkModule[];
}

export function loadRegistry(): ChainRegistry {
  return {
    version: "1.0.0",
    updatedAt: new Date().toISOString().slice(0, 10),
    chains: loadChains(),
    tvkModules: loadTvkModules(),
  };
}

export function getChainById(id: string): ChainDefinition | undefined {
  return loadChains().find((c) => c.id === id);
}

export function getChainsByStatus(status: ChainStatus): ChainDefinition[] {
  return loadChains().filter((c) => c.status === status);
}

export function getChainsByUiCategory(category: UiCategory): ChainDefinition[] {
  return loadChains().filter((c) => c.uiCategory === category);
}

export function getActiveMainnets(): ChainDefinition[] {
  return loadChains().filter((c) => c.status === "active");
}

export function getTestnets(): ChainDefinition[] {
  return loadChains().filter((c) => c.status === "testnet");
}

export function getRegistrySections(): Array<{
  id: UiCategory;
  chains: ChainDefinition[];
  modules: TvkModule[];
}> {
  const chains = loadChains();
  const modules = loadTvkModules();

  return UI_SECTION_ORDER.map((id) => ({
    id,
    chains: chains.filter((c) => c.uiCategory === id),
    modules: modules.filter((m) => m.uiCategory === id),
  })).filter((section) => section.chains.length > 0 || section.modules.length > 0);
}

export function getWalletConnectChains(): ChainDefinition[] {
  return loadChains().filter(
    (c) => c.capabilities.walletConnect && c.chainId !== null && c.rpcUrls.length > 0,
  );
}

export function getWatchOnlyChains(): ChainDefinition[] {
  return loadChains().filter((c) => c.capabilities.watchOnly);
}
