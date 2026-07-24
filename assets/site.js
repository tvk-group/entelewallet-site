(() => {
  const RTL_LANGS = new Set(["ar"]);
  const LANG_PREFIX_RE = /^\/([a-z]{2})(\/|$)/;

  const pageMeta = window.__ENTELE_PAGE_META__ || "home";
  const languages = window.__ENTELE_LANGUAGES__ || [];

  const picker = document.querySelector("[data-language-picker]");
  const toggle = picker?.querySelector(".lang-toggle");
  const langMenu = picker?.querySelector(".lang-menu");

  function detectLangFromPath() {
    const match = window.location.pathname.match(LANG_PREFIX_RE);
    if (!match) return "en";
    const code = match[1];
    return languages.some((l) => l.code === code) ? code : "en";
  }

  function detectPagePath() {
    const pathname = window.location.pathname.replace(/\/$/, "") || "/";
    const match = pathname.match(LANG_PREFIX_RE);
    const stripped = match ? pathname.replace(LANG_PREFIX_RE, "/").replace(/^\/\//, "/") : pathname;
    return stripped === "" ? "/" : stripped;
  }

  function closeMenu() {
    picker?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  }

  function redirectLegacyQueryLang() {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("lang");
    if (!requested) return;
    const code = requested.toLowerCase();
    if (!languages.some((l) => l.code === code)) return;
    const pagePath = detectPagePath();
    const targetPath = code === "en" ? pagePath : pagePath === "/" ? `/${code}` : `/${code}${pagePath}`;
    const url = new URL(window.location.href);
    url.searchParams.delete("lang");
    url.pathname = targetPath;
    window.location.replace(url.toString());
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
      langMenu?.querySelector("a")?.focus();
    }
    if (event.key === "Escape") closeMenu();
  });

  langMenu?.addEventListener("keydown", (event) => {
    const items = [...langMenu.querySelectorAll("a")];
    const index = items.indexOf(document.activeElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      items[(index + 1) % items.length]?.focus();
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    }
    if (event.key === "Escape") {
      closeMenu();
      toggle?.focus();
    }
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

  const lang = detectLangFromPath();
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL_LANGS.has(lang) ? "rtl" : "ltr";

  redirectLegacyQueryLang();

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
