#!/usr/bin/env node
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "dist");
const SITE_URL = "https://entelewallet.com";
const APP_URL = "https://app.entelewallet.com";

const MINI_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const PAGES = [
  { id: "home", file: "index.html", path: "/" },
  { id: "features", file: "features.html", path: "/features" },
  { id: "security", file: "security.html", path: "/security" },
  { id: "ecosystem", file: "ecosystem.html", path: "/ecosystem" },
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
  { key: "common.navRoadmap", href: "/roadmap" },
  { key: "common.navDocs", href: "/docs" },
  { key: "common.navDomains", href: "/domains" },
  { key: "common.navContact", href: "/contact" },
];

const DOMAIN_KEYS = [
  "security.domainEntelewalletCom",
  "security.domainAppEntelewalletCom",
  "security.domainEntelewalletApp",
  "security.domainEntelewalletOrg",
  "security.domainWalletEntelekronIo",
  "security.domainEntelekronIo",
  "security.domainEntelekronApp",
  "security.domainTvkGroup",
];

const WALLET_KEYS = [
  "security.walletMetamask",
  "security.walletRabby",
  "security.walletWalletConnect",
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

function pageTemplates(t) {
  const T = (key) => esc(t(key) || key);
  const di = (key) => `data-i18n="${key}"`;

function statusRow(labelKey, statusKey) {
  return `<div class="status-row"><div class="status-dot"></div><div><p ${di(labelKey)}>${T(labelKey)}</p><p class="preview-status-value" ${di(statusKey)}>${T(statusKey)}</p></div></div>`;
}

function checkRow(key, ok = true) {
  return `<div class="row"><div class="check${ok ? "" : " bad"}">${ok ? "✓" : "✗"}</div><div><h3 ${di(key)}>${T(key)}</h3></div></div>`;
}

function domainCards() {
  return DOMAIN_KEYS.map(
    (k) =>
      `<div class="domain-card"><span class="badge" ${di("common.officialLabel")}>${T("common.officialLabel")}</span><br><code class="ltr" ${di(k)}>${T(k)}</code></div>`,
  ).join("\n          ");
}

function renderNav(activePath) {
  return NAV.map(({ key, href }) => {
    const active = href === activePath ? ' class="active nav-link"' : ' class="nav-link"';
    return `<a href="${href}"${active} ${di(key)}>${T(key)}</a>`;
  }).join("\n        ");
}

function renderLangMenu(languages) {
  return languages
    .map((l) => `<a href="?lang=${l.code}" hreflang="${l.code}" data-lang="${l.code}">${esc(l.name)}</a>`)
    .join("");
}

function renderHeader({ languages, activePath }) {
  return `<header class="topbar">
    <div class="container nav">
      <a class="brand" href="/" aria-label="EnteleWALLET home">
        <div class="mark">EW</div>
        <div>EnteleWALLET<small ${di("common.brandSubtitle")}>${T("common.brandSubtitle")}</small></div>
      </a>
      <nav class="links" aria-label="Primary navigation">
        ${renderNav(activePath)}
        <span class="nav-cta"><a class="btn primary" href="${APP_URL}" rel="noopener noreferrer" ${di("common.openApp")}>${T("common.openApp")}</a></span>
        <div class="lang" data-language-picker>
          <button class="lang-toggle" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="language-menu" aria-label="Choose language">
            🌐 <span id="current-language" ${di("common.languageLabel")}>${T("common.languageLabel")}</span>
          </button>
          <div class="lang-menu" id="language-menu" aria-label="Language menu">${renderLangMenu(languages)}</div>
        </div>
      </nav>
    </div>
  </header>`;
}

function renderFooter() {
  return `<footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <h3>EnteleWALLET</h3>
          <p ${di("common.brandSubtitle")}>${T("common.brandSubtitle")}</p>
          <p ${di("common.footerNotice")}>${T("common.footerNotice")}</p>
        </div>
        <div>
          <h4 ${di("common.footerProduct")}>${T("common.footerProduct")}</h4>
          <a href="/features" ${di("common.footerFeatures")}>${T("common.footerFeatures")}</a>
          <a href="/security" ${di("common.footerSecurity")}>${T("common.footerSecurity")}</a>
          <a href="/roadmap" ${di("common.footerRoadmap")}>${T("common.footerRoadmap")}</a>
          <a href="/docs" ${di("common.footerDocs")}>${T("common.footerDocs")}</a>
          <a href="/domains" ${di("common.footerDomains")}>${T("common.footerDomains")}</a>
          <a href="/faq" ${di("common.footerFaq")}>${T("common.footerFaq")}</a>
        </div>
        <div>
          <h4 ${di("common.footerEcosystem")}>${T("common.footerEcosystem")}</h4>
          <a href="https://tvk.group" target="_blank" rel="noopener noreferrer" ${di("common.footerTvkGroup")}>${T("common.footerTvkGroup")}</a>
          <a href="/ecosystem" ${di("common.footerEntelekron")}>${T("common.footerEntelekron")}</a>
          <a href="/ecosystem" ${di("common.footerSovra")}>${T("common.footerSovra")}</a>
          <a href="/ecosystem" ${di("common.footerEnergiemind")}>${T("common.footerEnergiemind")}</a>
          <a href="/ecosystem" ${di("common.footerEntelescan")}>${T("common.footerEntelescan")}</a>
          <a href="/ecosystem" ${di("common.footerEntelevault")}>${T("common.footerEntelevault")}</a>
        </div>
        <div>
          <h4 ${di("common.footerTrust")}>${T("common.footerTrust")}</h4>
          <a href="/domains" ${di("common.footerOfficialDomains")}>${T("common.footerOfficialDomains")}</a>
          <a href="/risk" ${di("common.footerRisk")}>${T("common.footerRisk")}</a>
          <a href="/privacy" ${di("common.footerPrivacy")}>${T("common.footerPrivacy")}</a>
          <a href="/terms" ${di("common.footerTerms")}>${T("common.footerTerms")}</a>
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
    "security.roadOwnership",
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
    ["docs.transparencyDocsTitle", "docs.transparencyDocsDescription", "docs.transparencyDocsLink", "https://entelekron.io/transparency"],
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

  const walletGrid = WALLET_KEYS.map(
    (k) => `<div class="wallet-item" ${di(k)}>${T(k)}</div>`,
  ).join("\n          ");

  return {
    renderHeader,
    renderFooter,
    pages: {
    home: `<main id="top">
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <div class="eyebrow" ${di("home.eyebrow")}>${T("home.eyebrow")}</div>
          <h1><span class="plain" ${di("home.heroTitle")}>${T("home.heroTitle")}</span></h1>
          <p class="lead" style="font-size:clamp(22px,3vw,28px);font-weight:800;color:var(--ink)" ${di("home.heroHeadline")}>${T("home.heroHeadline")}</p>
          <p class="lead" ${di("home.heroSubtitle")}>${T("home.heroSubtitle")}</p>
          <div class="hero-actions">
            <a class="btn primary" href="${APP_URL}" ${di("home.ctaOpenApp")}>${T("home.ctaOpenApp")}</a>
            <a class="btn secondary" href="/security" ${di("home.ctaSecurity")}>${T("home.ctaSecurity")}</a>
            <a class="btn secondary" href="/roadmap" ${di("home.ctaRoadmap")}>${T("home.ctaRoadmap")}</a>
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
              <div class="pill">EnteleWALLET</div>
              <div class="pill" ${di("home.previewBadge")}>${T("home.previewBadge")}</div>
            </div>
            <div class="preview-title" ${di("home.previewTitle")}>${T("home.previewTitle")}</div>
            <div class="preview-status-list">${previewRows}</div>
          </div>
        </div>
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
        <a class="btn secondary" href="/ecosystem" ${di("common.learnMore")}>Learn more</a>
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
    <section class="cta"><div class="container cta-box"><h2 ${di("features.ctaTitle")}>CTA</h2><p ${di("features.ctaDescription")}>Desc</p><a class="btn secondary" href="/security" ${di("features.ctaSecurity")}>Security</a> <a class="btn secondary" href="/domains" ${di("features.ctaDomains")}>Domains</a></div></section>
  </main>`,

    security: `<main>
    ${pageHero("security.eyebrow", "security.title", "security.subtitle")}
    <section><div class="container"><div class="section-head"><h2 ${di("security.domainsTitle")}>Domains</h2><p ${di("security.domainsIntro")}>Intro</p></div><div class="domains-grid">${domainCards()}</div><div class="warning" style="margin-top:24px"><strong>⚠️</strong> <span ${di("security.domainsWarning")}>Warning</span></div></div></section>
    <section><div class="container"><div class="section-head"><h2 ${di("security.liteTitle")}>Lite</h2></div><div class="list">${checkRow("security.liteNoSeed")}${checkRow("security.liteNoKeys")}${checkRow("security.liteNoCustody")}${checkRow("security.liteConnectOnly")}${checkRow("security.liteVerify")}</div></div></section>
    <section><div class="container"><div class="section-head"><h2 ${di("security.signatureTitle")}>Signatures</h2></div><div class="list">${checkRow("security.sigOwnership")}${checkRow("security.sigNoTransfer", false)}${checkRow("security.sigNoApprove", false)}${checkRow("security.sigNoTx", false)}${checkRow("security.sigNoGas", false)}</div><div class="warning" style="margin-top:24px"><strong>⚠️</strong> <span ${di("security.signatureWarning")}>Warn</span></div></div></section>
    <section><div class="container danger"><h3 ${di("security.seedTitle")}>${T("security.seedTitle")}</h3><p ${di("security.seedIntro")}>${T("security.seedIntro")}</p><ul>${["security.seedPhrase","security.seedPrivateKey","security.seedRecovery","security.seedPassword","security.seedRemote","security.seedPayment"].map((k)=>`<li ${di(k)}>${T(k)}</li>`).join("")}</ul></div></section>
    <section><div class="container"><div class="section-head"><h2 ${di("security.walletsTitle")}>Wallets</h2><p ${di("security.walletsIntro")}>Intro</p></div><div class="wallet-grid">${walletGrid}</div></div></section>
    <section><div class="container verify-box"><h2 ${di("security.verifyTitle")}>Verify</h2><p ${di("security.verifyText")}>Text</p><a class="btn secondary" href="https://entelekron.io/transparency" target="_blank" rel="noopener noreferrer" ${di("security.verifyLink")}>Link</a></div></section>
    <section><div class="container"><div class="section-head"><h2 ${di("security.phishingTitle")}>Phishing</h2></div><div class="list">${checkRow("security.phishSocial")}${checkRow("security.phishDashboard")}${checkRow("security.phishExtensions")}${checkRow("security.phishBookmark")}${checkRow("security.phishSsl")}${checkRow("security.phishSearch")}</div></div></section>
    <section><div class="container"><div class="section-head"><h2 ${di("security.roadmapTitle")}>Roadmap</h2><p ${di("security.roadmapIntro")}>Intro</p></div><div class="roadmap-grid">${securityRoad}</div></div></section>
    <section class="cta"><div class="container cta-box violet"><h2 ${di("security.contactTitle")}>Contact</h2><p ${di("security.contactIntro")}>Intro</p><a class="btn secondary" href="mailto:security@tvk.group" ${di("security.contactCta")}>Report</a><p style="margin-top:18px;font-size:14px;color:#d4e8ff" class="ltr">security@tvk.group</p></div></section>
    <section><div class="container legal-box"><h3 ${di("security.legalTitle")}>Legal</h3><p ${di("security.legalText")}>Text</p></div></section>
  </main>`,

    ecosystem: `<main>
    ${pageHero("ecosystem.eyebrow", "ecosystem.title", "ecosystem.subtitle")}
    <section><div class="container"><div class="section-head"><h2 ${di("ecosystem.architectureTitle")}>Architecture</h2><p ${di("ecosystem.architectureDescription")}>Desc</p></div><div class="grid">${ecosystemCards}</div></div></section>
    <section><div class="container prose-box"><h3 ${di("ecosystem.liteRoleTitle")}>Lite role</h3><p ${di("ecosystem.liteRoleDescription")}>Desc</p><a class="btn primary" href="https://entelekron.io/transparency" ${di("ecosystem.transparencyCta")}>Transparency</a> <a class="btn secondary" href="https://entelekron.org" ${di("ecosystem.entelekronCta")}>EnteleKRON</a></div></section>
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
      <div class="card"><h3 ${di("contact.transparencyTitle")}>Transparency</h3><p ${di("contact.transparencyDescription")}>Desc</p><a href="https://entelekron.io/transparency" ${di("contact.transparencyLink")}>Link</a></div>
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

function renderPage({ pageId, path, languages, messages }) {
  const enMeta = messages.en?.meta?.[pageId] || messages.en?.meta?.home || {};
  const enFlat = flatten(messages.en);
  const t = (key) => enFlat[key];
  const layout = pageTemplates(t);
  const main = layout.pages[pageId];
  if (!main) throw new Error(`Missing template for page: ${pageId}`);

  const i18nJson = JSON.stringify(messages).replace(/</g, "\\u003c");
  const langJson = JSON.stringify(languages).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(enMeta.title || "EnteleWALLET")}</title>
  <meta name="description" content="${esc(enMeta.description || "")}" />
  <meta property="og:title" content="${esc(enMeta.ogTitle || enMeta.title || "EnteleWALLET")}" />
  <meta property="og:description" content="${esc(enMeta.ogDescription || enMeta.description || "")}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${SITE_URL}${path === "/" ? "" : path}" />
  <meta property="og:image" content="${SITE_URL}/og/${pageId}.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(enMeta.ogTitle || enMeta.title || "EnteleWALLET")}" />
  <meta name="twitter:description" content="${esc(enMeta.ogDescription || enMeta.description || "")}" />
  <meta name="theme-color" content="#f8fbff" />
  <link rel="stylesheet" href="/assets/site.css" />
</head>
<body>
  ${layout.renderHeader({ languages, activePath: path })}
  ${main}
  ${layout.renderFooter()}
  <script id="entele-i18n" type="application/json">${i18nJson}</script>
  <script>window.__ENTELE_I18N__=JSON.parse(document.getElementById("entele-i18n").textContent);window.__ENTELE_PAGE_META__=${JSON.stringify(pageId)};window.__ENTELE_LANGUAGES__=${langJson};</script>
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

  await rm(OUT, { recursive: true, force: true });
  await mkdir(join(OUT, "assets"), { recursive: true });
  await mkdir(join(OUT, "og"), { recursive: true });

  await writeFile(join(OUT, "assets/site.css"), css);
  await writeFile(join(OUT, "assets/site.js"), js);

  for (const page of PAGES) {
    const html = renderPage({
      pageId: page.id,
      path: page.path,
      languages,
      messages,
    });
    await writeFile(join(OUT, page.file), html);
    await writeFile(join(OUT, "og", `${page.id}.png`), MINI_PNG);
  }

  console.log(`Built ${PAGES.length} pages to dist/, ${languages.length} locales.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
