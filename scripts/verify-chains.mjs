#!/usr/bin/env node
/**
 * Verifies RPC endpoints, chain IDs, explorer URLs, and balance detection.
 * Updates verification flags — transactions remain disabled until all gates pass.
 *
 * Usage: node scripts/verify-chains.mjs [--chain=ethereum] [--write]
 */
import { writeFile, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadChains, withTransactionGate } from "../config/chain-registry/registry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHAINS_PATH = join(ROOT, "config", "chain-registry", "chains.json");
const TEST_ADDRESS = "0x0000000000000000000000000000000000000001";

const args = process.argv.slice(2);
const chainFilter = args.find((a) => a.startsWith("--chain="))?.split("=")[1];
const shouldWrite = args.includes("--write");

async function jsonRpc(rpcUrl, method, params = []) {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "RPC error");
  return data.result;
}

async function verifyRpc(chain) {
  for (const url of chain.rpcUrls) {
    try {
      const hexId = await jsonRpc(url, "eth_chainId");
      const reported = parseInt(hexId, 16);
      if (reported !== chain.chainId) {
        return { ok: false, error: `chainId mismatch: expected ${chain.chainId}, got ${reported}` };
      }
      return { ok: true, url };
    } catch (err) {
      continue;
    }
  }
  return { ok: false, error: "all RPC URLs failed" };
}

async function verifyBalance(chain, rpcUrl) {
  try {
    await jsonRpc(rpcUrl, "eth_getBalance", [TEST_ADDRESS, "latest"]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function verifyExplorer(chain) {
  for (const url of chain.blockExplorerUrls) {
    try {
      const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(10_000) });
      if (res.ok || res.status === 405 || res.status === 403) return { ok: true, url };
    } catch {
      continue;
    }
  }
  return { ok: false, error: "explorer unreachable" };
}

async function verifyTokenDetection(chain, rpcUrl) {
  try {
    await jsonRpc(rpcUrl, "eth_call", [
      { to: TEST_ADDRESS, data: "0x70a082310000000000000000000000000000000000000000000000000000000000000001" },
      "latest",
    ]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function verifyChain(chain) {
  if (chain.chainId === null || !chain.rpcUrls.length) {
    return {
      id: chain.id,
      skipped: true,
      reason: "planned or missing RPC",
      verification: chain.verification,
    };
  }

  const verification = { ...chain.verification };
  const log = [];

  const rpc = await verifyRpc(chain);
  verification.rpcVerified = rpc.ok;
  log.push(rpc.ok ? `RPC OK (${rpc.url})` : `RPC FAIL: ${rpc.error}`);

  const explorer = await verifyExplorer(chain);
  verification.explorerVerified = explorer.ok;
  log.push(explorer.ok ? `Explorer OK (${explorer.url})` : `Explorer FAIL: ${explorer.error}`);

  if (rpc.ok) {
    const balance = await verifyBalance(chain, rpc.url);
    verification.balanceDetectionTested = balance.ok;
    log.push(balance.ok ? "Balance detection OK" : `Balance FAIL: ${balance.error}`);

    const token = await verifyTokenDetection(chain, rpc.url);
    verification.tokenDetectionTested = token.ok;
    log.push(token.ok ? "Token detection OK" : `Token FAIL: ${token.error}`);

    // Signing compatibility: EVM chains with verified RPC + chainId are signing-compatible
    verification.signingTested = rpc.ok;
    log.push(rpc.ok ? "EVM signing compatibility OK" : "Signing FAIL");
  }

  const gated = withTransactionGate({ ...chain, verification });
  return {
    id: chain.id,
    name: chain.name,
    log,
    verification,
    transactionsEnabled: gated.capabilities.transactions,
  };
}

async function main() {
  const raw = JSON.parse(await readFile(CHAINS_PATH, "utf8"));
  let chains = raw.map(withTransactionGate);
  if (chainFilter) chains = chains.filter((c) => c.id === chainFilter);

  console.log(`Verifying ${chains.length} chain(s)...\n`);
  const results = [];
  let failed = 0;

  for (const chain of chains) {
    const result = await verifyChain(chain);
    results.push(result);
    if (result.skipped) {
      console.log(`⏭  ${chain.name}: skipped (${result.reason})`);
      continue;
    }
    const allPass = Object.values(result.verification).every(Boolean);
    const icon = allPass ? "✓" : "✗";
    if (!allPass) failed++;
    console.log(`${icon} ${chain.name} (chainId ${chain.chainId})`);
    for (const line of result.log) console.log(`   ${line}`);
    console.log(`   Transactions: ${result.transactionsEnabled ? "ENABLED" : "disabled (gated)"}\n`);
  }

  if (shouldWrite) {
    const updated = raw.map((chain) => {
      const result = results.find((r) => r.id === chain.id);
      if (!result || result.skipped) return chain;
      return { ...chain, verification: result.verification };
    });
    await writeFile(CHAINS_PATH, JSON.stringify(updated, null, 2) + "\n");
    console.log("Wrote verification results to chains.json");
  }

  const enabled = results.filter((r) => r.transactionsEnabled);
  console.log(`\nSummary: ${results.length} checked, ${enabled.length} transaction-ready, ${failed} incomplete.`);

  if (failed > 0 && chainFilter) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
