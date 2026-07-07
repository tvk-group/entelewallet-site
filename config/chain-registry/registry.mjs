#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));

const VERIFICATION_KEYS = [
  "rpcVerified",
  "explorerVerified",
  "signingTested",
  "balanceDetectionTested",
  "tokenDetectionTested",
];

const UI_SECTION_ORDER = ["active", "testnet", "tvk-ecosystem", "coming-soon", "experimental"];

export function isFullyVerified(verification) {
  return VERIFICATION_KEYS.every((key) => verification[key] === true);
}

export function canEnableTransactions(chain) {
  if (chain.chainId === null) return false;
  if (!chain.rpcUrls?.length) return false;
  if (!chain.blockExplorerUrls?.length) return false;
  if (chain.status === "planned") return false;
  return isFullyVerified(chain.verification);
}

export function withTransactionGate(chain) {
  return {
    ...chain,
    capabilities: {
      ...chain.capabilities,
      transactions: canEnableTransactions(chain),
    },
  };
}

export function assertActivationRequirements(chain) {
  const errors = [];
  if (chain.chainId === null) errors.push("missing chainId");
  if (!chain.rpcUrls?.length) errors.push("missing RPC URL");
  if (!chain.blockExplorerUrls?.length) errors.push("missing block explorer URL");
  if (!chain.tokenStandards?.length && chain.status !== "planned") {
    errors.push("missing supported token standards");
  }
  return errors;
}

let _chains;
let _modules;

export async function loadChains() {
  if (!_chains) {
    const raw = JSON.parse(await readFile(join(ROOT, "chains.json"), "utf8"));
    _chains = raw.map(withTransactionGate);
  }
  return _chains;
}

export async function loadTvkModules() {
  if (!_modules) {
    _modules = JSON.parse(await readFile(join(ROOT, "tvk-modules.json"), "utf8"));
  }
  return _modules;
}

export async function loadRegistry() {
  const [chains, tvkModules] = await Promise.all([loadChains(), loadTvkModules()]);
  return {
    version: "1.0.0",
    updatedAt: new Date().toISOString().slice(0, 10),
    chains,
    tvkModules,
  };
}

export async function getRegistrySections() {
  const [chains, modules] = await Promise.all([loadChains(), loadTvkModules()]);
  return UI_SECTION_ORDER.map((id) => ({
    id,
    chains: chains.filter((c) => c.uiCategory === id),
    modules: modules.filter((m) => m.uiCategory === id),
  })).filter((s) => s.chains.length > 0 || s.modules.length > 0);
}

export const SECTION_LABELS = {
  active: "networks.sectionActive",
  testnet: "networks.sectionTestnet",
  "tvk-ecosystem": "networks.sectionTvk",
  "coming-soon": "networks.sectionComingSoon",
  experimental: "networks.sectionExperimental",
};

export const STATUS_LABELS = {
  active: "networks.statusActive",
  testnet: "networks.statusTestnet",
  planned: "networks.statusPlanned",
  experimental: "networks.statusExperimental",
};

export const RISK_LABELS = {
  low: "networks.riskLow",
  medium: "networks.riskMedium",
  high: "networks.riskHigh",
  unverified: "networks.riskUnverified",
};
