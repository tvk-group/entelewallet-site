#!/usr/bin/env node
import { readFile, writeFile, mkdir, rm, cp } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getRegistrySections,
  loadRegistry,
  SECTION_LABELS,
  STATUS_LABELS,
  RISK_LABELS,
} from "../config/chain-registry/registry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "dist");
const SITE_URL = "https://entelewallet.com";
const APP_URL = "https://app.entelewallet.com";
const TRANSPARENCY_LANGS = new Set([
  "en", "tr", "de", "fr", "it", "es", "nl", "pl", "pt", "ro", "sv", "da", "fi",
  "cs", "sk", "hu", "el", "bg", "ru", "uk", "ar", "zh", "ja", "ko", "hi",
]);

const OG_LOCALE = {
  en: "en_US", tr: "tr_TR", de: "de_DE", fr: "fr_FR", it: "it_IT", es: "es_ES",
  nl: "nl_NL", pl: "pl_PL", pt: "pt_BR", ro: "ro_RO", sv: "sv_SE", da: "da_DK",
  fi: "fi_FI", cs: "cs_CZ", sk: "sk_SK", hu: "hu_HU", el: "el_GR", bg: "bg_BG",
  ru: "ru_RU", uk: "uk_UA", ar: "ar_SA", zh: "zh_CN", ja: "ja_JP", ko: "ko_KR", hi: "hi_IN",
};

function localePath(langCode, pagePath) {
  if (langCode === "en") return pagePath === "/" ? "/" : pagePath;
  return pagePath === "/" ? `/${langCode}` : `/${langCode}${pagePath}`;
}

function localeOutFile(langCode, file) {
  if (langCode === "en") return file;
  return join(langCode, file);
}

function transparencyHref(langCode) {
  const lang = TRANSPARENCY_LANGS.has(langCode) ? langCode : "en";
  return `https://entelekron.io/presale/${lang}/transparency`;
}

const BRAND = {
  appIcon: "/brand/entelewallet-app-icon.png",
  wordmark: "/brand/entelewallet-wordmark.png",
  wordmarkDark: "/brand/entelewallet-wordmark-dark.png",
  logoDark: "/brand/entelewallet-logo-dark.png",
  logoHorizontal: "/brand/entelewallet-logo-horizontal.png",
  iconMark: "/brand/entelewallet-icon-mark.png",
  icon512: "/brand/entelewallet-icon-512.png",
  favicon16: "/icons/favicon-16.png",
  favicon32: "/icons/favicon-32.png",
  icon192: "/icons/icon-192.png",
  icon512Pwa: "/icons/icon-512.png",
  appleTouchIcon: "/icons/apple-touch-icon.png",
  ogImage: "/og/entelewallet-lite-og.png",
};

const PAGES = [
  { id: "home", file: "index.html", path: "/" },
  { id: "features", file: "features.html", path: "/features" },
  { id: "security", file: "security.html", path: "/security" },
  { id: "ecosystem", file: "ecosystem.html", path: "/ecosystem" },
  { id: "networks", file: "networks.html", path: "/networks" },
  { id: "roadmap", file: "roadmap.html", path: "/roadmap" },
  { id: "docs", file: "docs.html", path: "/docs" },
  { id: "domains", file: "domains.html", path: "/domains" },
  { id: "contact", file: "contact.html", path: "/contact" },
  { id: "legal", file: "legal.html", path: "/legal" },
  { id: "privacy", file: "privacy.html", path: "/privacy" },
  { id: "terms", file: "terms.html", path: "/terms" },
  { id: "risk", file: "risk.html", path: "/risk" },
  { id: "faq", file: "faq.html", path: "/faq" },
];

const NAV = [
  { key: "common.navHome", href: "/" },
  { key: "common.navFeatures", href: "/features" },
  { key: "common.navSecurity", href: "/security" },
  { key: "common.navEcosystem", href: "/ecosystem" },
  { key: "common.navNetworks", href: "/networks" },
  { key: "common.navRoadmap", href: "/roadmap" },
  { key: "common.navDocs", href: "/docs" },
  { key: "common.navDomains", href: "/domains" },
  { key: "common.navContact", href: "/contact" },
];

const DOMAIN_ENTRIES = [
  { key: "security.domainEntelewalletCom", status: "active" },
  { key: "security.domainAppEntelewalletCom", status: "active" },
  { key: "security.domainEntelewalletApp", status: "reserved" },
  { key: "security.domainEntelewalletOrg", status: "reserved" },
  { key: "security.domainWalletEntelekronIo", status: "reserved" },
  { key: "security.domainEntelekronIo", status: "active" },
  { key: "security.domainEntelekronApp", status: "reserved" },
  { key: "security.domainTvkGroup", status: "active" },
];

const WALLET_ACTIVE_KEYS = [
  "security.walletMetamask",
  "security.walletRabby",
  "security.walletWalletConnect",
];

const WALLET_PLANNED_KEYS = [
  "security.walletCoinbase",
  "security.walletTrust",
  "security.walletRainbow",
  "security.walletLedger",
];

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

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderNetworkCard(item, t, di, T, isModule = false) {
  const statusKey = STATUS_LABELS[item.status] || "networks.statusPlanned";
  const riskKey = RISK_LABELS[item.riskFlag] || "networks.riskUnverified";
  const caps = item.capabilities || {};
  const txLabel = caps.transactions ? "networks.transactionsEnabled" : "networks.transactionsGated";
  const standards = (item.tokenStandards || []).join(", ") || "—";
  const chainMeta = isModule
    ? `<p class="network-meta">${esc(item.description)}</p>`
    : `<p class="network-meta"><span ${di("networks.chainId")}>${T("networks.chainId")}</span> ${item.chainId ?? "—"} · ${esc(item.nativeCurrency.symbol)}</p>`;

  return `<div class="network-card${isModule ? " module-card" : ""}" id="network-${esc(item.id)}" data-id="${esc(item.id)}">
      <div class="network-card-head">
        <img src="${esc(item.icon)}" alt="" class="network-icon" width="44" height="44" loading="lazy" />
        <div class="network-card-title">
          <h3>${esc(item.name)}</h3>
          ${chainMeta}
        </div>
        <span class="network-badge ${esc(item.status)}">${T(statusKey)}</span>
      </div>
      <div class="network-card-body">
        ${!isModule ? `<p class="network-row"><strong ${di("networks.tokenStandards")}>${T("networks.tokenStandards")}</strong> ${esc(standards)}</p>` : ""}
        <p class="network-row"><strong ${di("networks.riskLabel")}>${T("networks.riskLabel")}</strong> <span class="risk-flag ${esc(item.riskFlag)}">${T(riskKey)}</span></p>
        <div class="network-caps">
          ${caps.watchOnly ? `<span class="cap-chip" ${di("networks.watchOnly")}>${T("networks.watchOnly")}</span>` : ""}
          ${caps.walletConnect ? `<span class="cap-chip" ${di("networks.walletConnect")}>${T("networks.walletConnect")}</span>` : ""}
          <span class="cap-chip ${caps.transactions ? "enabled" : "gated"}" ${di(txLabel)}>${T(txLabel)}</span>
        </div>
        ${item.notes ? `<p class="network-note">${esc(item.notes)}</p>` : ""}
      </div>
    </div>`;
}

async function buildNetworkNavHtml(t) {
  const T = (key) => esc(t(key) || key);
  const di = (key) => `data-i18n="${key}"`;
  const sections = await getRegistrySections();
  const total = sections.reduce((n, s) => n + s.chains.length + s.modules.length, 0);

  const groups = sections
    .map((section) => {
      const titleKey = SECTION_LABELS[section.id];
      const items = [
        ...section.chains.map((c) => ({ id: c.id, name: c.name, icon: c.icon })),
        ...section.modules.map((m) => ({ id: m.id, name: m.name, icon: m.icon })),
      ];
      if (!items.length) return "";
      const links = items
        .map(
          (item) =>
            `<a class="networks-nav-link" href="#network-${esc(item.id)}"><img src="${esc(item.icon)}" alt="" width="20" height="20" loading="lazy" /><span>${esc(item.name)}</span></a>`,
        )
        .join("\n            ");
      return `<div class="networks-nav-group" data-nav-section="${esc(section.id)}">
          <h3 ${di(titleKey)}>${T(titleKey)}</h3>
          <nav class="networks-nav-list" aria-label="${esc(T(titleKey))}">
            ${links}
          </nav>
        </div>`;
    })
    .filter(Boolean)
    .join("\n        ");

  return `<aside class="networks-nav" data-network-nav aria-label="Network navigation">
      <h2 class="networks-nav-title" ${di("networks.navTitle")}>${T("networks.navTitle")}</h2>
      <p class="networks-nav-count"><span data-network-count>${total}</span> <span ${di("networks.navCountLabel")}>${T("networks.navCountLabel")}</span></p>
      ${groups}
    </aside>`;
}

async function buildNetworkSectionsHtml(t) {
  const T = (key) => esc(t(key) || key);
  const di = (key) => `data-i18n="${key}"`;
  const sections = await getRegistrySections();

  return sections
    .map((section) => {
      const titleKey = SECTION_LABELS[section.id];
      const cards = [
        ...section.chains.map((c) => renderNetworkCard(c, t, di, T, false)),
        ...section.modules.map((m) => renderNetworkCard(m, t, di, T, true)),
      ].join("\n          ");
      return `<section class="network-section" data-section="${esc(section.id)}">
      <div class="container">
        <div class="section-head"><h2 ${di(titleKey)}>${T(titleKey)}</h2></div>
        <div class="network-grid">${cards}</div>
      </div>
    </section>`;
    })
    .join("\n    ");
}

function renderHreflangLinks(pagePath, languages) {
  const defaultHref = `${SITE_URL}${localePath("en", pagePath)}`;
  const defaultLink = `<link rel="alternate" hreflang="x-default" href="${defaultHref}" />`;
  const links = languages.map((l) => {
    const href = `${SITE_URL}${localePath(l.code, pagePath)}`;
    return `<link rel="alternate" hreflang="${esc(l.code)}" href="${href}" />`;
  });
  return [defaultLink, ...links].join("\n  ");
}

function pageTemplates(t, langCode, pagePath, languages, networkSectionsHtml = "", networkNavHtml = "") {
  const T = (key) => esc(t(key) || key);
  const di = (key) => `data-i18n="${key}"`;
  const transparencyUrl = transparencyHref(langCode);

function statusRow(labelKey, statusKey) {
  return `<div class="status-row"><div class="status-dot"></div><div><p ${di(labelKey)}>${T(labelKey)}</p><p class="preview-status-value" ${di(statusKey)}>${T(statusKey)}</p></div></div>`;
}

function checkRow(key, ok = true) {
  return `<div class="row"><div class="check${ok ? "" : " bad"}">${ok ? "✓" : "✗"}</div><div><h3 ${di(key)}>${T(key)}</h3></div></div>`;
}

function bulletRow(key) {
  return `<div class="row"><div class="check">✓</div><div><p ${di(key)}>${T(key)}</p></div></div>`;
}

function domainCards() {
  return DOMAIN_ENTRIES.map(({ key, status }) => {
    const statusKey = status === "active" ? "common.domainStatusActive" : "common.domainStatusReserved";
    const badgeClass = status === "active" ? "badge active" : "badge reserved";
    return `<div class="domain-card"><span class="${badgeClass}" ${di(statusKey)}>${T(statusKey)}</span><br><code class="ltr" ${di(key)}>${T(key)}</code></div>`;
  }).join("\n          ");
}

function renderNav(activePath) {
  return NAV.map(({ key, href }) => {
    const active = href === activePath ? ' class="active nav-link"' : ' class="nav-link"';
    const navHref = localePath(langCode, href);
    return `<a href="${navHref}"${active} ${di(key)}>${T(key)}</a>`;
  }).join("\n        ");
}

function renderLangMenu() {
  return languages
    .map((l) => {
      const href = localePath(l.code, pagePath);
      const current = l.code === langCode ? ' aria-current="true"' : "";
      return `<a href="${href}" hreflang="${l.code}" data-lang="${l.code}"${current}>${esc(l.name)}</a>`;
    })
    .join("");
}

function renderHeader({ activePath }) {
  return `<header class="topbar">
    <div class="container nav">
      <a class="brand" href="${localePath(langCode, "/")}" aria-label="EnteleWALLET home">
        <img src="${BRAND.appIcon}" alt="" class="brand-icon" width="44" height="44" />
        <img src="${BRAND.wordmark}" alt="EnteleWALLET" class="brand-wordmark" width="200" height="40" />
      </a>
      <nav class="links" aria-label="Primary navigation">
        ${renderNav(activePath)}
        <span class="nav-cta"><a class="btn primary" href="${APP_URL}" rel="noopener noreferrer" ${di("common.openApp")}>${T("common.openApp")}</a></span>
        <div class="lang" data-language-picker>
          <button class="lang-toggle" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="language-menu" aria-label="Choose language">
            🌐 <span id="current-language">${esc(languages.find((l) => l.code === langCode)?.name || "English")}</span>
          </button>
          <div class="lang-menu" id="language-menu" aria-label="Language menu">${renderLangMenu()}</div>
        </div>
      </nav>
    </div>
  </header>`;
}

function renderFooter() {
  const home = localePath(langCode, "/");
  return `<footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">
            <img src="${BRAND.appIcon}" alt="" class="footer-brand-icon" width="40" height="40" />
            <img src="${BRAND.wordmarkDark}" alt="EnteleWALLET" class="footer-brand-wordmark" width="180" height="36" />
          </div>
          <p class="brand-tagline" ${di("common.brandTagline")}>${T("common.brandTagline")}</p>
          <p ${di("common.brandSubtitle")}>${T("common.brandSubtitle")}</p>
          <p ${di("common.footerNotice")}>${T("common.footerNotice")}</p>
          <p class="translation-qa" ${di("common.translationQaNotice")}>${T("common.translationQaNotice")}</p>
        </div>
        <div>
          <h4 ${di("common.footerProduct")}>${T("common.footerProduct")}</h4>
          <a href="${localePath(langCode, "/features")}" ${di("common.footerFeatures")}>${T("common.footerFeatures")}</a>
          <a href="${localePath(langCode, "/security")}" ${di("common.footerSecurity")}>${T("common.footerSecurity")}</a>
          <a href="${localePath(langCode, "/roadmap")}" ${di("common.footerRoadmap")}>${T("common.footerRoadmap")}</a>
          <a href="${localePath(langCode, "/docs")}" ${di("common.footerDocs")}>${T("common.footerDocs")}</a>
          <a href="${localePath(langCode, "/domains")}" ${di("common.footerDomains")}>${T("common.footerDomains")}</a>
          <a href="${localePath(langCode, "/networks")}" ${di("common.footerNetworks")}>${T("common.footerNetworks")}</a>
          <a href="${localePath(langCode, "/faq")}" ${di("common.footerFaq")}>${T("common.footerFaq")}</a>
        </div>
        <div>
          <h4 ${di("common.footerEcosystem")}>${T("common.footerEcosystem")}</h4>
          <a href="https://tvk.group" target="_blank" rel="noopener noreferrer" ${di("common.footerTvkGroup")}>${T("common.footerTvkGroup")}</a>
          <a href="${localePath(langCode, "/ecosystem")}" ${di("common.footerEntelekron")}>${T("common.footerEntelekron")}</a>
          <a href="${localePath(langCode, "/ecosystem")}" ${di("common.footerSovra")}>${T("common.footerSovra")}</a>
          <a href="${localePath(langCode, "/ecosystem")}" ${di("common.footerEnergiemind")}>${T("common.footerEnergiemind")}</a>
          <a href="${localePath(langCode, "/ecosystem")}" ${di("common.footerEntelescan")}>${T("common.footerEntelescan")}</a>
          <a href="${localePath(langCode, "/ecosystem")}" ${di("common.footerEntelevault")}>${T("common.footerEntelevault")}</a>
        </div>
        <div>
          <h4 ${di("common.footerTrust")}>${T("common.footerTrust")}</h4>
          <a href="${localePath(langCode, "/domains")}" ${di("common.footerOfficialDomains")}>${T("common.footerOfficialDomains")}</a>
          <a href="${localePath(langCode, "/risk")}" ${di("common.footerRisk")}>${T("common.footerRisk")}</a>
          <a href="${localePath(langCode, "/privacy")}" ${di("common.footerPrivacy")}>${T("common.footerPrivacy")}</a>
          <a href="${localePath(langCode, "/terms")}" ${di("common.footerTerms")}>${T("common.footerTerms")}</a>
          <a href="mailto:security@tvk.group" ${di("common.footerReportSecurity")}>${T("common.footerReportSecurity")}</a>
        </div>
        <div>
          <h4 ${di("common.footerContact")}>${T("common.footerContact")}</h4>
          <a href="mailto:contact@entelewallet.com" class="ltr" ${di("common.emailContact")}>${T("common.emailContact")}</a>
          <a href="mailto:security@tvk.group" class="ltr" ${di("common.emailSecurityTvk")}>${T("common.emailSecurityTvk")}</a>
          <a href="mailto:support@tvk.group" class="ltr" ${di("common.emailSupport")}>${T("common.emailSupport")}</a>
        </div>
      </div>
      <div class="legal-ft" ${di("common.copyright")}>${T("common.copyright")}</div>
    </div>
  </footer>`;
}

function pageHero(eyebrowKey, titleKey, subtitleKey) {
  return `<section class="page-hero">
      <div class="container">
        <div class="page-hero-brand">
          <img src="${BRAND.logoDark}" alt="EnteleWALLET" class="page-hero-banner" width="360" height="80" />
        </div>
        <div class="eyebrow" ${di(eyebrowKey)}>${T(eyebrowKey)}</div>
        <h1 ${di(titleKey)}>${T(titleKey)}</h1>
        <p class="lead" ${di(subtitleKey)}>${T(subtitleKey)}</p>
      </div>
    </section>`;
}
  const previewRows = [
    ["home.previewWalletConnection", "home.previewWalletConnectionStatus"],
    ["home.previewVerification", "home.previewVerificationStatus"],
    ["home.previewMonitoring", "home.previewMonitoringStatus"],
    ["home.previewEnkDashboard", "home.previewEnkDashboardStatus"],
    ["home.previewVesting", "home.previewVestingStatus"],
    ["home.previewClaims", "home.previewClaimsStatus"],
    ["home.previewCustody", "home.previewCustodyStatus"],
    ["home.previewPrivateKeys", "home.previewPrivateKeysStatus"],
    ["home.previewSeedPhrases", "home.previewSeedPhrasesStatus"],
  ]
    .map(([a, b]) => statusRow(a, b))
    .join("\n              ");

  const positioningDoes = Array.from({ length: 5 }, (_, i) =>
    checkRow(`home.positioningDoes${i + 1}`),
  ).join("\n          ");
  const positioningDoesNot = Array.from({ length: 12 }, (_, i) =>
    checkRow(`home.positioningDoesNot${i + 1}`, false),
  ).join("\n          ");

  const liteFeatures = [
    ["features.featureWalletConnectionTitle", "features.featureWalletConnectionDescription", "features.featureWalletConnectionStatus"],
    ["features.featureVerificationTitle", "features.featureVerificationDescription", "features.featureVerificationStatus"],
    ["features.featureMonitoringTitle", "features.featureMonitoringDescription", "features.featureMonitoringStatus"],
    ["features.featureDomainsTitle", "features.featureDomainsDescription", "features.featureDomainsStatus"],
    ["features.featureSecurityCenterTitle", "features.featureSecurityCenterDescription", "features.featureSecurityCenterStatus"],
    ["features.featureTransparencyTitle", "features.featureTransparencyDescription", "features.featureTransparencyStatus"],
    ["features.featureVestingTitle", "features.featureVestingDescription", "features.featureVestingStatus"],
    ["features.featureClaimReadinessTitle", "features.featureClaimReadinessDescription", "features.featureClaimReadinessStatus"],
    ["features.featureInvestorAppTitle", "features.featureInvestorAppDescription", "features.featureInvestorAppStatus"],
  ]
    .map(
      ([tk, dk, sk]) =>
        `<div class="card phase-card"><span class="phase-badge current" ${di("common.statusCurrent")}>${T("common.statusCurrent")}</span><h3 ${di(tk)}>${T(tk)}</h3><p ${di(dk)}>${T(dk)}</p><p class="feature-status" ${di(sk)}>${T(sk)}</p></div>`,
    )
    .join("\n          ");

  const futureFeatures = [
    ["features.featureCreateWalletTitle", "features.featureCreateWalletDescription", "features.featureCreateWalletStatus"],
    ["features.featureImportWalletTitle", "features.featureImportWalletDescription", "features.featureImportWalletStatus"],
    ["features.featureEncryptedStorageTitle", "features.featureEncryptedStorageDescription", "features.featureEncryptedStorageStatus"],
    ["features.featureMobileAppTitle", "features.featureMobileAppDescription", "features.featureMobileAppStatus"],
    ["features.featureBrowserExtensionTitle", "features.featureBrowserExtensionDescription", "features.featureBrowserExtensionStatus"],
    ["features.featureSendReceiveTitle", "features.featureSendReceiveDescription", "features.featureSendReceiveStatus"],
    ["features.featureTxSimulationTitle", "features.featureTxSimulationDescription", "features.featureTxSimulationStatus"],
    ["features.featureApprovalWarningsTitle", "features.featureApprovalWarningsDescription", "features.featureApprovalWarningsStatus"],
    ["features.featureHardwareTitle", "features.featureHardwareDescription", "features.featureHardwareStatus"],
    ["features.featureWalletConnectModeTitle", "features.featureWalletConnectModeDescription", "features.featureWalletConnectModeStatus"],
    ["features.featureSmartAccountTitle", "features.featureSmartAccountDescription", "features.featureSmartAccountStatus"],
    ["features.featureRecoveryTitle", "features.featureRecoveryDescription", "features.featureRecoveryStatus"],
    ["features.featureAuditsTitle", "features.featureAuditsDescription", "features.featureAuditsStatus"],
    ["features.featureBugBountyTitle", "features.featureBugBountyDescription", "features.featureBugBountyStatus"],
  ]
    .map(
      ([tk, dk, sk]) =>
        `<div class="card phase-card"><span class="phase-badge future" ${di("common.futureLabel")}>${T("common.futureLabel")}</span><h3 ${di(tk)}>${T(tk)}</h3><p ${di(dk)}>${T(dk)}</p><p class="feature-status" ${di(sk)}>${T(sk)}</p><p class="future-note" ${di("common.futurePhaseNote")}>${T("common.futurePhaseNote")}</p></div>`,
    )
    .join("\n          ");

  const securityRoad = [
    "security.roadPortfolio",
    "security.roadTxWarnings",
    "security.roadApproval",
    "security.roadHardware",
    "security.roadSimulation",
    "security.roadSmartAccount",
    "security.roadRecovery",
    "security.roadAudits",
    "security.roadBugBounty",
  ]
    .map(
      (k) =>
        `<div class="road-item"><span class="future-tag phase-badge future" ${di("common.futureLabel")}>${T("common.futureLabel")}</span><h3 ${di(k)}>${T(k)}</h3></div>`,
    )
    .join("\n          ");

  const ecosystemCards = [
    ["ecosystem.entelekronTitle", "ecosystem.entelekronDescription"],
    ["ecosystem.enkTitle", "ecosystem.enkDescription"],
    ["ecosystem.sovraTitle", "ecosystem.sovraDescription"],
    ["ecosystem.energiemindTitle", "ecosystem.energiemindDescription"],
    ["ecosystem.entelescanTitle", "ecosystem.entelescanDescription"],
    ["ecosystem.entelevaultTitle", "ecosystem.entelevaultDescription"],
    ["ecosystem.enteleclosTitle", "ecosystem.enteleclosDescription"],
    ["ecosystem.graphvaultTitle", "ecosystem.graphvaultDescription"],
    ["ecosystem.chronosealTitle", "ecosystem.chronosealDescription"],
    ["ecosystem.qpresenceTitle", "ecosystem.qpresenceDescription"],
    ["ecosystem.sentientSignalsTitle", "ecosystem.sentientSignalsDescription"],
    ["ecosystem.tvkWalletTitle", "ecosystem.tvkWalletDescription"],
    ["ecosystem.tvkIdTitle", "ecosystem.tvkIdDescription"],
    ["ecosystem.tvkGroupTitle", "ecosystem.tvkGroupDescription"],
  ]
    .map(([tk, dk]) => `<div class="card"><h3 ${di(tk)}>${T(tk)}</h3><p ${di(dk)}>${T(dk)}</p></div>`)
    .join("\n          ");

  const roadmapPhases = [
    ["roadmap.phase1Title", "roadmap.phase1Description", "roadmap.phase1Status", "current"],
    ["roadmap.phase2Title", "roadmap.phase2Description", "roadmap.phase2Status", "future"],
    ["roadmap.phase3Title", "roadmap.phase3Description", "roadmap.phase3Status", "future"],
    ["roadmap.phase4Title", "roadmap.phase4Description", "roadmap.phase4Status", "future"],
  ]
    .map(([tk, dk, sk, phase]) =>
      `<div class="phase-card"><span class="phase-badge ${phase}" ${di(sk)}>${T(sk)}</span><h3 ${di(tk)}>${T(tk)}</h3><p ${di(dk)}>${T(dk)}</p></div>`,
    )
    .join("\n          ");

  const docsCards = [
    ["docs.gettingStartedTitle", "docs.gettingStartedDescription", "docs.gettingStartedLink", "/features"],
    ["docs.securityDocsTitle", "docs.securityDocsDescription", "docs.securityDocsLink", "/security"],
    ["docs.domainsDocsTitle", "docs.domainsDocsDescription", "docs.domainsDocsLink", "/domains"],
    ["docs.transparencyDocsTitle", "docs.transparencyDocsDescription", "docs.transparencyDocsLink", transparencyUrl],
    ["docs.ecosystemDocsTitle", "docs.ecosystemDocsDescription", "docs.ecosystemDocsLink", "/ecosystem"],
    ["docs.roadmapDocsTitle", "docs.roadmapDocsDescription", "docs.roadmapDocsLink", "/roadmap"],
    ["docs.legalDocsTitle", "docs.legalDocsDescription", "docs.legalDocsLink", "/legal"],
    ["docs.faqDocsTitle", "docs.faqDocsDescription", "docs.faqDocsLink", "/faq"],
  ]
    .map(
      ([tk, dk, lk, href]) =>
        `<div class="card"><h3 ${di(tk)}>${T(tk)}</h3><p ${di(dk)}>${T(dk)}</p><a href="${href}" ${di(lk)}>${T(lk)}</a></div>`,
    )
    .join("\n          ");

  const faqItems = Array.from({ length: 14 }, (_, i) => i + 1)
    .map((n) => `<div class="faq-item"><h3 ${di(`faq.q${n}`)}>${T(`faq.q${n}`)}</h3><p ${di(`faq.a${n}`)}>${T(`faq.a${n}`)}</p></div>`)
    .join("\n        ");

  const walletActiveGrid = WALLET_ACTIVE_KEYS.map(
    (k) => `<div class="wallet-item active" ${di(k)}>${T(k)}</div>`,
  ).join("\n          ");
  const walletPlannedGrid = WALLET_PLANNED_KEYS.map(
    (k) => `<div class="wallet-item planned" ${di(k)}>${T(k)}</div>`,
  ).join("\n          ");

  const walletFlowSteps = [
    ["home.walletFlowStep1Title", "home.walletFlowStep1Description"],
    ["home.walletFlowStep2Title", "home.walletFlowStep2Description"],
    ["home.walletFlowStep3Title", "home.walletFlowStep3Description"],
    ["home.walletFlowStep4Title", "home.walletFlowStep4Description"],
  ]
    .map(
      ([tk, dk], i) =>
        `<div class="flow-step"><div class="flow-step-num">${i + 1}</div><div><h3 ${di(tk)}>${T(tk)}</h3><p ${di(dk)}>${T(dk)}</p></div></div>`,
    )
    .join("\n          ");

  return {
    renderHeader,
    renderFooter,
    pages: {
    home: `<main id="top">
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <div class="hero-brand-banner">
            <img src="${BRAND.logoDark}" alt="EnteleWALLET — Secure • Intelligent • Connected" class="hero-banner" width="380" height="84" />
          </div>
          <div class="eyebrow" ${di("home.eyebrow")}>${T("home.eyebrow")}</div>
          <h1><span class="plain" ${di("home.heroTitle")}>${T("home.heroTitle")}</span></h1>
          <p class="lead hero-headline" ${di("home.heroHeadline")}>${T("home.heroHeadline")}</p>
          <p class="lead" ${di("home.heroSubtitle")}>${T("home.heroSubtitle")}</p>
          <p class="product-identity" ${di("home.productIdentity")}>${T("home.productIdentity")}</p>
          <div class="hero-actions">
            <a class="btn primary" href="${APP_URL}" ${di("home.ctaOpenApp")}>${T("home.ctaOpenApp")}</a>
            <a class="btn secondary" href="${localePath(langCode, "/security")}" ${di("home.ctaSecurity")}>${T("home.ctaSecurity")}</a>
            <a class="btn secondary" href="${localePath(langCode, "/roadmap")}" ${di("home.ctaRoadmap")}>${T("home.ctaRoadmap")}</a>
          </div>
          <div class="trust">
            <span ${di("home.trustConnect")}>${T("home.trustConnect")}</span>
            <span ${di("home.trustVerify")}>${T("home.trustVerify")}</span>
            <span ${di("home.trustMonitor")}>${T("home.trustMonitor")}</span>
            <span ${di("common.liteNotice")}>${T("common.liteNotice")}</span>
          </div>
        </div>
        <div class="device" aria-label="Wallet Lite preview">
          <div class="phone">
            <div class="wallet-top">
              <img src="${BRAND.appIcon}" alt="" class="phone-brand-icon" width="28" height="28" />
              <div class="pill" ${di("home.previewBadge")}>${T("home.previewBadge")}</div>
            </div>
            <div class="preview-title" ${di("home.previewTitle")}>${T("home.previewTitle")}</div>
            <div class="preview-status-list">${previewRows}</div>
          </div>
        </div>
      </div>
    </section>
    <section class="wallet-flow">
      <div class="container">
        <div class="section-head"><h2 ${di("home.walletFlowTitle")}>${T("home.walletFlowTitle")}</h2><p ${di("home.walletFlowSubtitle")}>${T("home.walletFlowSubtitle")}</p></div>
        <div class="flow-grid">${walletFlowSteps}</div>
      </div>
    </section>
    <section>
      <div class="container">
        <div class="section-head"><h2 ${di("home.positioningTitle")}>Positioning</h2></div>
        <div class="split">
          <div><h3 ${di("home.positioningDoesTitle")}>Does</h3><div class="list">${positioningDoes}</div></div>
          <div><h3 ${di("home.positioningDoesNotTitle")}>Does not</h3><div class="list">${positioningDoesNot}</div></div>
        </div>
      </div>
    </section>
    <section>
      <div class="container split">
        <div class="card phase-card"><span class="phase-badge current" ${di("home.litePhaseLabel")}>Current</span><h3 ${di("home.litePhaseTitle")}>Lite</h3><p ${di("home.litePhaseDescription")}>Desc</p></div>
        <div class="card phase-card"><span class="phase-badge future" ${di("home.futurePhaseLabel")}>Future</span><h3 ${di("home.futurePhaseTitle")}>Future</h3><p ${di("home.futurePhaseDescription")}>Desc</p></div>
      </div>
    </section>
    <section class="ecosystem">
      <div class="container prose-box">
        <h3 ${di("home.ecosystemPreviewTitle")}>Ecosystem</h3>
        <p ${di("home.ecosystemPreviewDescription")}>Desc</p>
        <a class="btn secondary" href="${localePath(langCode, "/ecosystem")}" ${di("common.learnMore")}>Learn more</a>
      </div>
    </section>
    <section>
      <div class="container warning">
        <strong ${di("home.noticeTitle")}>Notice</strong>
        <span ${di("home.noticeText")}>Text</span>
      </div>
    </section>
  </main>`,

    features: `<main>
    ${pageHero("features.eyebrow", "features.title", "features.subtitle")}
    <section><div class="container"><div class="section-head"><h2 ${di("features.liteSectionTitle")}>Lite</h2><p ${di("common.liteNotice")}>Notice</p></div><div class="grid">${liteFeatures}</div></div></section>
    <section><div class="container"><div class="section-head"><h2 ${di("features.futureSectionTitle")}>Future</h2><p ${di("common.futureFeatureNote")}>Note</p></div><div class="grid">${futureFeatures}</div></div></section>
    <section class="cta"><div class="container cta-box"><h2 ${di("features.ctaTitle")}>CTA</h2><p ${di("features.ctaDescription")}>Desc</p><a class="btn secondary" href="${localePath(langCode, "/security")}" ${di("features.ctaSecurity")}>Security</a> <a class="btn secondary" href="${localePath(langCode, "/domains")}" ${di("features.ctaDomains")}>Domains</a></div></section>
  </main>`,

    security: `<main>
    ${pageHero("security.eyebrow", "security.title", "security.subtitle")}
    <section><div class="container"><div class="section-head"><h2 ${di("security.domainsTitle")}>Domains</h2><p ${di("security.domainsIntro")}>Intro</p></div><div class="domains-grid">${domainCards()}</div><div class="warning" style="margin-top:24px"><strong aria-hidden="true">⚠️</strong> <span ${di("security.domainsWarning")}>Warning</span></div></div></section>
    <section><div class="container"><div class="section-head"><h2 ${di("security.liteTitle")}>Lite</h2></div><div class="list">${checkRow("security.liteNoSeed")}${checkRow("security.liteNoKeys")}${checkRow("security.liteNoCustody")}${checkRow("security.liteConnectOnly")}${checkRow("security.liteVerify")}</div></div></section>
    <section><div class="container"><div class="section-head"><h2 ${di("security.signatureTitle")}>Signatures</h2><p ${di("security.sigIntro")}>Intro</p></div><div class="list">${bulletRow("security.sigSiwe")}${bulletRow("security.sigMessageFields")}${bulletRow("security.sigNoApprovals")}${bulletRow("security.sigInspect")}${bulletRow("security.sigRejectUnexpected")}${bulletRow("security.sigMayAuthorize")}${bulletRow("security.sigNeverSeed")}</div><div class="warning" style="margin-top:24px"><strong aria-hidden="true">⚠️</strong> <span ${di("security.signatureWarning")}>Warn</span></div></div></section>
    <section><div class="container danger"><h3 ${di("security.seedTitle")}>${T("security.seedTitle")}</h3><p ${di("security.seedIntro")}>${T("security.seedIntro")}</p><ul>${["security.seedPhrase","security.seedPrivateKey","security.seedRecovery","security.seedPassword","security.seedRemote","security.seedPayment"].map((k)=>`<li ${di(k)}>${T(k)}</li>`).join("")}</ul></div></section>
    <section><div class="container"><div class="section-head"><h2 ${di("security.walletsTitle")}>Wallets</h2><p ${di("security.walletsIntro")}>Intro</p></div><h3 class="wallet-section-label" ${di("security.walletsActiveTitle")}>${T("security.walletsActiveTitle")}</h3><div class="wallet-grid">${walletActiveGrid}</div><h3 class="wallet-section-label future" ${di("security.walletsPlannedTitle")}>${T("security.walletsPlannedTitle")}</h3><div class="wallet-grid planned">${walletPlannedGrid}</div></div></section>
    <section><div class="container verify-box"><h2 ${di("security.verifyTitle")}>Verify</h2><p ${di("security.verifyText")}>Text</p><a class="btn secondary" href="${transparencyUrl}" target="_blank" rel="noopener noreferrer" ${di("security.verifyLink")}>Link</a></div></section>
    <section><div class="container"><div class="section-head"><h2 ${di("security.phishingTitle")}>Phishing</h2></div><div class="list">${checkRow("security.phishSocial")}${checkRow("security.phishDashboard")}${checkRow("security.phishExtensions")}${checkRow("security.phishBookmark")}${checkRow("security.phishSsl")}${checkRow("security.phishSearch")}</div></div></section>
    <section><div class="container"><div class="section-head"><h2 ${di("security.roadmapTitle")}>Roadmap</h2><p ${di("security.roadmapIntro")}>Intro</p></div><div class="roadmap-grid">${securityRoad}</div></div></section>
    <section class="cta"><div class="container cta-box violet"><h2 ${di("security.contactTitle")}>Contact</h2><p ${di("security.contactIntro")}>Intro</p><a class="btn secondary" href="mailto:security@tvk.group" ${di("security.contactCta")}>Report</a><p style="margin-top:18px;font-size:14px;color:#d4e8ff" class="ltr">security@tvk.group</p></div></section>
    <section><div class="container legal-box"><h3 ${di("security.legalTitle")}>Legal</h3><p ${di("security.legalText")}>Text</p></div></section>
  </main>`,

    ecosystem: `<main>
    ${pageHero("ecosystem.eyebrow", "ecosystem.title", "ecosystem.subtitle")}
    <section><div class="container"><div class="section-head"><h2 ${di("ecosystem.architectureTitle")}>Architecture</h2><p ${di("ecosystem.architectureDescription")}>Desc</p></div><div class="grid">${ecosystemCards}</div></div></section>
    <section><div class="container prose-box"><h3 ${di("ecosystem.liteRoleTitle")}>Lite role</h3><p ${di("ecosystem.liteRoleDescription")}>Desc</p><a class="btn primary" href="${transparencyUrl}" target="_blank" rel="noopener noreferrer" ${di("ecosystem.transparencyCta")}>Transparency</a> <a class="btn secondary" href="https://entelekron.org" target="_blank" rel="noopener noreferrer" ${di("ecosystem.entelekronCta")}>EnteleKRON</a></div></section>
  </main>`,

    networks: `<main class="networks-page">
    ${pageHero("networks.eyebrow", "networks.title", "networks.subtitle")}
    <section><div class="container warning"><strong>🔒</strong> <span ${di("networks.securityRule")}>${T("networks.securityRule")}</span></div></section>
    <section class="networks-layout-section">
      <div class="container networks-layout">
        ${networkNavHtml}
        <div class="networks-main" data-networks-main>
          ${networkSectionsHtml}
        </div>
      </div>
    </section>
    <section><div class="container prose-box"><p ${di("networks.registryNote")}>${T("networks.registryNote")}</p><a class="btn secondary" href="/data/chain-registry.json" ${di("networks.downloadRegistry")}>${T("networks.downloadRegistry")}</a> <a class="btn secondary" href="/data/network-list.json" ${di("networks.downloadNetworkList")}>${T("networks.downloadNetworkList")}</a></div></section>
  </main>`,

    roadmap: `<main>
    ${pageHero("roadmap.eyebrow", "roadmap.title", "roadmap.subtitle")}
    <section><div class="container"><div class="roadmap-grid">${roadmapPhases}</div></div></section>
    <section><div class="container"><div class="section-head"><h2 ${di("roadmap.principlesTitle")}>Principles</h2></div><div class="list">${checkRow("roadmap.principleSecurity")}${checkRow("roadmap.principleLite")}${checkRow("roadmap.principleNonCustodial")}${checkRow("roadmap.principleTransparency")}${checkRow("roadmap.principleEcosystem")}</div></div></section>
    <section><div class="container warning"><strong ${di("roadmap.noticeTitle")}>${T("roadmap.noticeTitle")}</strong> <span ${di("roadmap.noticeText")}>${T("roadmap.noticeText")}</span></div></section>
    <section><div class="container warning"><strong>⚠️</strong> <span ${di("roadmap.fullWalletWarning")}>${T("roadmap.fullWalletWarning")}</span></div></section>
  </main>`,

    docs: `<main>
    ${pageHero("docs.eyebrow", "docs.title", "docs.subtitle")}
    <section><div class="container grid">${docsCards}</div></section>
    <section><div class="container prose-box"><h3 ${di("docs.appRepoTitle")}>App repo</h3><p ${di("docs.appRepoDescription")}>Desc</p><p ${di("docs.appRepoNote")}>Note</p></div></section>
    <section><div class="container prose-box"><h3 ${di("docs.externalResourcesTitle")}>External</h3><p ${di("docs.resourceEntelekron")}>R1</p><p ${di("docs.resourceEntelekronIo")}>R2</p><p ${di("docs.resourceTvkGroup")}>R3</p><p ${di("docs.resourceTvkId")}>R4</p></div></section>
  </main>`,

    domains: `<main>
    ${pageHero("domains.eyebrow", "domains.title", "domains.subtitle")}
    <section><div class="container"><h3 ${di("domains.primaryTitle")}>Primary</h3><div class="domains-grid">${domainCards()}</div></div></section>
    <section><div class="container warning" ${di("domains.warning")}>Warning</div></section>
    <section><div class="container prose-box"><h3 ${di("domains.usageTitle")}>Usage</h3><p ${di("domains.usageStep1")}>1</p><p ${di("domains.usageStep2")}>2</p><p ${di("domains.usageStep3")}>3</p><p ${di("domains.usageStep4")}>4</p><p ${di("domains.usageStep5")}>5</p></div></section>
    <section class="cta"><div class="container cta-box violet"><h2 ${di("domains.reportTitle")}>Report</h2><p ${di("domains.reportDescription")}>Desc</p><a class="btn secondary" href="mailto:security@tvk.group" ${di("domains.reportCta")}>Report</a></div></section>
  </main>`,

    contact: `<main>
    ${pageHero("contact.eyebrow", "contact.title", "contact.subtitle")}
    <section><div class="container grid">
      <div class="card"><h3 ${di("contact.generalTitle")}>General</h3><p ${di("contact.generalDescription")}>Desc</p><p class="ltr" ${di("contact.generalEmail")}>email</p></div>
      <div class="card"><h3 ${di("contact.securityTitle")}>Security</h3><p ${di("contact.securityDescription")}>Desc</p><p class="ltr" ${di("contact.securityEmail")}>email</p><p class="ltr" ${di("contact.securityTvkEmail")}>tvk</p><a class="btn secondary" href="mailto:security@tvk.group" ${di("contact.securityCta")}>Report</a></div>
      <div class="card"><h3 ${di("contact.partnersTitle")}>Partners</h3><p ${di("contact.partnersDescription")}>Desc</p><p class="ltr" ${di("contact.partnersEmail")}>email</p></div>
      <div class="card"><h3 ${di("contact.investorTitle")}>Investor</h3><p ${di("contact.investorDescription")}>Desc</p><a href="https://entelekron.io" ${di("contact.investorLink")}>Link</a></div>
      <div class="card"><h3 ${di("contact.transparencyTitle")}>Transparency</h3><p ${di("contact.transparencyDescription")}>Desc</p><a href="${transparencyUrl}" target="_blank" rel="noopener noreferrer" ${di("contact.transparencyLink")}>Link</a></div>
    </div></section>
    <section><div class="container warning"><strong ${di("contact.noticeTitle")}>Notice</strong> <span ${di("contact.noticeText")}>Text</span></div></section>
  </main>`,

    legal: `<main>
    ${pageHero("legal.eyebrow", "legal.title", "legal.subtitle")}
    <section><div class="container prose-box"><p ${di("legal.hubDescription")}>Hub</p>
      <div class="grid" style="margin-top:24px">
        <div class="card"><h3 ${di("legal.privacyLinkTitle")}>Privacy</h3><p ${di("legal.privacyLinkDescription")}>Desc</p><a href="/privacy" ${di("common.viewDetails")}>View</a></div>
        <div class="card"><h3 ${di("legal.termsLinkTitle")}>Terms</h3><p ${di("legal.termsLinkDescription")}>Desc</p><a href="/terms" ${di("common.viewDetails")}>View</a></div>
        <div class="card"><h3 ${di("legal.riskLinkTitle")}>Risk</h3><p ${di("legal.riskLinkDescription")}>Desc</p><a href="/risk" ${di("common.viewDetails")}>View</a></div>
        <div class="card"><h3 ${di("legal.securityLinkTitle")}>Security</h3><p ${di("legal.securityLinkDescription")}>Desc</p><a href="/security" ${di("common.viewDetails")}>View</a></div>
      </div>
      <h3 style="margin-top:24px" ${di("legal.liteNoticeTitle")}>Lite</h3><p ${di("legal.liteNoticeText")}>Text</p>
      <h3 style="margin-top:18px" ${di("legal.operatorTitle")}>Operator</h3><p ${di("legal.operatorText")}>Text</p>
      <h3 style="margin-top:18px" ${di("legal.contactTitle")}>Contact</h3><p ${di("legal.contactText")}>Text</p>
    </div></section>
  </main>`,

    privacy: `<main>
    ${pageHero("privacy.eyebrow", "privacy.title", "privacy.subtitle")}
    <section><div class="container prose-box">
      <p ${di("privacy.lastUpdated")}>Date</p>
      <h3 ${di("privacy.introTitle")}>Intro</h3><p ${di("privacy.introText")}>Text</p>
      <h3 ${di("privacy.scopeTitle")}>Scope</h3><p ${di("privacy.scopeText")}>Text</p>
      <h3 ${di("privacy.collectTitle")}>Collect</h3><p ${di("privacy.collectWebsite")}>W</p><p ${di("privacy.collectTechnical")}>T</p><p ${di("privacy.collectContact")}>C</p><p ${di("privacy.collectWallet")}>Wallet</p>
      <h3 ${di("privacy.noCollectTitle")}>No collect</h3><p ${di("privacy.noCollectSeed")}>S</p><p ${di("privacy.noCollectKeys")}>K</p><p ${di("privacy.noCollectPassword")}>P</p><p ${di("privacy.noCollectCustody")}>C</p>
      <h3 ${di("privacy.useTitle")}>Use</h3><p ${di("privacy.useSecurity")}>S</p><p ${di("privacy.useService")}>Sv</p><p ${di("privacy.useCommunication")}>C</p><p ${di("privacy.useCompliance")}>Co</p>
      <h3 ${di("privacy.shareTitle")}>Share</h3><p ${di("privacy.shareText")}>Text</p>
      <h3 ${di("privacy.cookiesTitle")}>Cookies</h3><p ${di("privacy.cookiesText")}>Text</p>
      <h3 ${di("privacy.retentionTitle")}>Retention</h3><p ${di("privacy.retentionText")}>Text</p>
      <h3 ${di("privacy.rightsTitle")}>Rights</h3><p ${di("privacy.rightsText")}>Text</p>
      <h3 ${di("privacy.securityTitle")}>Security</h3><p ${di("privacy.securityText")}>Text</p>
      <h3 ${di("privacy.childrenTitle")}>Children</h3><p ${di("privacy.childrenText")}>Text</p>
      <h3 ${di("privacy.changesTitle")}>Changes</h3><p ${di("privacy.changesText")}>Text</p>
      <h3 ${di("privacy.contactTitle")}>Contact</h3><p ${di("privacy.contactText")}>Text</p>
    </div></section>
  </main>`,

    terms: `<main>
    ${pageHero("terms.eyebrow", "terms.title", "terms.subtitle")}
    <section><div class="container prose-box">
      <p ${di("terms.lastUpdated")}>Date</p>
      <h3 ${di("terms.acceptanceTitle")}>Acceptance</h3><p ${di("terms.acceptanceText")}>Text</p>
      <h3 ${di("terms.serviceTitle")}>Service</h3><p ${di("terms.serviceText")}>Text</p>
      <h3 ${di("terms.eligibilityTitle")}>Eligibility</h3><p ${di("terms.eligibilityText")}>Text</p>
      <h3 ${di("terms.walletTitle")}>Wallet</h3><p ${di("terms.walletText")}>Text</p>
      <h3 ${di("terms.noAdviceTitle")}>Advice</h3><p ${di("terms.noAdviceText")}>Text</p>
      <h3 ${di("terms.noGuaranteeTitle")}>Guarantee</h3><p ${di("terms.noGuaranteeText")}>Text</p>
      <h3 ${di("terms.prohibitedTitle")}>Prohibited</h3><p ${di("terms.prohibitedFraud")}>F</p><p ${di("terms.prohibitedAbuse")}>A</p><p ${di("terms.prohibitedIllegal")}>I</p><p ${di("terms.prohibitedFalse")}>Fa</p>
      <h3 ${di("terms.thirdPartyTitle")}>Third party</h3><p ${di("terms.thirdPartyText")}>Text</p>
      <h3 ${di("terms.ipTitle")}>IP</h3><p ${di("terms.ipText")}>Text</p>
      <h3 ${di("terms.disclaimerTitle")}>Disclaimer</h3><p ${di("terms.disclaimerText")}>Text</p>
      <h3 ${di("terms.liabilityTitle")}>Liability</h3><p ${di("terms.liabilityText")}>Text</p>
      <h3 ${di("terms.changesTitle")}>Changes</h3><p ${di("terms.changesText")}>Text</p>
      <h3 ${di("terms.contactTitle")}>Contact</h3><p ${di("terms.contactText")}>Text</p>
    </div></section>
  </main>`,

    risk: `<main>
    ${pageHero("risk.eyebrow", "risk.title", "risk.subtitle")}
    <section><div class="container prose-box">
      <p ${di("risk.lastUpdated")}>Date</p>
      <h3 ${di("risk.generalTitle")}>General</h3><p ${di("risk.generalText")}>Text</p>
      <h3 ${di("risk.technologyTitle")}>Technology</h3><p ${di("risk.technologyText")}>Text</p>
      <h3 ${di("risk.walletTitle")}>Wallet</h3><p ${di("risk.walletText")}>Text</p>
      <h3 ${di("risk.signatureTitle")}>Signature</h3><p ${di("risk.signatureText")}>Text</p>
      <h3 ${di("risk.tokenTitle")}>Token</h3><p ${di("risk.tokenText")}>Text</p>
      <h3 ${di("risk.investorTitle")}>Investor</h3><p ${di("risk.investorText")}>Text</p>
      <h3 ${di("risk.thirdPartyTitle")}>Third party</h3><p ${di("risk.thirdPartyText")}>Text</p>
      <h3 ${di("risk.regulatoryTitle")}>Regulatory</h3><p ${di("risk.regulatoryText")}>Text</p>
      <h3 ${di("risk.noCustodyTitle")}>No custody</h3><p ${di("risk.noCustodyText")}>Text</p>
      <h3 ${di("risk.contactTitle")}>Contact</h3><p ${di("risk.contactText")}>Text</p>
    </div></section>
  </main>`,

    faq: `<main>
    ${pageHero("faq.eyebrow", "faq.title", "faq.subtitle")}
    <section><div class="container faq-list">${faqItems}</div></section>
  </main>`,
    },
  };
}

function renderPage({ pageId, path, langCode, languages, messages, networkSectionsHtml = "", networkNavHtml = "" }) {
  const langMessages = messages[langCode] || messages.en;
  const flat = flatten(langMessages);
  const t = (key) => flat[key];
  const meta = langMessages?.meta?.[pageId] || langMessages?.meta?.home || {};
  const layout = pageTemplates(t, langCode, path, languages, networkSectionsHtml, networkNavHtml);
  const main = layout.pages[pageId];
  if (!main) throw new Error(`Missing template for page: ${pageId}`);

  const langJson = JSON.stringify(languages).replace(/</g, "\\u003c");
  const canonicalUrl = `${SITE_URL}${localePath(langCode, path)}`;
  const ogLocale = OG_LOCALE[langCode] || "en_US";
  const ogAlternates = languages
    .filter((l) => l.code !== langCode)
    .map((l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l.code] || "en_US"}" />`)
    .join("\n  ");
  const dir = languages.find((l) => l.code === langCode)?.rtl ? "rtl" : "ltr";
  const ogImageAlt = "EnteleWALLET — Secure Wallet Access Layer";

  return `<!DOCTYPE html>
<html lang="${esc(langCode)}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(meta.title || "EnteleWALLET")}</title>
  <meta name="description" content="${esc(meta.description || "")}" />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${canonicalUrl}" />
  ${renderHreflangLinks(path, languages)}
  <meta property="og:title" content="${esc(meta.ogTitle || meta.title || "EnteleWALLET")}" />
  <meta property="og:description" content="${esc(meta.ogDescription || meta.description || "")}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:site_name" content="EnteleWALLET" />
  <meta property="og:locale" content="${ogLocale}" />
  ${ogAlternates}
  <meta property="og:image" content="${SITE_URL}${BRAND.ogImage}" />
  <meta property="og:image:alt" content="${esc(ogImageAlt)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(meta.ogTitle || meta.title || "EnteleWALLET")}" />
  <meta name="twitter:description" content="${esc(meta.ogDescription || meta.description || "")}" />
  <meta name="twitter:image" content="${SITE_URL}${BRAND.ogImage}" />
  <meta name="twitter:image:alt" content="${esc(ogImageAlt)}" />
  <meta name="theme-color" content="#0a1628" />
  <link rel="icon" type="image/png" sizes="32x32" href="${BRAND.favicon32}" />
  <link rel="icon" type="image/png" sizes="16x16" href="${BRAND.favicon16}" />
  <link rel="apple-touch-icon" href="${BRAND.appleTouchIcon}" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="stylesheet" href="/assets/site.css" />
</head>
<body data-page-lang="${esc(langCode)}" data-page-path="${esc(path)}">
  ${layout.renderHeader({ activePath: path })}
  ${main}
  ${layout.renderFooter()}
  <script>window.__ENTELE_PAGE_META__=${JSON.stringify(pageId)};window.__ENTELE_LANGUAGES__=${langJson};</script>
  <script src="/assets/site.js" defer></script>
</body>
</html>
`;
}

async function loadMessages() {
  const languages = JSON.parse(await readFile(join(ROOT, "config/languages.json"), "utf8"));
  const messages = {};
  for (const { code } of languages) {
    messages[code] = JSON.parse(await readFile(join(ROOT, "messages", `${code}.json`), "utf8"));
  }
  return { languages, messages };
}

async function main() {
  const [css, js, { languages, messages }] = await Promise.all([
    readFile(join(ROOT, "assets/site.css"), "utf8"),
    readFile(join(ROOT, "assets/site.js"), "utf8"),
    loadMessages(),
  ]);

  const enFlat = flatten(messages.en);
  const t = (key) => enFlat[key];
  const networkSectionsHtml = await buildNetworkSectionsHtml(t);
  const networkNavHtml = await buildNetworkNavHtml(t);
  const registry = await loadRegistry();
  const networkList = {
    version: registry.version,
    updatedAt: registry.updatedAt,
    chains: registry.chains.map((c) => ({
      id: c.id,
      name: c.name,
      chainId: c.chainId,
      status: c.status,
      uiCategory: c.uiCategory,
      rpcUrls: c.rpcUrls,
      blockExplorerUrls: c.blockExplorerUrls,
      icon: c.icon,
      nativeSymbol: c.nativeCurrency.symbol,
    })),
    tvkModules: registry.tvkModules.map((m) => ({
      id: m.id,
      name: m.name,
      status: m.status,
      uiCategory: m.uiCategory,
      icon: m.icon,
    })),
  };

  await rm(OUT, { recursive: true, force: true });
  await mkdir(join(OUT, "assets"), { recursive: true });
  await mkdir(join(OUT, "og"), { recursive: true });
  await mkdir(join(OUT, "data"), { recursive: true });
  await mkdir(join(OUT, "icons/chains"), { recursive: true });
  await mkdir(join(OUT, "brand"), { recursive: true });

  await writeFile(join(OUT, "assets/site.css"), css);
  await writeFile(join(OUT, "assets/site.js"), js);
  await writeFile(join(OUT, "data/chain-registry.json"), JSON.stringify(registry, null, 2) + "\n");
  await writeFile(join(OUT, "data/network-list.json"), JSON.stringify(networkList, null, 2) + "\n");
  await cp(join(ROOT, "public/icons/chains"), join(OUT, "icons/chains"), { recursive: true });
  await cp(join(ROOT, "public/brand"), join(OUT, "brand"), { recursive: true });
  await cp(join(ROOT, "public/icons/icon-192.png"), join(OUT, "icons/icon-192.png"));
  await cp(join(ROOT, "public/icons/icon-512.png"), join(OUT, "icons/icon-512.png"));
  await cp(join(ROOT, "public/icons/favicon-16.png"), join(OUT, "icons/favicon-16.png"));
  await cp(join(ROOT, "public/icons/favicon-32.png"), join(OUT, "icons/favicon-32.png"));
  await cp(join(ROOT, "public/icons/apple-touch-icon.png"), join(OUT, "icons/apple-touch-icon.png"));
  await cp(join(ROOT, "public/og"), join(OUT, "og"), { recursive: true });

  const manifest = {
    name: "EnteleWALLET",
    short_name: "EnteleWALLET",
    description: "Secure Wallet Access Layer for the EnteleKRON Ecosystem",
    start_url: "/",
    display: "standalone",
    background_color: "#0a1628",
    theme_color: "#0a1628",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
  await writeFile(join(OUT, "manifest.webmanifest"), JSON.stringify(manifest, null, 2) + "\n");

  for (const page of PAGES) {
    for (const { code: langCode } of languages) {
      const html = renderPage({
        pageId: page.id,
        path: page.path,
        langCode,
        languages,
        messages,
        networkSectionsHtml,
        networkNavHtml,
      });
      const outFile = localeOutFile(langCode, page.file);
      const outPath = join(OUT, outFile);
      await mkdir(dirname(outPath), { recursive: true });
      await writeFile(outPath, html);
    }
  }

  const sitemapUrls = [];
  for (const page of PAGES) {
    for (const { code } of languages) {
      const loc = `${SITE_URL}${localePath(code, page.path)}`;
      sitemapUrls.push(`  <url><loc>${loc}</loc><changefreq>weekly</changefreq><priority>${page.path === "/" ? "1.0" : page.path === "/security" ? "0.9" : "0.7"}</priority></url>`);
    }
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join("\n")}\n</urlset>\n`;
  await writeFile(join(OUT, "sitemap.xml"), sitemap);
  await writeFile(
    join(OUT, "robots.txt"),
    `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`,
  );

  const pageCount = PAGES.length * languages.length;
  console.log(`Built ${pageCount} localized pages (${PAGES.length} routes × ${languages.length} locales), sitemap.xml, robots.txt.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
