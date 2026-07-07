#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MESSAGES_DIR = join(ROOT, "messages");

const LOREM_RE = /lorem\s+ipsum/i;
const PLACEHOLDER_RE = /\b(TODO|TRANSLATE)\b/;

const EXEMPT_EXACT = new Set([
  "EnteleWALLET", "EnteleKRON", "ENK", "SOVRA", "EnergieMIND", "ENM",
  "TVK Group", "TVK Labs", "EnteleVAULT", "EnteleSCAN", "TVK ID",
  "MetaMask", "Rabby", "WalletConnect", "Coinbase Wallet", "Trust Wallet",
  "Rainbow", "Ledger", "FAQ", "Docs", "Domains", "Roadmap", "Features",
  "Security", "Home", "Contact", "Ecosystem", "Future", "Official",
  "EnteleCLOS", "GraphVAULT", "ChronoSEAL", "Q-Presence", "Sentient Signals",
  "EnteleLEDGER", "EnteleLINK", "WalletConnect wallets",
  "Product", "Live", "Status", "Networks",
]);

function flatten(obj, prefix = "") {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(out, flatten(value, path));
    } else {
      out[path] = value;
    }
  }
  return out;
}

function isExempt(key, value) {
  if (typeof value !== "string") return true;
  if (EXEMPT_EXACT.has(value)) return true;
  if (/^[\w.+-]+@[\w.-]+\.\w+$/.test(value)) return true;
  if (/^https?:\/\//.test(value)) return true;
  if (/^[\w.-]+\.(com|io|app|org|group)$/.test(value)) return true;
  if (key.includes("domain") || key.startsWith("security.domain")) return true;
  if (key.endsWith("Email") || key.includes("email") || key.includes("Email")) return true;
  if (key.endsWith("Title") && /^(Entele|TVK|SOVRA|Energie|Graph|Chrono|Q-Presence|Sentient|ENK|MetaMask|Rabby|Rainbow|Ledger|Coinbase|WalletConnect)/.test(value)) return true;
  if (key === "home.heroTitle" || value === "EnteleWALLET Lite") return true;
  if (key === "common.brandTagline") return true;
  if (key === "home.productIdentity") return true;
  if (key === "roadmap.phase1Title" || key.startsWith("roadmap.phase")) return value.includes("EnteleWALLET") || value.includes("Phase");
  if (key.includes("wallet") && /^(MetaMask|Rabby|Rainbow|Ledger|Coinbase|Trust|WalletConnect)/.test(value)) return true;
  if (value.includes("tvk.group") || value.includes("entelewallet.") || value.includes("entelekron.")) return true;
  if (/^ENK\b/.test(value) || value === "ENK dashboard" || value === "ENK dashboard preview") return true;
  if (/^TVK/.test(value)) return true;
  return false;
}

function isEmpty(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

async function loadJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function main() {
  const masterPath = join(MESSAGES_DIR, "en.json");
  let master;
  try {
    master = await loadJson(masterPath);
  } catch (err) {
    console.error(`Failed to load master messages/en.json: ${err.message}`);
    process.exit(1);
  }

  const masterFlat = flatten(master);
  const masterKeys = Object.keys(masterFlat).sort();
  const files = (await readdir(MESSAGES_DIR)).filter((f) => f.endsWith(".json") && f !== "en.json");

  let failed = false;

  for (const file of files.sort()) {
    const lang = file.replace(/\.json$/, "");
    const path = join(MESSAGES_DIR, file);
    let data;
    try {
      data = await loadJson(path);
    } catch (err) {
      console.error(`[${lang}] Invalid JSON: ${err.message}`);
      failed = true;
      continue;
    }

    const flat = flatten(data);
    const keys = Object.keys(flat).sort();
    let untranslated = 0;

    for (const key of masterKeys) {
      if (!(key in flat)) {
        console.error(`[${lang}] Missing key: ${key}`);
        failed = true;
      }
    }

    for (const key of keys) {
      if (!(key in masterFlat)) {
        console.error(`[${lang}] Extra key not in en.json: ${key}`);
        failed = true;
      }
    }

    for (const key of masterKeys) {
      const value = flat[key];
      if (isEmpty(value)) {
        console.error(`[${lang}] Empty value: ${key}`);
        failed = true;
        continue;
      }
      const text = String(value);
      if (PLACEHOLDER_RE.test(text)) {
        console.error(`[${lang}] Placeholder marker in ${key}: ${text}`);
        failed = true;
      }
      if (LOREM_RE.test(text)) {
        console.error(`[${lang}] Lorem ipsum in ${key}: ${text}`);
        failed = true;
      }
      if (!isExempt(key, text) && text === masterFlat[key]) {
        untranslated++;
        if (untranslated <= 3) {
          console.error(`[${lang}] Untranslated (same as English): ${key}`);
        }
        failed = true;
      }
    }

    if (untranslated > 3) {
      console.error(`[${lang}] ... and ${untranslated - 3} more untranslated keys`);
    }
  }

  if (failed) {
    console.error("i18n check failed.");
    process.exit(1);
  }

  console.log(`i18n check passed (${files.length} locales, ${masterKeys.length} keys).`);
}

main();
