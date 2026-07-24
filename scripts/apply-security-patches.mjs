#!/usr/bin/env node
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PATCHES = JSON.parse(
  await readFile(join(ROOT, "scripts/security-locale-patches.json"), "utf8"),
);

const REMOVE_KEYS = [
  "security.sigOwnership",
  "security.sigNoTransfer",
  "security.sigNoApprove",
  "security.sigNoTx",
  "security.sigNoGas",
  "security.roadOwnership",
];

function setPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function deletePath(obj, path) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) return;
    cur = cur[parts[i]];
  }
  delete cur[parts[parts.length - 1]];
}

for (const file of (await readdir(join(ROOT, "messages"))).filter((f) => f.endsWith(".json"))) {
  const code = file.replace(".json", "");
  const path = join(ROOT, "messages", file);
  const data = JSON.parse(await readFile(path, "utf8"));
  const patch = PATCHES[code];
  if (patch) {
    for (const [key, value] of Object.entries(patch)) {
      setPath(data, key, value);
    }
  }
  for (const key of REMOVE_KEYS) deletePath(data, key);
  await writeFile(path, JSON.stringify(data, null, 2) + "\n");
}

console.log("Applied security locale patches.");
