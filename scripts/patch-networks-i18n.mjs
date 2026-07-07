#!/usr/bin/env node
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MESSAGES_DIR = join(ROOT, "messages");
const PATCHES = JSON.parse(
  await readFile(join(ROOT, "scripts/networks-i18n-patches.json"), "utf8"),
);

function setNested(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

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

const en = JSON.parse(await readFile(join(MESSAGES_DIR, "en.json"), "utf8"));
const enFlat = flatten(en);
const networkKeys = Object.keys(enFlat).filter(
  (k) =>
    k.startsWith("networks.") ||
    k === "common.navNetworks" ||
    k === "common.footerNetworks" ||
    k.startsWith("meta.networks."),
);

const files = (await readdir(MESSAGES_DIR)).filter((f) => f.endsWith(".json") && f !== "en.json");

for (const file of files) {
  const lang = file.replace(".json", "");
  const path = join(MESSAGES_DIR, file);
  const data = JSON.parse(await readFile(path, "utf8"));
  const patch = PATCHES[lang];
  if (!patch) throw new Error(`Missing patch for locale: ${lang}`);

  for (const key of networkKeys) {
    if (!(key in patch)) throw new Error(`[${lang}] missing patch key: ${key}`);
    setNested(data, key, patch[key]);
  }

  await writeFile(path, JSON.stringify(data, null, 2) + "\n");
  console.log(`Patched ${file}`);
}

console.log(`Done — ${files.length} locales updated.`);
