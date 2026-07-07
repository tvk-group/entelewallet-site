#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadChains, loadTvkModules, assertActivationRequirements } from "../config/chain-registry/registry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const REQUIRED_CHAIN_FIELDS = [
  "id",
  "name",
  "shortName",
  "nativeCurrency",
  "rpcUrls",
  "blockExplorerUrls",
  "icon",
  "status",
  "uiCategory",
  "tokenStandards",
  "riskFlag",
  "capabilities",
  "verification",
];

const VALID_STATUS = new Set(["active", "testnet", "planned", "experimental"]);
const VALID_UI = new Set(["active", "testnet", "tvk-ecosystem", "coming-soon", "experimental"]);
const VALID_RISK = new Set(["low", "medium", "high", "unverified"]);
const PHASE1_IDS = new Set([
  "ethereum",
  "base",
  "polygon",
  "bnb",
  "arbitrum",
  "optimism",
  "avalanche",
  "sepolia",
  "base-sepolia",
]);

function validateChain(chain, errors) {
  for (const field of REQUIRED_CHAIN_FIELDS) {
    if (!(field in chain)) errors.push(`[${chain.id || "?"}] missing field: ${field}`);
  }
  if (!VALID_STATUS.has(chain.status)) errors.push(`[${chain.id}] invalid status: ${chain.status}`);
  if (!VALID_UI.has(chain.uiCategory)) errors.push(`[${chain.id}] invalid uiCategory: ${chain.uiCategory}`);
  if (!VALID_RISK.has(chain.riskFlag)) errors.push(`[${chain.id}] invalid riskFlag: ${chain.riskFlag}`);
  if (chain.capabilities?.transactions && !chain.verification) {
    errors.push(`[${chain.id}] transactions enabled without verification object`);
  }
  const activationErrors = assertActivationRequirements(chain);
  if (chain.status === "active" && activationErrors.length) {
    errors.push(`[${chain.id}] active chain has activation errors: ${activationErrors.join(", ")}`);
  }
  if (chain.status === "planned" && chain.capabilities?.transactions) {
    errors.push(`[${chain.id}] planned chain cannot have transactions enabled`);
  }
}

async function main() {
  const chains = await loadChains();
  const modules = await loadTvkModules();
  const errors = [];

  const ids = new Set();
  const chainIds = new Set();
  for (const chain of chains) {
    validateChain(chain, errors);
    if (ids.has(chain.id)) errors.push(`duplicate chain id: ${chain.id}`);
    ids.add(chain.id);
    if (chain.chainId !== null) {
      if (chainIds.has(chain.chainId)) errors.push(`duplicate chainId: ${chain.chainId}`);
      chainIds.add(chain.chainId);
    }
    if (chain.capabilities.transactions) {
      errors.push(`[${chain.id}] transactions must not be hard-enabled in registry — use verification gates`);
    }
  }

  for (const id of PHASE1_IDS) {
    if (!ids.has(id)) errors.push(`Phase 1 chain missing: ${id}`);
  }

  const blockdag = chains.find((c) => c.id === "blockdag");
  if (!blockdag) {
    errors.push("BlockDAG entry missing");
  } else {
    if (blockdag.chainId !== 1404) errors.push("BlockDAG chainId must be 1404");
    if (!blockdag.rpcUrls.includes("https://rpc.bdagscan.com/")) {
      errors.push("BlockDAG must use official RPC https://rpc.bdagscan.com/");
    }
    if (!blockdag.blockExplorerUrls.includes("https://bdagscan.com/")) {
      errors.push("BlockDAG must use official explorer https://bdagscan.com/");
    }
    if (!blockdag.capabilities.watchOnly) errors.push("BlockDAG must be watch-only until verification passes");
    if (blockdag.capabilities.transactions) {
      errors.push("BlockDAG transactions must remain gated until verification passes");
    }
  }

  const moduleIds = new Set();
  for (const mod of modules) {
    if (moduleIds.has(mod.id)) errors.push(`duplicate module id: ${mod.id}`);
    moduleIds.add(mod.id);
    if (mod.uiCategory !== "tvk-ecosystem") errors.push(`[${mod.id}] TVK modules must use tvk-ecosystem category`);
    if (mod.capabilities?.transactions) errors.push(`[${mod.id}] TVK modules cannot enable transactions in registry`);
  }

  const requiredModules = ["entelekron", "sovra", "energiemind", "entelescan", "enteleledger"];
  for (const id of requiredModules) {
    if (!moduleIds.has(id)) errors.push(`Required TVK module missing: ${id}`);
  }

  if (errors.length) {
    console.error("Chain registry check failed:\n" + errors.map((e) => `  - ${e}`).join("\n"));
    process.exit(1);
  }

  console.log(
    `Chain registry check passed (${chains.length} chains, ${modules.length} TVK modules, Phase 1 complete).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
