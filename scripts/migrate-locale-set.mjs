#!/usr/bin/env node
/**
 * Migrate locale set to required 25 languages and patch security keys.
 */
import { readFile, writeFile, rm, cp } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MESSAGES = join(ROOT, "messages");

const REMOVE = ["ur", "id", "ms", "fa", "az", "ka"];
const ADD_FROM = {
  sv: "nl",
  da: "sv",
  fi: "sv",
  cs: "pl",
  sk: "cs",
  hu: "ro",
};

const REMOVE_SECURITY_KEYS = [
  "sigOwnership",
  "sigNoTransfer",
  "sigNoApprove",
  "sigNoTx",
  "sigNoGas",
  "roadOwnership",
];

const SECURITY_PATCHES = {
  tr: {
    domainsIntro:
      "EnteleWALLET ile cüzdan bağlarken veya mesaj imzalarken yalnızca aşağıda listelenen alan adlarını kullanın. Rezerve olarak işaretlenen alan adları resmidir ancak henüz cüzdan uygulamasını sunmamaktadır.",
    liteVerify: "Cüzdan doğrulama, etkinleştirildiğinde SIWE (EIP-4361) kimlik doğrulama mesajlarını kullanır",
    sigIntro:
      "EnteleWALLET sahiplik doğrulaması açıkça tanımlanabilir bir kimlik doğrulama mesajı kullanmalıdır. Typed-data imzaları, permit imzaları ve Permit2 yetkilendirmeleri, hemen zincir üstü işlem oluşturmasalar bile varlık harcamasına izin verebilir.",
    sigSiwe: "EnteleWALLET Lite, uygulamada özellik etkinleştirildiğinde sahiplik doğrulaması için SIWE (EIP-4361) kullanır.",
    sigMessageFields:
      "Beklenen mesaj EnteleWALLET'i, istek yapan alan adını, cüzdan adresini, amacı, nonce değerini, veriliş zamanını ve varsa son kullanma zamanını belirtmelidir.",
    sigNoApprovals:
      "Temel bir sahiplik doğrulama mesajı token onayı, Permit, Permit2, varlık transferi, pazar yeri emri, delegasyon veya sınırsız yetkilendirme istememelidir.",
    sigInspect: "İmzalamadan önce cüzdanınızdaki imza ayrıntılarını inceleyin.",
    sigRejectUnexpected: "Beklenmeyen typed-data, permit, onay veya işlem isteklerini reddedin.",
    sigMayAuthorize: "Bir imza, imzalama anında gas ücreti alınmasa bile yetkilendirme taşıyabilir.",
    sigNeverSeed: "EnteleWALLET asla tohum ifadesi veya özel anahtar istemez.",
    signatureWarning: "Anlamadığınız mesajları asla imzalamayın. Şüphe durumunda durun ve resmi alan adları üzerinden doğrulayın.",
    walletsTitle: "Cüzdan Bağlantı Sağlayıcıları",
    walletsIntro:
      "EnteleWALLET Lite, uygulamada yapılandırılan cüzdan sağlayıcıları üzerinden bağlanır. Her zaman resmi cüzdan uygulamasını veya uzantısını kullandığınızdan emin olun.",
    walletsActiveTitle: "EnteleWALLET Lite'da şu anda kullanılabilir",
    walletsPlannedTitle: "Planlanan — Lite'da henüz kullanılamıyor",
    walletWalletConnect: "WalletConnect",
    walletLedger: "Ledger (donanım cüzdanı rotaları)",
    roadPortfolio: "Genişletilmiş portföy izleme",
  },
  de: {
    domainsIntro:
      "Verwenden Sie nur die unten aufgeführten Domains, wenn Sie eine Wallet mit EnteleWALLET verbinden oder Nachrichten signieren. Als reserviert markierte Domains sind offiziell, dienen aber noch nicht der Wallet-Anwendung.",
    liteVerify: "Die Wallet-Verifizierung verwendet bei Aktivierung SIWE-Authentifizierungsnachrichten (EIP-4361)",
    sigIntro:
      "Die EnteleWALLET-Eigentumsverifizierung sollte eine klar erkennbare Authentifizierungsnachricht verwenden. Typed-Data-Signaturen, Permit-Signaturen und Permit2-Autorisierungen können Ausgaben autorisieren, auch wenn sie nicht sofort eine On-Chain-Transaktion auslösen.",
    sigSiwe: "EnteleWALLET Lite verwendet SIWE (EIP-4361) zur Eigentumsverifizierung, wenn die Funktion in der App aktiviert ist.",
    sigMessageFields:
      "Die erwartete Nachricht muss EnteleWALLET, die anfragende Domain, die Wallet-Adresse, den Zweck, die Nonce, die Ausstellungszeit und gegebenenfalls die Ablaufzeit enthalten.",
    sigNoApprovals:
      "Eine grundlegende Eigentumsverifizierungsnachricht darf keine Token-Genehmigung, Permit, Permit2, Asset-Transfer, Marktplatzauftrag, Delegation oder unbegrenzte Autorisierung anfordern.",
    sigInspect: "Prüfen Sie die Signaturdetails in Ihrer Wallet vor dem Signieren.",
    sigRejectUnexpected: "Lehnen Sie unerwartete Typed-Data-, Permit-, Genehmigungs- oder Transaktionsanfragen ab.",
    sigMayAuthorize: "Eine Signatur kann Autorisierung enthalten, auch wenn beim Signieren keine Gasgebühr anfällt.",
    sigNeverSeed: "EnteleWALLET wird niemals nach einer Seed-Phrase oder einem privaten Schlüssel fragen.",
    signatureWarning:
      "Signieren Sie niemals Nachrichten, die Sie nicht verstehen. Im Zweifel stoppen und über offizielle Domains verifizieren.",
    walletsTitle: "Wallet-Verbindungsanbieter",
    walletsIntro:
      "EnteleWALLET Lite verbindet sich über die in der Anwendung konfigurierten Wallet-Anbieter. Stellen Sie immer sicher, dass Sie die offizielle Wallet-App oder -Erweiterung verwenden.",
    walletsActiveTitle: "Jetzt verfügbar in EnteleWALLET Lite",
    walletsPlannedTitle: "Geplant — in Lite noch nicht verfügbar",
    walletWalletConnect: "WalletConnect",
    walletLedger: "Ledger (Hardware-Wallet-Routen)",
    roadPortfolio: "Erweiterte Portfolio-Überwachung",
  },
};

function deepSet(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

async function loadJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function main() {
  const en = await loadJson(join(MESSAGES, "en.json"));
  const enSecurity = en.security;
  const enCommon = en.common;

  for (const code of REMOVE) {
    await rm(join(MESSAGES, `${code}.json`), { force: true });
    console.log(`Removed messages/${code}.json`);
  }

  for (const [code, from] of Object.entries(ADD_FROM)) {
    const src = join(MESSAGES, `${from}.json`);
    const dest = join(MESSAGES, `${code}.json`);
    try {
      await cp(src, dest);
      console.log(`Created messages/${code}.json from ${from}.json`);
    } catch (err) {
      console.error(`Failed to create ${code}.json:`, err.message);
      process.exit(1);
    }
  }

  const files = (await import("node:fs/promises")).readdir(MESSAGES);
  const localeFiles = (await files).filter((f) => f.endsWith(".json"));

  for (const file of localeFiles) {
    const code = file.replace(".json", "");
    const path = join(MESSAGES, file);
    const data = await loadJson(path);

    if (!data.common) data.common = {};
    data.common.domainStatusActive = enCommon.domainStatusActive;
    data.common.domainStatusReserved = enCommon.domainStatusReserved;
    data.common.translationQaNotice = enCommon.translationQaNotice;

    if (!data.security) data.security = {};
    for (const [key, value] of Object.entries(enSecurity)) {
      if (!(key in data.security) || REMOVE_SECURITY_KEYS.includes(key)) {
        // will be set below
      }
    }
    for (const key of REMOVE_SECURITY_KEYS) {
      delete data.security[key];
    }

    const patch = SECURITY_PATCHES[code];
    if (patch) {
      Object.assign(data.security, patch);
    } else if (code !== "en") {
      // For locales without hand patch, copy structure from en for new keys only
      for (const key of Object.keys(enSecurity)) {
        if (REMOVE_SECURITY_KEYS.includes(key)) continue;
        if (!(key in data.security)) {
          data.security[key] = enSecurity[key];
        }
      }
    }

  // Ensure all en security keys exist
    for (const [key, value] of Object.entries(enSecurity)) {
      if (!(key in data.security)) data.security[key] = value;
    }
    for (const key of REMOVE_SECURITY_KEYS) {
      delete data.security[key];
    }

    await writeFile(path, JSON.stringify(data, null, 2) + "\n");
  }

  console.log("Locale migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
