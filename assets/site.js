(() => {
  const RTL_LANGS = new Set(["ar", "fa", "ur"]);
  const ALIASES = { "zh-cn": "zh", "zh-hans": "zh" };
  const STORAGE_KEY = "entelewallet-language";

  const translations = window.__ENTELE_I18N__ || {};
  const pageMeta = window.__ENTELE_PAGE_META__ || "home";

  function get(obj, path) {
    return path.split(".").reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
  }

  function flatten(obj, prefix = "") {
    const out = {};
    for (const [key, value] of Object.entries(obj || {})) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        Object.assign(out, flatten(value, path));
      } else {
        out[path] = value;
      }
    }
    return out;
  }

  const flatByLang = Object.fromEntries(
    Object.entries(translations).map(([code, tree]) => [code, flatten(tree)]),
  );

  const picker = document.querySelector("[data-language-picker]");
  const toggle = picker?.querySelector(".lang-toggle");
  const currentLanguage = document.querySelector("#current-language");
  const links = [...document.querySelectorAll("[data-lang]")];

  function getRequestedLanguage() {
    const params = new URLSearchParams(window.location.search);
    const requested = (params.get("lang") || localStorage.getItem(STORAGE_KEY) || "en").toLowerCase();
    return ALIASES[requested] || (flatByLang[requested] ? requested : "en");
  }

  function closeMenu() {
    picker?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  }

  function setMeta(tree) {
    const meta = get(tree, `meta.${pageMeta}`) || {};
    const title = meta.title || document.title;
    const description = meta.description || "";
    const ogTitle = meta.ogTitle || title;
    const ogDescription = meta.ogDescription || description;

    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", ogTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", ogDescription);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", ogTitle);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", ogDescription);
  }

  function applyLanguage(code, updateUrl = true) {
    const lang = flatByLang[code] ? code : "en";
    const copy = flatByLang[lang];
    const tree = translations[lang] || translations.en || {};

    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.has(lang) ? "rtl" : "ltr";

    setMeta(tree);

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.dataset.i18n;
      const value = copy[key];
      if (value != null && value !== "") {
        node.textContent = value;
      }
    });

    const langName = copy["common.languageLabel"];
    const languages = window.__ENTELE_LANGUAGES__ || [];
    const match = languages.find((l) => l.code === lang);
    if (currentLanguage) {
      currentLanguage.textContent = match?.name || lang.toUpperCase();
    }

    links.forEach((link) => link.setAttribute("aria-current", String(link.dataset.lang === lang)));
    localStorage.setItem(STORAGE_KEY, lang);

    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", lang);
      window.history.pushState({ lang }, "", url);
    }
  }

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

  async function initNetworkNav() {
    const nav = document.querySelector("[data-network-nav]");
    const main = document.querySelector("[data-networks-main]");
    if (!nav || !main) return;

    try {
      const res = await fetch("/data/chain-registry.json", { cache: "no-store" });
      if (!res.ok) return;
      const registry = await res.json();
      const cards = main.querySelectorAll(".network-card");
      const count = (registry.chains?.length || 0) + (registry.tvkModules?.length || 0);
      const countEl = nav.querySelector("[data-network-count]");
      if (countEl) countEl.textContent = String(count);

      if (cards.length < count) {
        console.warn(
          `[EnteleWALLET] Network page shows ${cards.length}/${count} entries — registry may be newer than cached HTML. Hard refresh or redeploy.`,
        );
      }
    } catch (err) {
      console.warn("[EnteleWALLET] Could not validate network registry:", err);
    }
  }

  initNetworkNav();
})();
