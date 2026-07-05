#!/usr/bin/env python3
"""Generate security.html with full i18n for all 24 languages."""

KEYS = [
    "brandSubtitle", "navHome", "navFeatures", "navSecurity", "navEcosystem", "navRoadmap", "navContact", "languageLabel",
    "secEyebrow", "secHeroTitle", "secHeroSubtitle",
    "secDomainsTitle", "secDomainsIntro", "secDomainsWarning", "officialLabel",
    "secLiteTitle", "secLiteNoSeed", "secLiteNoKeys", "secLiteNoCustody", "secLiteConnectOnly", "secLiteVerify",
    "secSignatureTitle", "secSigOwnership", "secSigNoTransfer", "secSigNoApprove", "secSigNoTx", "secSigNoGas", "secSignatureWarning",
    "secSeedTitle", "secSeedIntro", "secSeedPhrase", "secSeedPrivateKey", "secSeedRecovery", "secSeedPassword", "secSeedRemote", "secSeedPayment",
    "secWalletsTitle", "secWalletsIntro",
    "secVerifyTitle", "secVerifyText", "secVerifyLink",
    "secPhishingTitle", "secPhishSocial", "secPhishDashboard", "secPhishExtensions", "secPhishBookmark", "secPhishSSL", "secPhishSearch",
    "secRoadmapTitle", "secRoadmapIntro", "secFutureLabel",
    "secRoadOwnership", "secRoadPortfolio", "secRoadTxWarnings", "secRoadApproval", "secRoadHardware",
    "secRoadSimulation", "secRoadSmartAccount", "secRoadRecovery", "secRoadAudits", "secRoadBugBounty",
    "secContactTitle", "secContactIntro", "secContactCTA",
    "secLegalTitle", "secLegalText",
    "footerProduct", "footerEcosystem", "footerContact", "footerModules", "footerPartnerships", "footerTrustCenter",
    "pageTitle", "metaDescription", "ogTitle", "ogDescription",
]

T = {
"en": {
"brandSubtitle": "Secure Web3 Wallet Layer",
"navHome": "Home",
"navFeatures": "Features",
"navSecurity": "Security",
"navEcosystem": "Ecosystem",
"navRoadmap": "Roadmap",
"navContact": "Contact",
"languageLabel": "Language",
"secEyebrow": "🛡️ EnteleWALLET Security Center",
"secHeroTitle": "Security-first wallet access for the EnteleKRON ecosystem",
"secHeroSubtitle": "EnteleWALLET is being built with a security-first approach for wallet verification, ecosystem asset monitoring, and future non-custodial wallet functionality.",
"secDomainsTitle": "Official EnteleWALLET Domains",
"secDomainsIntro": "Only use the domains listed below when connecting a wallet or signing messages with EnteleWALLET.",
"secDomainsWarning": "Always check the domain before connecting a wallet or signing any message.",
"officialLabel": "Official",
"secLiteTitle": "EnteleWALLET Lite Safety",
"secLiteNoSeed": "EnteleWALLET Lite does not store seed phrases",
"secLiteNoKeys": "EnteleWALLET Lite does not store private keys",
"secLiteNoCustody": "EnteleWALLET Lite does not custody funds",
"secLiteConnectOnly": "EnteleWALLET Lite connects to existing wallets only",
"secLiteVerify": "Wallet verification uses safe message signatures only",
"secSignatureTitle": "Signature Safety",
"secSigOwnership": "A valid EnteleWALLET signature must only verify wallet ownership",
"secSigNoTransfer": "It must not transfer tokens",
"secSigNoApprove": "It must not approve spending",
"secSigNoTx": "It must not create a blockchain transaction",
"secSigNoGas": "It must not cost gas",
"secSignatureWarning": "Never sign messages you do not understand.",
"secSeedTitle": "Seed Phrase and Private Key Warning",
"secSeedIntro": "EnteleWALLET, EnteleKRON, TVK Group, TVK Labs, SOVRA, support staff, admins, partners, or community moderators will never ask for:",
"secSeedPhrase": "seed phrase",
"secSeedPrivateKey": "private key",
"secSeedRecovery": "recovery phrase",
"secSeedPassword": "wallet password",
"secSeedRemote": "remote access to your computer",
"secSeedPayment": "payment through social media messages",
"secWalletsTitle": "Supported Wallets",
"secWalletsIntro": "EnteleWALLET Lite connects to established wallet providers. Always verify you are using the official wallet application or extension.",
"secVerifyTitle": "Official Address Verification",
"secVerifyText": "Use the Transparency Center to verify official contracts, treasury wallets, presale wallets, and ecosystem addresses.",
"secVerifyLink": "Visit Transparency Center",
"secPhishingTitle": "Phishing Protection",
"secPhishSocial": "Never trust payment addresses sent by Telegram, Discord, X, Instagram, or email",
"secPhishDashboard": "Always verify payment instructions inside the official investor dashboard",
"secPhishExtensions": "Never install fake wallet extensions",
"secPhishBookmark": "Bookmark the official domains listed on this page",
"secPhishSSL": "Verify SSL/HTTPS before entering wallet credentials",
"secPhishSearch": "Avoid sponsored search-result links for wallet access",
"secRoadmapTitle": "Future EnteleWALLET Security Roadmap",
"secRoadmapIntro": "These capabilities are planned for future EnteleWALLET releases. They are not active today.",
"secFutureLabel": "Future",
"secRoadOwnership": "Wallet ownership verification",
"secRoadPortfolio": "Portfolio monitoring",
"secRoadTxWarnings": "Transaction warnings",
"secRoadApproval": "Malicious approval warnings",
"secRoadHardware": "Hardware wallet support",
"secRoadSimulation": "Transaction simulation",
"secRoadSmartAccount": "Smart account support",
"secRoadRecovery": "Recovery architecture",
"secRoadAudits": "Independent security audits",
"secRoadBugBounty": "Bug bounty program",
"secContactTitle": "Contact / Report a Security Issue",
"secContactIntro": "If you discover a vulnerability, phishing site, or impersonation attempt, report it to our security team.",
"secContactCTA": "Report a Security Concern",
"secLegalTitle": "Legal / Risk Notice",
"secLegalText": "EnteleWALLET Lite is a wallet connection and verification interface. It does not custody funds, store seed phrases, provide investment advice, or guarantee token value, liquidity, listing, or returns.",
"footerProduct": "Product",
"footerEcosystem": "Ecosystem",
"footerContact": "Contact",
"footerModules": "Entelekron Modules",
"footerPartnerships": "Partnerships",
"footerTrustCenter": "Trust Center",
"pageTitle": "EnteleWALLET Security | Official Wallet Safety & Trust Center",
"metaDescription": "Official EnteleWALLET security page for wallet safety, verified domains, signature protection, phishing warnings, and EnteleKRON ecosystem trust information.",
"ogTitle": "EnteleWALLET Security",
"ogDescription": "Official wallet safety, verified domains, and security guidance for the EnteleWALLET ecosystem.",
},
}

import json
from pathlib import Path

_i18n_path = Path(__file__).with_name("security-i18n.json")
if _i18n_path.exists():
    T.update(json.loads(_i18n_path.read_text(encoding="utf-8")))

LANG_NAMES = {
    "en": "English", "tr": "Türkçe", "de": "Deutsch", "fr": "Français", "it": "Italiano",
    "es": "Español", "nl": "Nederlands", "pl": "Polski", "pt": "Português", "ro": "Română",
    "sv": "Svenska", "da": "Dansk", "fi": "Suomi", "cs": "Čeština", "sk": "Slovenčina",
    "hu": "Magyar", "el": "Ελληνικά", "bg": "Български", "ru": "Русский", "uk": "Українська",
    "ar": "العربية", "zh": "中文", "ja": "日本語", "ko": "한국어", "hi": "हिन्दी",
}

def row(code):
    base = T["en"]
    vals = T.get(code, {})
    return "|".join(vals.get(k, base[k]).replace("|", "/") for k in KEYS)

def js_rows():
    lines = ["      const rows = {"]
    for code in LANG_NAMES:
        lines.append(f'        {code}: "{row(code)}",')
    lines.append("      };")
    return "\n".join(lines)

def keys_js():
    return "|".join(KEYS)

HTML_HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EnteleWALLET Security | Official Wallet Safety &amp; Trust Center</title>
  <meta name="description" content="Official EnteleWALLET security page for wallet safety, verified domains, signature protection, phishing warnings, and EnteleKRON ecosystem trust information." />
  <meta property="og:title" content="EnteleWALLET Security" />
  <meta property="og:description" content="Official wallet safety, verified domains, and security guidance for the EnteleWALLET ecosystem." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://entelewallet.com/security" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="EnteleWALLET Security" />
  <meta name="twitter:description" content="Official wallet safety, verified domains, and security guidance for the EnteleWALLET ecosystem." />
  <meta name="theme-color" content="#f8fbff" />
  <style>
    :root{--bg:#f8fbff;--panel:#ffffff;--ink:#0d1b2a;--muted:#5e6b7a;--line:#dfe9f5;--blue:#0b6fff;--cyan:#12c8ff;--violet:#6b4cff;--navy:#07152d;--soft:#eef6ff;--green:#12b886;--shadow:0 24px 70px rgba(13,27,42,.10);--radius:28px}
    *{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:radial-gradient(circle at top left,#eaf6ff,transparent 34%),radial-gradient(circle at top right,#f0f3ff,transparent 32%),var(--bg);color:var(--ink);line-height:1.6}a{text-decoration:none;color:inherit}.container{width:min(1180px,92%);margin:auto}.topbar{position:sticky;top:0;z-index:50;background:rgba(248,251,255,.86);backdrop-filter:blur(18px);border-bottom:1px solid rgba(223,233,245,.8)}.nav{height:82px;display:flex;align-items:center;justify-content:space-between;gap:24px}.brand{display:flex;align-items:center;gap:14px;font-weight:900;letter-spacing:.4px}.mark{width:46px;height:46px;border-radius:15px;background:linear-gradient(135deg,var(--blue),var(--cyan));display:grid;place-items:center;color:white;box-shadow:0 16px 35px rgba(11,111,255,.25);font-weight:900}.brand small{display:block;color:var(--muted);font-weight:700;font-size:11px;letter-spacing:1.8px;text-transform:uppercase}.links{display:flex;align-items:center;gap:22px;color:#243247;font-weight:700;font-size:14px}.links a{opacity:.86}.links a:hover,.links a.active{opacity:1;color:var(--blue)}.lang{position:relative}.lang button{border:1px solid var(--line);background:white;padding:10px 14px;border-radius:999px;font-weight:800;cursor:pointer;color:var(--ink);box-shadow:0 10px 24px rgba(13,27,42,.06)}.lang-menu{position:absolute;right:0;top:48px;width:260px;max-height:410px;overflow:auto;background:white;border:1px solid var(--line);border-radius:20px;box-shadow:var(--shadow);padding:10px;display:none}.lang:hover .lang-menu{display:grid;grid-template-columns:1fr 1fr;gap:4px}.lang-menu a{padding:9px 10px;border-radius:12px;color:#29384d;font-size:13px}.lang-menu a:hover{background:var(--soft);color:var(--blue)}.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:14px 22px;border-radius:999px;font-weight:900;border:1px solid transparent}.btn.primary{background:linear-gradient(135deg,var(--blue),var(--cyan));color:white;box-shadow:0 18px 38px rgba(11,111,255,.26)}.btn.secondary{background:white;color:var(--navy);border-color:var(--line)}.sec-hero{padding:88px 0 56px;text-align:center}.sec-hero .eyebrow{display:inline-flex;gap:10px;align-items:center;padding:9px 13px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.72);font-weight:900;color:var(--blue);font-size:13px;margin-bottom:22px}.sec-hero h1{font-size:clamp(36px,5vw,64px);line-height:1.05;letter-spacing:-2px;margin-bottom:20px;max-width:900px;margin-left:auto;margin-right:auto}.sec-hero h1 span{background:linear-gradient(135deg,var(--blue),var(--violet));-webkit-background-clip:text;background-clip:text;color:transparent}.sec-hero .lead{font-size:20px;color:var(--muted);max-width:760px;margin:0 auto}section{padding:64px 0}.section-head{max-width:790px;margin-bottom:34px}.section-head h2{font-size:clamp(30px,4vw,48px);line-height:1.08;letter-spacing:-1.5px;margin-bottom:14px}.section-head p{font-size:18px;color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.card{background:rgba(255,255,255,.9);border:1px solid var(--line);border-radius:var(--radius);padding:28px;box-shadow:0 12px 36px rgba(13,27,42,.055)}.icon{width:48px;height:48px;border-radius:16px;background:var(--soft);display:grid;place-items:center;margin-bottom:18px;font-size:22px}.card h3{font-size:20px;margin-bottom:9px}.card p{color:var(--muted);font-size:15px}.list{display:grid;gap:14px}.row{display:flex;gap:14px;background:white;border:1px solid var(--line);border-radius:20px;padding:18px;box-shadow:0 10px 28px rgba(13,27,42,.05)}.check{width:28px;height:28px;flex:0 0 28px;border-radius:50%;background:#e8fff6;color:var(--green);display:grid;place-items:center;font-weight:900}.warning{background:#fff8e8;border:1px solid #f2d9a1;border-radius:24px;padding:24px;color:#5b4211;font-weight:600}.danger{background:#fff1f1;border:1px solid #f5b8b8;border-radius:24px;padding:28px;color:#6b1a1a}.danger h3{font-size:22px;margin-bottom:12px}.danger ul{margin:12px 0 0 20px}.danger li{margin:8px 0;font-weight:700}.domains-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;margin-top:20px}.domain-card{background:white;border:1px solid var(--line);border-radius:20px;padding:20px;box-shadow:0 10px 28px rgba(13,27,42,.05)}.domain-card .badge{display:inline-block;background:linear-gradient(135deg,var(--blue),var(--cyan));color:white;font-size:11px;font-weight:900;padding:4px 10px;border-radius:999px;margin-bottom:10px;text-transform:uppercase;letter-spacing:.8px}.domain-card code{font-size:16px;font-weight:800;color:var(--navy)}.wallet-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:20px}.wallet-item{background:linear-gradient(180deg,#fff,#f7fbff);border:1px solid var(--line);border-radius:20px;padding:20px;text-align:center;font-weight:800}.verify-box{background:linear-gradient(135deg,#07152d,#1a3a7a);color:white;border-radius:32px;padding:40px;box-shadow:var(--shadow)}.verify-box p{color:#c2d0e2;margin:14px 0 22px;font-size:17px}.verify-box a.btn.secondary{color:var(--navy)}.roadmap-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:20px}.road-item{background:white;border:1px solid var(--line);border-radius:20px;padding:22px;position:relative}.future-tag{position:absolute;top:14px;right:14px;background:#f0ecff;color:var(--violet);font-size:11px;font-weight:900;padding:4px 10px;border-radius:999px;text-transform:uppercase;letter-spacing:.6px}.road-item h3{font-size:17px;padding-right:60px}.cta{padding:70px 0 90px}.cta-box{border-radius:42px;background:linear-gradient(135deg,var(--blue),var(--violet));color:white;padding:54px;text-align:center;box-shadow:0 30px 80px rgba(11,111,255,.25)}.cta-box h2{font-size:clamp(30px,4vw,42px);line-height:1.1;margin-bottom:12px}.cta-box p{max-width:680px;margin:0 auto 24px;color:#eaf7ff}.legal-box{background:rgba(255,255,255,.9);border:1px solid var(--line);border-radius:24px;padding:28px}.legal-box h3{margin-bottom:10px;font-size:20px}.legal-box p{color:var(--muted)}.footer{background:#07152d;color:white;padding:46px 0}.footer-grid{display:grid;grid-template-columns:1.2fr repeat(3,1fr);gap:28px}.footer h4{margin-bottom:12px}.footer a,.footer p{display:block;color:#b8c7da;margin:8px 0;font-size:14px}.legal-ft{border-top:1px solid rgba(255,255,255,.12);margin-top:32px;padding-top:20px;color:#90a2b8;font-size:13px}.lang.is-open .lang-menu{display:grid;grid-template-columns:1fr 1fr;gap:4px}.lang button[aria-expanded="true"]{border-color:var(--blue);color:var(--blue)}.lang-menu a[aria-current="true"]{background:var(--soft);color:var(--blue);font-weight:900}[dir="rtl"] body{text-align:right}[dir="rtl"] .lang-menu{right:auto;left:0}[dir="rtl"] .future-tag{right:auto;left:14px}[dir="rtl"] .road-item h3{padding-right:0;padding-left:60px}@media(max-width:920px){.links a:not(.lang-link){display:none}.grid,.roadmap-grid{grid-template-columns:1fr 1fr}.wallet-grid{grid-template-columns:1fr 1fr}.footer-grid{grid-template-columns:1fr 1fr}}@media(max-width:620px){.grid,.roadmap-grid,.wallet-grid,.footer-grid{grid-template-columns:1fr}.nav{height:auto;padding:16px 0}.brand small{display:none}.cta-box{padding:32px 22px}.lang-menu{right:auto;left:-120px}}
  </style>
</head>
<body>
  <header class="topbar">
    <div class="container nav">
      <a class="brand" href="/" aria-label="EnteleWALLET home">
        <div class="mark">EW</div>
        <div>EnteleWALLET<small data-i18n="brandSubtitle">Secure Web3 Wallet Layer</small></div>
      </a>
      <nav class="links" aria-label="Primary navigation">
        <a href="/" data-i18n="navHome">Home</a>
        <a href="/#features" data-i18n="navFeatures">Features</a>
        <a href="/security" class="active" data-i18n="navSecurity">Security</a>
        <a href="/#ecosystem" data-i18n="navEcosystem">Ecosystem</a>
        <a href="/#roadmap" data-i18n="navRoadmap">Roadmap</a>
        <a href="/#contact" data-i18n="navContact">Contact</a>
        <div class="lang" data-language-picker>
          <button class="lang-toggle" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="language-menu" aria-label="Choose language">
            🌐 <span id="current-language" data-i18n="languageLabel">Language</span>
          </button>
          <div class="lang-menu" id="language-menu" aria-label="Language menu">
            <a href="?lang=en" hreflang="en" data-lang="en">English</a><a href="?lang=tr" hreflang="tr" data-lang="tr">Türkçe</a><a href="?lang=de" hreflang="de" data-lang="de">Deutsch</a><a href="?lang=fr" hreflang="fr" data-lang="fr">Français</a><a href="?lang=it" hreflang="it" data-lang="it">Italiano</a><a href="?lang=es" hreflang="es" data-lang="es">Español</a><a href="?lang=nl" hreflang="nl" data-lang="nl">Nederlands</a><a href="?lang=pl" hreflang="pl" data-lang="pl">Polski</a><a href="?lang=pt" hreflang="pt" data-lang="pt">Português</a><a href="?lang=ro" hreflang="ro" data-lang="ro">Română</a><a href="?lang=sv" hreflang="sv" data-lang="sv">Svenska</a><a href="?lang=da" hreflang="da" data-lang="da">Dansk</a><a href="?lang=fi" hreflang="fi" data-lang="fi">Suomi</a><a href="?lang=cs" hreflang="cs" data-lang="cs">Čeština</a><a href="?lang=sk" hreflang="sk" data-lang="sk">Slovenčina</a><a href="?lang=hu" hreflang="hu" data-lang="hu">Magyar</a><a href="?lang=el" hreflang="el" data-lang="el">Ελληνικά</a><a href="?lang=bg" hreflang="bg" data-lang="bg">Български</a><a href="?lang=ru" hreflang="ru" data-lang="ru">Русский</a><a href="?lang=uk" hreflang="uk" data-lang="uk">Українська</a><a href="?lang=ar" hreflang="ar" data-lang="ar">العربية</a><a href="?lang=zh" hreflang="zh" data-lang="zh">中文</a><a href="?lang=ja" hreflang="ja" data-lang="ja">日本語</a><a href="?lang=ko" hreflang="ko" data-lang="ko">한국어</a><a href="?lang=hi" hreflang="hi" data-lang="hi">हिन्दी</a>
          </div>
        </div>
      </nav>
    </div>
  </header>

  <main>
    <section class="sec-hero">
      <div class="container">
        <div class="eyebrow" data-i18n="secEyebrow">🛡️ EnteleWALLET Security Center</div>
        <h1><span data-i18n="secHeroTitle">Security-first wallet access for the EnteleKRON ecosystem</span></h1>
        <p class="lead" data-i18n="secHeroSubtitle">EnteleWALLET is being built with a security-first approach for wallet verification, ecosystem asset monitoring, and future non-custodial wallet functionality.</p>
      </div>
    </section>

    <section id="domains">
      <div class="container">
        <div class="section-head">
          <h2 data-i18n="secDomainsTitle">Official EnteleWALLET Domains</h2>
          <p data-i18n="secDomainsIntro">Only use the domains listed below when connecting a wallet or signing messages with EnteleWALLET.</p>
        </div>
        <div class="domains-grid">
          <div class="domain-card"><span class="badge" data-i18n="officialLabel">Official</span><br><code>entelewallet.com</code></div>
          <div class="domain-card"><span class="badge" data-i18n="officialLabel">Official</span><br><code>app.entelewallet.com</code></div>
          <div class="domain-card"><span class="badge" data-i18n="officialLabel">Official</span><br><code>entelewallet.app</code></div>
          <div class="domain-card"><span class="badge" data-i18n="officialLabel">Official</span><br><code>entelewallet.org</code></div>
          <div class="domain-card"><span class="badge" data-i18n="officialLabel">Official</span><br><code>wallet.entelekron.io</code></div>
        </div>
        <div class="warning" style="margin-top:24px"><strong>⚠️</strong> <span data-i18n="secDomainsWarning">Always check the domain before connecting a wallet or signing any message.</span></div>
      </div>
    </section>

    <section id="lite-safety">
      <div class="container">
        <div class="section-head"><h2 data-i18n="secLiteTitle">EnteleWALLET Lite Safety</h2></div>
        <div class="list">
          <div class="row"><div class="check">✓</div><div><h3 data-i18n="secLiteNoSeed">EnteleWALLET Lite does not store seed phrases</h3></div></div>
          <div class="row"><div class="check">✓</div><div><h3 data-i18n="secLiteNoKeys">EnteleWALLET Lite does not store private keys</h3></div></div>
          <div class="row"><div class="check">✓</div><div><h3 data-i18n="secLiteNoCustody">EnteleWALLET Lite does not custody funds</h3></div></div>
          <div class="row"><div class="check">✓</div><div><h3 data-i18n="secLiteConnectOnly">EnteleWALLET Lite connects to existing wallets only</h3></div></div>
          <div class="row"><div class="check">✓</div><div><h3 data-i18n="secLiteVerify">Wallet verification uses safe message signatures only</h3></div></div>
        </div>
      </div>
    </section>

    <section id="signatures">
      <div class="container">
        <div class="section-head"><h2 data-i18n="secSignatureTitle">Signature Safety</h2></div>
        <div class="list">
          <div class="row"><div class="check">✓</div><div><h3 data-i18n="secSigOwnership">A valid EnteleWALLET signature must only verify wallet ownership</h3></div></div>
          <div class="row"><div class="check">✗</div><div><h3 data-i18n="secSigNoTransfer">It must not transfer tokens</h3></div></div>
          <div class="row"><div class="check">✗</div><div><h3 data-i18n="secSigNoApprove">It must not approve spending</h3></div></div>
          <div class="row"><div class="check">✗</div><div><h3 data-i18n="secSigNoTx">It must not create a blockchain transaction</h3></div></div>
          <div class="row"><div class="check">✗</div><div><h3 data-i18n="secSigNoGas">It must not cost gas</h3></div></div>
        </div>
        <div class="warning" style="margin-top:24px"><strong>⚠️</strong> <span data-i18n="secSignatureWarning">Never sign messages you do not understand.</span></div>
      </div>
    </section>

    <section id="seed-warning">
      <div class="container danger">
        <h3 data-i18n="secSeedTitle">Seed Phrase and Private Key Warning</h3>
        <p data-i18n="secSeedIntro">EnteleWALLET, EnteleKRON, TVK Group, TVK Labs, SOVRA, support staff, admins, partners, or community moderators will never ask for:</p>
        <ul>
          <li data-i18n="secSeedPhrase">seed phrase</li>
          <li data-i18n="secSeedPrivateKey">private key</li>
          <li data-i18n="secSeedRecovery">recovery phrase</li>
          <li data-i18n="secSeedPassword">wallet password</li>
          <li data-i18n="secSeedRemote">remote access to your computer</li>
          <li data-i18n="secSeedPayment">payment through social media messages</li>
        </ul>
      </div>
    </section>

    <section id="wallets">
      <div class="container">
        <div class="section-head">
          <h2 data-i18n="secWalletsTitle">Supported Wallets</h2>
          <p data-i18n="secWalletsIntro">EnteleWALLET Lite connects to established wallet providers. Always verify you are using the official wallet application or extension.</p>
        </div>
        <div class="wallet-grid">
          <div class="wallet-item">MetaMask</div>
          <div class="wallet-item">Rabby</div>
          <div class="wallet-item">WalletConnect wallets</div>
          <div class="wallet-item">Coinbase Wallet</div>
          <div class="wallet-item">Trust Wallet</div>
          <div class="wallet-item">Rainbow</div>
          <div class="wallet-item">Ledger (supported routes)</div>
        </div>
      </div>
    </section>

    <section id="verification">
      <div class="container verify-box">
        <h2 data-i18n="secVerifyTitle">Official Address Verification</h2>
        <p data-i18n="secVerifyText">Use the Transparency Center to verify official contracts, treasury wallets, presale wallets, and ecosystem addresses.</p>
        <a class="btn secondary" href="https://entelekron.io/transparency" target="_blank" rel="noopener noreferrer" data-i18n="secVerifyLink">Visit Transparency Center</a>
      </div>
    </section>

    <section id="phishing">
      <div class="container">
        <div class="section-head"><h2 data-i18n="secPhishingTitle">Phishing Protection</h2></div>
        <div class="list">
          <div class="row"><div class="check">✓</div><div><h3 data-i18n="secPhishSocial">Never trust payment addresses sent by Telegram, Discord, X, Instagram, or email</h3></div></div>
          <div class="row"><div class="check">✓</div><div><h3 data-i18n="secPhishDashboard">Always verify payment instructions inside the official investor dashboard</h3></div></div>
          <div class="row"><div class="check">✓</div><div><h3 data-i18n="secPhishExtensions">Never install fake wallet extensions</h3></div></div>
          <div class="row"><div class="check">✓</div><div><h3 data-i18n="secPhishBookmark">Bookmark the official domains listed on this page</h3></div></div>
          <div class="row"><div class="check">✓</div><div><h3 data-i18n="secPhishSSL">Verify SSL/HTTPS before entering wallet credentials</h3></div></div>
          <div class="row"><div class="check">✓</div><div><h3 data-i18n="secPhishSearch">Avoid sponsored search-result links for wallet access</h3></div></div>
        </div>
      </div>
    </section>

    <section id="roadmap">
      <div class="container">
        <div class="section-head">
          <h2 data-i18n="secRoadmapTitle">Future EnteleWALLET Security Roadmap</h2>
          <p data-i18n="secRoadmapIntro">These capabilities are planned for future EnteleWALLET releases. They are not active today.</p>
        </div>
        <div class="roadmap-grid">
          <div class="road-item"><span class="future-tag" data-i18n="secFutureLabel">Future</span><h3 data-i18n="secRoadOwnership">Wallet ownership verification</h3></div>
          <div class="road-item"><span class="future-tag" data-i18n="secFutureLabel">Future</span><h3 data-i18n="secRoadPortfolio">Portfolio monitoring</h3></div>
          <div class="road-item"><span class="future-tag" data-i18n="secFutureLabel">Future</span><h3 data-i18n="secRoadTxWarnings">Transaction warnings</h3></div>
          <div class="road-item"><span class="future-tag" data-i18n="secFutureLabel">Future</span><h3 data-i18n="secRoadApproval">Malicious approval warnings</h3></div>
          <div class="road-item"><span class="future-tag" data-i18n="secFutureLabel">Future</span><h3 data-i18n="secRoadHardware">Hardware wallet support</h3></div>
          <div class="road-item"><span class="future-tag" data-i18n="secFutureLabel">Future</span><h3 data-i18n="secRoadSimulation">Transaction simulation</h3></div>
          <div class="road-item"><span class="future-tag" data-i18n="secFutureLabel">Future</span><h3 data-i18n="secRoadSmartAccount">Smart account support</h3></div>
          <div class="road-item"><span class="future-tag" data-i18n="secFutureLabel">Future</span><h3 data-i18n="secRoadRecovery">Recovery architecture</h3></div>
          <div class="road-item"><span class="future-tag" data-i18n="secFutureLabel">Future</span><h3 data-i18n="secRoadAudits">Independent security audits</h3></div>
          <div class="road-item"><span class="future-tag" data-i18n="secFutureLabel">Future</span><h3 data-i18n="secRoadBugBounty">Bug bounty program</h3></div>
        </div>
      </div>
    </section>

    <section id="contact" class="cta">
      <div class="container cta-box">
        <h2 data-i18n="secContactTitle">Contact / Report a Security Issue</h2>
        <p data-i18n="secContactIntro">If you discover a vulnerability, phishing site, or impersonation attempt, report it to our security team.</p>
        <a class="btn secondary" href="mailto:security@tvk.group" data-i18n="secContactCTA">Report a Security Concern</a>
        <p style="margin-top:18px;font-size:14px;color:#d4e8ff">security@tvk.group</p>
      </div>
    </section>

    <section id="legal">
      <div class="container legal-box">
        <h3 data-i18n="secLegalTitle">Legal / Risk Notice</h3>
        <p data-i18n="secLegalText">EnteleWALLET Lite is a wallet connection and verification interface. It does not custody funds, store seed phrases, provide investment advice, or guarantee token value, liquidity, listing, or returns.</p>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div><h3>EnteleWALLET</h3><p data-i18n="brandSubtitle">Secure Web3 Wallet Layer</p></div>
        <div><h4 data-i18n="footerProduct">Product</h4><a href="/#features" data-i18n="navFeatures">Features</a><a href="/security" data-i18n="navSecurity">Security</a><a href="/#roadmap" data-i18n="navRoadmap">Roadmap</a></div>
        <div><h4 data-i18n="footerEcosystem">Ecosystem</h4><a href="https://tvk.group" target="_blank" rel="noopener noreferrer">TVK Group</a><a href="/#ecosystem" data-i18n="footerModules">Entelekron Modules</a><a href="https://entelekron.io/transparency" target="_blank" rel="noopener noreferrer" data-i18n="secVerifyLink">Visit Transparency Center</a></div>
        <div><h4 data-i18n="footerContact">Contact</h4><a href="mailto:security@tvk.group">security@tvk.group</a><a href="mailto:contact@entelewallet.com">contact@entelewallet.com</a><a href="mailto:security@entelewallet.com">security@entelewallet.com</a></div>
      </div>
      <div class="legal-ft">© 2026 EnteleWALLET. A TVK Labs ecosystem project. All rights reserved.</div>
    </div>
  </footer>

  <script>
    (() => {
      const keys = "KEYS_PLACEHOLDER".split("|");
'''

HTML_TAIL = '''
      const languageNames = LANG_NAMES_PLACEHOLDER;
      const aliases = { "zh-cn":"zh", "zh-hans":"zh" };
      const base = rows.en.split("|");
      const translations = Object.fromEntries(Object.entries(rows).map(([code, row]) => {
        const values = row.split("|");
        return [code, Object.fromEntries(keys.map((key, index) => [key, values[index] || base[index] || ""]))];
      }));

      const picker = document.querySelector("[data-language-picker]");
      const toggle = picker?.querySelector(".lang-toggle");
      const currentLanguage = document.querySelector("#current-language");
      const links = [...document.querySelectorAll("[data-lang]")];
      const storageKey = "entelewallet-language";

      const getRequestedLanguage = () => {
        const params = new URLSearchParams(window.location.search);
        const requested = (params.get("lang") || localStorage.getItem(storageKey) || "en").toLowerCase();
        return aliases[requested] || (translations[requested] ? requested : "en");
      };

      const closeMenu = () => {
        picker?.classList.remove("is-open");
        toggle?.setAttribute("aria-expanded", "false");
      };

      const applyLanguage = (code, updateUrl = true) => {
        const lang = translations[code] ? code : "en";
        const copy = translations[lang];
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        document.title = copy.pageTitle;
        document.querySelector('meta[name="description"]')?.setAttribute("content", copy.metaDescription);
        document.querySelector('meta[property="og:title"]')?.setAttribute("content", copy.ogTitle);
        document.querySelector('meta[property="og:description"]')?.setAttribute("content", copy.ogDescription);
        document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", copy.ogTitle);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", copy.ogDescription);
        document.querySelectorAll("[data-i18n]").forEach((node) => {
          const key = node.dataset.i18n;
          if (copy[key]) node.textContent = copy[key];
        });
        if (currentLanguage) currentLanguage.textContent = languageNames[lang];
        links.forEach((link) => link.setAttribute("aria-current", String(link.dataset.lang === lang)));
        localStorage.setItem(storageKey, lang);
        if (updateUrl) {
          const url = new URL(window.location.href);
          url.searchParams.set("lang", lang);
          window.history.pushState({ lang }, "", url);
        }
      };

      toggle?.addEventListener("click", () => {
        const isOpen = picker.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });
      toggle?.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          picker.classList.add("is-open");
          toggle.setAttribute("aria-expanded", "true");
        }
        if (event.key === "Escape") closeMenu();
      });
      links.forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          applyLanguage(link.dataset.lang);
          closeMenu();
          toggle?.focus();
        });
      });
      document.addEventListener("click", (event) => {
        if (picker && !picker.contains(event.target)) closeMenu();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeMenu();
          if (picker?.contains(document.activeElement)) toggle?.focus();
        }
      });
      window.addEventListener("popstate", () => applyLanguage(getRequestedLanguage(), false));
      applyLanguage(getRequestedLanguage(), false);
    })();
  </script>
</body>
</html>
'''

def main():
    for code in LANG_NAMES:
        if code not in T:
            raise SystemExit(f"Missing translations for {code}")
        missing = [k for k in KEYS if k not in T[code]]
        if missing:
            raise SystemExit(f"{code} missing keys: {missing}")

    lang_names_js = "{" + ",".join(f'{k}:"{v}"' for k,v in LANG_NAMES.items()) + "}"
    html = HTML_HEAD.replace("KEYS_PLACEHOLDER", keys_js())
    html += js_rows() + "\n"
    html += HTML_TAIL.replace("LANG_NAMES_PLACEHOLDER", lang_names_js)

    out = "/workspace/security.html"
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Wrote {out} ({len(html)} bytes)")

if __name__ == "__main__":
    main()
