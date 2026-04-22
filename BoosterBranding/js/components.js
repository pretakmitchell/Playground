const BoosterConfig = {
  colours: {
    deep: "#2F1742",
    purple: "#53286E",
    lilac: "#D089FF",
    neon: "#E11FFA",
    emphasis: "#EEEAF4",
    grey: "#F2F2F2",
    grey5: "#DFDFDF",
    white: "#FFFFFF",
    black: "#000000"
  },
  colourNames: {
    deep: "Deep Purple",
    purple: "Booster Purple",
    lilac: "Lilac",
    neon: "Neon",
    emphasis: "Subtle Lilac",
    grey: "Grey 2",
    grey5: "Grey 5",
    white: "White",
    black: "Black"
  },
  assets: {
    wordmarkSvg: "brand-assets/logos/svg/wordmark-main.svg",
    wordmarkPng: "brand-assets/logos/wordmark-main.png",
    iconSvg: "brand-assets/logos/svg/icon-main.svg",
    iconPng: "brand-assets/logos/icon-main.png",
    fullWordmarkSvg: "brand-assets/logos/svg/wordmark-full.svg",
    fullWordmarkPng: "brand-assets/logos/wordmark-full.png",
    comboSvg: "brand-assets/logos/lockups/wordmark-icon.svg",
    legalSvg: "brand-assets/logos/lockups/legal.svg",
    heroTwoCups: "brand-assets/images/two-cups.png",
    cheers: "brand-assets/images/cheers.png",
    cup: "brand-assets/images/cup.jpg",
    holdingCup: "brand-assets/images/holding-cup.jpg",
    bagCup: "brand-assets/images/bag-cup.jpg",
    bagsWrap: "brand-assets/images/two-bags-wrap.jpg",
    generatedCup: "brand-assets/images/generated/booster_cup_wrap_1776116781883.png",
    generatedTote: "brand-assets/images/generated/booster_tote_mockup_1776116766320.png",
    generatedApp: "brand-assets/images/generated/booster_ui_app_1776116752479.png"
  },
  validLogoCombos: {
    black: ["white", "lilac", "neon", "purple", "emphasis", "grey"],
    deep: ["white", "lilac", "neon", "purple"],
    purple: ["deep", "lilac", "neon", "emphasis", "grey", "white", "black"],
    lilac: ["deep", "purple", "emphasis", "grey", "white", "black"],
    neon: ["deep", "purple", "emphasis", "grey", "white", "black"],
    emphasis: ["deep", "purple", "lilac", "neon", "black"],
    grey: ["deep", "purple", "lilac", "neon", "black"],
    white: ["deep", "purple", "lilac", "neon", "black"]
  },
  cautionCombos: [
    {
      bg: "black",
      logo: "purple",
      message: "Booster Purple is permitted on black, but it has less snap than white, lilac, or neon. Keep it for controlled applications where the mark is large."
    },
    {
      bg: "deep",
      logo: "purple",
      message: "Booster Purple over Deep Purple is permitted only when the mark is oversized or supported by strong lighting/contrast around it."
    },
    {
      bg: "purple",
      logo: "neon",
      message: "Neon on Booster Purple is high-energy but visually loud. Use it sparingly for campaign moments rather than core identity applications."
    }
  ]
};

class TopNav extends HTMLElement {
  connectedCallback() {
    const activePath = window.location.pathname.split("/").filter(Boolean).pop() || "index.html";
    const links = [
      ["index.html", "Brand"],
      ["strategy.html", "Strategy"],
      ["voice.html", "Voice"],
      ["visuals.html", "Visuals"],
      ["gallery.html", "Gallery"]
    ];

    this.innerHTML = `
      <header class="top-nav-wrap">
        <div class="progressive-blur progressive-blur-nav" aria-hidden="true">
          <div class="blur-filter"></div>
          <div class="blur-filter"></div>
          <div class="blur-filter"></div>
          <div class="blur-filter"></div>
          <div class="blur-filter"></div>
          <div class="blur-filter"></div>
          <div class="blur-filter"></div>
          <div class="blur-filter"></div>
          <div class="blur-filter"></div>
          <div class="blur-filter"></div>
          <div class="blur-filter"></div>
          <div class="blur-filter"></div>
          <div class="blur-filter"></div>
          <div class="blur-filter"></div>
          <div class="blur-filter"></div>
          <div class="blur-filter"></div>
          <div class="gradient"></div>
        </div>
        <nav class="top-nav" aria-label="Primary">
          <a class="nav-logo" href="index.html" aria-label="Booster guidelines home">
            <img src="${BoosterConfig.assets.wordmarkSvg}" alt="Booster">
          </a>
          <div class="nav-links" id="site-nav-links">
            ${links.map(([href, label]) => `
              <a class="nav-link ${activePath === href ? "active" : ""}" href="${href}">${label}</a>
            `).join("")}
          </div>
          <a class="nav-action" href="attributions.html">Process & Attributions</a>
          <button class="nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false" aria-controls="site-nav-links"><span></span></button>
        </nav>
      </header>
    `;

    const toggle = this.querySelector(".nav-toggle");
    toggle?.addEventListener("click", () => {
      const open = !document.body.classList.contains("nav-open");
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });

    this.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        document.body.classList.remove("nav-open");
        toggle?.setAttribute("aria-expanded", "false");
      });
    });

  }
}

customElements.define("top-nav", TopNav);

class ProgressNav {
  constructor() {
    this.sections = Array.from(document.querySelectorAll("section[data-section-title]"));
    if (!this.sections.length) return;
    this.activeIndex = 0;
    this.open = false;
    this.ticking = false;
    this.render();
    this.bind();
    this.update();
  }

  render() {
    this.blurWrap = document.createElement("div");
    this.blurWrap.className = "progress-blur-wrap";
    this.blurWrap.innerHTML = `
      <div class="progressive-blur progressive-blur-progress" aria-hidden="true">
        <div class="blur-filter"></div>
        <div class="blur-filter"></div>
        <div class="blur-filter"></div>
        <div class="blur-filter"></div>
        <div class="blur-filter"></div>
        <div class="blur-filter"></div>
        <div class="blur-filter"></div>
        <div class="blur-filter"></div>
        <div class="blur-filter"></div>
        <div class="blur-filter"></div>
        <div class="gradient"></div>
      </div>
    `;

    this.wrap = document.createElement("div");
    this.wrap.className = "progress-wrap";
    this.wrap.innerHTML = `
      <p class="progress-hint">Click To expand</p>
      <nav class="progress-navigator" aria-label="Section progress">
        ${this.sections.map((section, index) => this.sectionButton(section, index)).join("")}
      </nav>
      <div class="progress-menu" aria-hidden="true">
        ${this.sections.map((section, index) => this.menuGroup(section, index)).join("")}
      </div>
    `;

    document.body.appendChild(this.blurWrap);
    document.body.appendChild(this.wrap);
    this.nav = this.wrap.querySelector(".progress-navigator");
    this.menu = this.wrap.querySelector(".progress-menu");
    this.buttons = Array.from(this.wrap.querySelectorAll("[data-progress-index]"));
    this.fill = this.wrap.querySelector(".active-progress-fill");
  }

  sectionButton(section, index) {
    const label = section.dataset.sectionTitle || `Section ${index + 1}`;
    return `
      <button class="progress-dot" type="button" data-progress-index="${index}" aria-label="${label}">
        <span class="active-progress-fill" aria-hidden="true"></span>
        <span class="progress-label">${label}</span>
      </button>
    `;
  }

  menuGroup(section, index) {
    const label = section.dataset.sectionTitle || `Section ${index + 1}`;
    const subsections = Array.from(section.querySelectorAll(".subsection-heading"));
    return `
      <div class="progress-menu-group" data-menu-index="${index}">
        <button class="progress-menu-section" type="button" data-jump-section="${index}">${label}</button>
        <div class="progress-menu-links">
          ${subsections.map((heading, subIndex) => {
            if (!heading.id) heading.id = `progress-${index}-${subIndex}`;
            return `<button type="button" data-jump-target="${heading.id}">${heading.textContent.trim()}</button>`;
          }).join("")}
        </div>
      </div>
    `;
  }

  bind() {
    this.buttons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const index = Number(button.dataset.progressIndex);
        if (index !== this.activeIndex) {
          this.scrollToSection(index);
          this.setOpen(true);
          return;
        }
        this.setOpen(!this.open);
      });
    });

    this.nav.addEventListener("click", () => {
      this.setOpen(!this.open);
    });

    this.wrap.querySelectorAll("[data-jump-section]").forEach((button) => {
      button.addEventListener("click", () => {
        this.scrollToSection(Number(button.dataset.jumpSection));
        this.setOpen(false);
      });
    });

    this.wrap.querySelectorAll("[data-jump-target]").forEach((button) => {
      button.addEventListener("click", () => {
        document.getElementById(button.dataset.jumpTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
        this.setOpen(false);
      });
    });

    document.addEventListener("click", (event) => {
      if (!this.wrap.contains(event.target)) this.setOpen(false);
    });

    this.scheduleUpdate = this.scheduleUpdate.bind(this);
    window.addEventListener("scroll", this.scheduleUpdate, { passive: true });
    window.addEventListener("resize", this.scheduleUpdate);
  }

  scheduleUpdate() {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.ticking = false;
      this.update();
    });
  }

  update() {
    // Visibility logic: only show progress bar once scrolled more than 50px
    const isVisible = window.scrollY > 50;
    this.wrap.classList.toggle("visible", isVisible);
    this.blurWrap.classList.toggle("visible", isVisible);

    const viewportAnchor = window.innerHeight * 0.38;
    let nextIndex = 0;

    this.sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= viewportAnchor) nextIndex = index;
    });

    this.activeIndex = nextIndex;
    const progress = this.sectionProgress(this.sections[this.activeIndex]);

    this.buttons.forEach((button, index) => {
      const active = index === this.activeIndex;
      button.classList.toggle("active", active);
      button.classList.toggle("completed", index < this.activeIndex);
      button.setAttribute("aria-current", active ? "true" : "false");
      const fill = button.querySelector(".active-progress-fill");
      if (fill) fill.style.setProperty("--section-progress", `${active ? progress * 100 : 0}%`);
    });

    this.wrap.querySelectorAll("[data-menu-index]").forEach((group) => {
      group.classList.toggle("active", Number(group.dataset.menuIndex) === this.activeIndex);
    });
  }

  sectionProgress(section) {
    if (!section) return 0;
    const rect = section.getBoundingClientRect();
    const start = window.innerHeight * 0.32;
    const end = Math.min(-rect.height + window.innerHeight * 0.7, start - 1);
    const raw = (start - rect.top) / (start - end);
    return Math.max(0, Math.min(1, raw));
  }

  scrollToSection(index) {
    this.sections[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  setOpen(open) {
    this.open = open;
    this.wrap.classList.toggle("open", open);
    if (open) this.wrap.classList.add("hint-hidden");
    this.menu?.setAttribute("aria-hidden", String(!open));
  }
}

class LogoColourSwitcher extends HTMLElement {
  constructor() {
    super();
    this.bg = "purple";
    this.logo = "white";
    this.accentOn = true;
    this.lockup = "wordmark";
    this.lockups = {
      wordmark: {
        label: "Wordmark",
        source: BoosterConfig.assets.wordmarkSvg,
        fallback: BoosterConfig.assets.wordmarkPng
      },
      icon: {
        label: "Icon",
        source: BoosterConfig.assets.iconSvg,
        fallback: BoosterConfig.assets.iconPng
      },
      full: {
        label: "Full Wordmark",
        source: BoosterConfig.assets.fullWordmarkSvg,
        fallback: BoosterConfig.assets.fullWordmarkPng
      },
      combo: {
        label: "Wordmark + Logo",
        source: BoosterConfig.assets.comboSvg,
        fallback: BoosterConfig.assets.comboSvg
      },
      legal: {
        label: "Legal Lockup",
        source: BoosterConfig.assets.legalSvg,
        fallback: BoosterConfig.assets.legalSvg
      }
    };
    this.svgCache = new Map();
  }

  connectedCallback() {
    this.render();
    this.bind();
    this.update();
  }

  render() {
    const bgKeys = ["deep", "purple", "lilac", "neon", "emphasis", "grey", "white", "black"];
    const logoKeys = ["deep", "purple", "lilac", "neon", "emphasis", "grey", "white", "black"];

    this.innerHTML = `
      <div class="sw-dropdowns">
        <div class="sw-dropdown" data-dropdown="lockup">
          <p class="label small">Lockup</p>
          <button class="sw-trigger" type="button" aria-expanded="false">
            <span class="val-img" data-trigger="lockup-img"><img src="${this.lockups[this.lockup].fallback}" alt=""></span>
            <span class="val-text" data-trigger="lockup-label">${this.lockups[this.lockup].label}</span>
            <svg class="chevron" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z" fill="currentColor"/></svg>
          </button>
          <div class="sw-menu">
            ${Object.entries(this.lockups).map(([key, item]) => `
              <button class="lockup-thumb ${this.lockup === key ? "active" : ""}" type="button" data-lockup="${key}">
                <span class="thumb-art"><img src="${item.fallback}" alt=""></span>
                <span class="label small">${item.label}</span>
              </button>
            `).join("")}
          </div>
        </div>

        <div class="sw-dropdown" data-dropdown="bg">
          <p class="label small">Background Colour</p>
          <button class="sw-trigger" type="button" aria-expanded="false">
            <span class="val-swatch" data-trigger="bg-swatch" style="background:${BoosterConfig.colours[this.bg]}"></span>
            <span class="val-text" data-trigger="bg-label">${BoosterConfig.colourNames[this.bg]}</span>
            <svg class="chevron" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z" fill="currentColor"/></svg>
          </button>
          <div class="sw-menu">
            <div class="switch-row" data-bg-options>
              ${bgKeys.map((key) => this.swatchButton("bg", key)).join("")}
            </div>
          </div>
        </div>

        <div class="sw-dropdown" data-dropdown="logo">
          <p class="label small">Logo / Emphasis</p>
          <button class="sw-trigger" type="button" aria-expanded="false">
            <span class="val-swatch" data-trigger="logo-swatch" style="background:${BoosterConfig.colours[this.logo]}"></span>
            <span class="val-text" data-trigger="logo-label">${BoosterConfig.colourNames[this.logo]}</span>
            <svg class="chevron" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z" fill="currentColor"/></svg>
          </button>
          <div class="sw-menu" style="min-width:280px;">
            <p class="label small" style="margin-bottom:14px;">Primary Logo Colour</p>
            <div class="switch-row" data-logo-options>
              ${logoKeys.map((key) => this.swatchButton("logo", key)).join("")}
            </div>
            <hr class="sw-divider">
            <div class="sw-emphasis-row">
              <p class="label small">Emphasis (Two-Tone)</p>
              <div class="accent-toggle" style="width:110px; height:42px;">
                <button type="button" data-accent="on" style="height:100%; border-radius:10px;">On</button>
                <button type="button" data-accent="off" style="height:100%; border-radius:10px;">Off</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="switcher-note">
        <p class="body-copy">The interface automatically restricts invalid colour combinations to maintain brand accessibility and contrast.</p>
      </div>

      <div class="switcher-preview" data-preview>
        <div class="caution-banner" aria-hidden="true" style="display:none;">
          <div class="caution-trigger">
            <span class="caution-icon">⚠️</span> <span class="caution-text">Combo Not Recommended</span>
          </div>
          <div class="caution-tooltip">
            <p data-caution-copy>This specific combination is generally not recommended for optimal contrast or brand expression.</p>
            <p class="small-disclaimer" style="margin-top:8px; opacity:0.8; font-size:12px;">While not recommended, it is permitted for specialized applications. Only strictly forbidden combinations are disabled.</p>
          </div>
        </div>
        <div class="switch-svg" data-svg-stage aria-label="Live logo preview"></div>
        <a class="download-combo" href="${this.lockups[this.lockup].source}" download>Download this Combo</a>
      </div>
    `;
  }

  swatchButton(kind, key) {
    const colour = BoosterConfig.colours[key];
    const light = ["white", "grey", "emphasis"].includes(key) ? " light" : "";
    const active = (kind === "bg" && this.bg === key) || (kind === "logo" && this.logo === key);
    return `<button class="sw-btn ${active ? "active" : ""}${light}" type="button" data-${kind}="${key}" style="background:${colour}" aria-label="${BoosterConfig.colourNames[key]}"></button>`;
  }

  bind() {
    this.addEventListener("click", (e) => {
      const trigger = e.target.closest('.sw-trigger');
      if (trigger) {
        const dropdown = trigger.closest('.sw-dropdown');
        const isMobile = window.innerWidth <= 840;
        const expanding = !dropdown.classList.contains("open");
        
        this.closeAllDropdowns();
        
        if (expanding) {
          dropdown.classList.add("open");
          trigger.setAttribute("aria-expanded", "true");
          
          if (isMobile) {
            // Smoothly scroll the expanded box into view on mobile
            setTimeout(() => {
              dropdown.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 300);
          }
        }
      }
    });

    // Close on outside click for desktop
    document.addEventListener("click", (e) => {
      if (!this.contains(e.target) && window.innerWidth > 840) {
        this.closeAllDropdowns();
      }
    });

    this.querySelectorAll("[data-lockup]").forEach((button) => {
      button.addEventListener("click", () => {
        this.lockup = button.dataset.lockup;
        this.update();
      });
    });

    this.querySelectorAll("[data-bg]").forEach((button) => {
      button.addEventListener("click", () => {
        this.bg = button.dataset.bg;
        this.resetAccentOnNextUpdate = true;
        this.update();
      });
    });

    this.querySelectorAll("[data-logo]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.disabled) return;
        this.logo = button.dataset.logo;
        this.resetAccentOnNextUpdate = true;
        this.update();
      });
    });

    this.querySelectorAll("[data-accent]").forEach((button) => {
      button.addEventListener("click", () => {
        this.accentOn = button.dataset.accent === "on";
        this.update();
      });
    });
  }

  closeAllDropdowns() {
    this.querySelectorAll('.sw-dropdown.open').forEach(d => {
      d.classList.remove('open');
      d.querySelector('.sw-trigger')?.setAttribute("aria-expanded", "false");
    });
  }

  validLogosFor(bg = this.bg) {
    return BoosterConfig.validLogoCombos[bg] || [];
  }

  preferredLogoFor(bg = this.bg) {
    const valid = this.validLogosFor(bg);
    if (valid.includes("white")) return "white";
    if (valid.includes("deep")) return "deep";
    return valid[0] || "white";
  }

  normalizeSelection(resetAccent = false) {
    const valid = this.validLogosFor();
    if (!valid.includes(this.logo)) {
      this.logo = this.preferredLogoFor();
      resetAccent = true;
    }

    if (resetAccent) {
      this.accentOn = true;
    }
  }

  cautionForPair() {
    return BoosterConfig.cautionCombos.find((combo) => combo.bg === this.bg && combo.logo === this.logo);
  }

  async update() {
    const preview = this.querySelector("[data-preview]");
    const stage = this.querySelector("[data-svg-stage]");
    const download = this.querySelector(".download-combo");
    if (!preview || !stage) return;

    this.normalizeSelection(this.resetAccentOnNextUpdate);
    this.resetAccentOnNextUpdate = false;

    preview.classList.toggle("is-icon", this.lockup === "icon");
    preview.style.background = BoosterConfig.colours[this.bg];
    download?.setAttribute("href", this.lockups[this.lockup].source);
    
    // Caution logic
    const caution = this.cautionForPair();
    const cautionBanner = this.querySelector(".caution-banner");
    if (cautionBanner) {
      cautionBanner.style.display = caution ? "flex" : "none";
      cautionBanner.setAttribute("aria-hidden", String(!caution));
      const cautionCopy = cautionBanner.querySelector("[data-caution-copy]");
      if (cautionCopy && caution) cautionCopy.textContent = caution.message;
    }

    const lockupImg = this.querySelector("[data-trigger='lockup-img'] img");
    const lockupLabel = this.querySelector("[data-trigger='lockup-label']");
    if (lockupImg) lockupImg.src = this.lockups[this.lockup].fallback;
    if (lockupLabel) lockupLabel.textContent = this.lockups[this.lockup].label;

    const bgSwatch = this.querySelector("[data-trigger='bg-swatch']");
    const bgLabel = this.querySelector("[data-trigger='bg-label']");
    if (bgSwatch) {
      bgSwatch.style.background = BoosterConfig.colours[this.bg];
      bgSwatch.className = `val-swatch ${["white", "grey", "emphasis"].includes(this.bg) ? "light" : ""}`;
    }
    if (bgLabel) bgLabel.textContent = BoosterConfig.colourNames[this.bg];

    const logoSwatch = this.querySelector("[data-trigger='logo-swatch']");
    const logoLabel = this.querySelector("[data-trigger='logo-label']");
    if (logoSwatch) {
      logoSwatch.style.background = BoosterConfig.colours[this.logo];
      logoSwatch.className = `val-swatch ${["white", "grey", "emphasis"].includes(this.logo) ? "light" : ""}`;
    }
    if (logoLabel) logoLabel.textContent = BoosterConfig.colourNames[this.logo];

    this.querySelectorAll("[data-lockup]").forEach((button) => {
      button.classList.toggle("active", button.dataset.lockup === this.lockup);
    });

    this.querySelectorAll("[data-bg]").forEach((button) => {
      button.classList.toggle("active", button.dataset.bg === this.bg);
    });

    const valid = BoosterConfig.validLogoCombos[this.bg] || [];
    this.querySelectorAll("[data-logo]").forEach((button) => {
      const key = button.dataset.logo;
      button.disabled = !valid.includes(key);
      button.classList.toggle("active", key === this.logo);
    });

    this.querySelectorAll("[data-accent]").forEach((button) => {
      const isOnButton = button.dataset.accent === "on";
      button.disabled = false;
      button.classList.toggle("active", isOnButton === this.accentOn);
    });

    await this.renderSvg(stage);
  }

  accentKey() {
    if (!this.accentOn) return this.logo;

    if (this.bg === "lilac") {
      if (this.logo === "deep" || this.logo === "purple") return "white";
      if (this.logo === "white") return "purple";
      if (this.logo === "black") return "white";
      if (this.logo === "emphasis" || this.logo === "grey") return "purple";
      return this.logo;
    }

    if (this.bg === "neon") {
      if (this.logo === "white") return "deep";
      if (this.logo === "deep" || this.logo === "purple") return "white";
      if (this.logo === "black" || this.logo === "emphasis" || this.logo === "grey") return "deep";
      return "deep";
    }

    if (["emphasis", "grey", "white"].includes(this.bg)) {
      if (this.logo === "neon") return "purple";
      return "neon";
    }

    if (this.bg === "black") {
      if (this.logo === "neon") return "white";
      return "neon";
    }

    if (this.bg === "deep" || this.bg === "purple") {
      if (this.logo === "neon") return "white";
      return "neon";
    }

    return "neon";
  }

  accentColour() {
    return BoosterConfig.colours[this.accentKey()] || BoosterConfig.colours[this.logo];
  }

  async renderSvg(stage) {
    const item = this.lockups[this.lockup];
    const textColour = BoosterConfig.colours[this.logo];
    const accentColour = this.accentColour();

    try {
      let svgText = this.svgCache.get(item.source);
      if (!svgText) {
        const response = await fetch(item.source);
        if (!response.ok) throw new Error(`Unable to load ${item.source}`);
        svgText = await response.text();
        this.svgCache.set(item.source, svgText);
      }

      const parsed = new DOMParser().parseFromString(svgText, "image/svg+xml");
      const svg = parsed.querySelector("svg");
      if (!svg) throw new Error("SVG parse failed");

      const style = svg.querySelector("style") || parsed.createElementNS("http://www.w3.org/2000/svg", "style");
      style.textContent = `.cls-1{fill:${accentColour} !important;}.cls-2{fill:${textColour} !important;}`;
      if (!style.parentElement) svg.prepend(style);
      svg.querySelectorAll(".cls-1").forEach((node) => {
        node.setAttribute("fill", accentColour);
        node.style.setProperty("fill", accentColour, "important");
      });
      svg.querySelectorAll(".cls-2").forEach((node) => {
        node.setAttribute("fill", textColour);
        node.style.setProperty("fill", textColour, "important");
      });
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svg.setAttribute("aria-hidden", "true");
      stage.innerHTML = "";
      stage.appendChild(document.importNode(svg, true));
    } catch (error) {
      stage.innerHTML = `<img class="switch-fallback" src="${item.fallback}" alt="">`;
      const img = stage.querySelector("img");
      if (img) img.style.filter = this.filterForLogo();
    }
  }

  filterForLogo() {
    const filters = {
      white: "brightness(0) invert(1)",
      black: "brightness(0)",
      deep: "brightness(0) saturate(100%) invert(12%) sepia(29%) saturate(1927%) hue-rotate(239deg) brightness(89%) contrast(98%)",
      purple: "none",
      lilac: "brightness(0) saturate(100%) invert(70%) sepia(64%) saturate(2980%) hue-rotate(221deg) brightness(101%) contrast(101%)",
      neon: "brightness(0) saturate(100%) invert(28%) sepia(91%) saturate(4622%) hue-rotate(286deg) brightness(114%) contrast(108%)"
    };
    return filters[this.logo] || "none";
  }
}

customElements.define("logo-colour-switcher", LogoColourSwitcher);

class TypeTester extends HTMLElement {
  connectedCallback() {
    const family = this.getAttribute("family") || "Montserrat";
    const sample = this.getAttribute("sample") || "Type here to preview Booster typography.";
    const weights = (this.getAttribute("weights") || "200,300,400,500,600,700,800,900")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const label = this.getAttribute("label") || family;
    const start = this.getAttribute("start") || weights[0] || "400";

    this.innerHTML = `
      <div class="type-tester">
        <div class="type-header" style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:18px;">
          <p class="label" style="margin:0;">${label}</p>
          <div class="type-actions" style="display:flex; gap:12px; align-items:center;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="label small" style="opacity:0.6;">Size</span>
              <input type="range" class="type-size-slider" min="30" max="120" value="64" style="accent-color: var(--bj-purple); cursor:pointer;">
            </div>
            <button class="type-italic-toggle" type="button" style="border:0; background:var(--bj-white); border-radius:10px; padding:6px 14px; font-family:var(--font-sans); font-style:italic; font-weight:600; font-size:13px; color:var(--bj-purple); transition:all 0.2s;" title="Toggle Italics">I</button>
          </div>
        </div>
        <div class="type-controls">
          ${weights.map((weight) => `
            <button class="type-control ${weight === start ? "active" : ""}" type="button" data-weight="${weight}">
              ${this.weightName(weight)}
            </button>
          `).join("")}
        </div>
        <div class="type-box" contenteditable="true" spellcheck="false" style="font-family:'${family}', sans-serif; font-weight:${start}; font-size: 64px;">${sample}</div>
      </div>
    `;

    const box = this.querySelector(".type-box");
    const sizeSlider = this.querySelector(".type-size-slider");
    const italicBtn = this.querySelector(".type-italic-toggle");

    this.querySelectorAll("[data-weight]").forEach((button) => {
      button.addEventListener("click", () => {
        this.querySelectorAll("[data-weight]").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        if (box) box.style.fontWeight = button.dataset.weight;
      });
    });

    sizeSlider?.addEventListener("input", (e) => {
      if (box) box.style.fontSize = `${e.target.value}px`;
    });

    italicBtn?.addEventListener("click", () => {
      const isItalic = box.style.fontStyle === "italic";
      box.style.fontStyle = isItalic ? "normal" : "italic";
      italicBtn.style.background = isItalic ? "var(--bj-white)" : "var(--bj-purple)";
      italicBtn.style.color = isItalic ? "var(--bj-purple)" : "var(--bj-white)";
    });
  }

  weightName(weight) {
    const names = {
      "200": "ExtraLight",
      "300": "Light",
      "400": "Regular",
      "500": "Medium",
      "600": "SemiBold",
      "700": "Bold",
      "800": "ExtraBold",
      "900": "Black"
    };
    return names[weight] || weight;
  }
}

customElements.define("type-tester", TypeTester);

function initReveal() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const items = Array.from(document.querySelectorAll(".section, .page-title, .hero-frame, .gallery-item"));
  items.forEach((item) => item.classList.add("reveal"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  items.forEach((item) => observer.observe(item));
}

class ColorSwatch extends HTMLElement {
  connectedCallback() {
    const name = this.getAttribute("name") || "";
    const hex = this.getAttribute("hex") || "";
    const rgb = this.getAttribute("rgb") || "";
    const cmyk = this.getAttribute("cmyk") || "";
    const mini = this.getAttribute("mini") === "true";
    const border = this.getAttribute("border") === "true";

    const copyIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`;

    this.innerHTML = `
      <article class="color-swatch-card ${mini ? 'mini' : ''}" tabindex="0">
        <div class="swatch-fill" style="background:${hex};${border ? 'border:8px solid #F2F2F2;' : ''}">
          <span class="copy-toast">Copied!</span>
          <div class="copy-hint" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Click to copy HEX
          </div>
        </div>
        <div class="swatch-info">
          <p class="label dark">${name}</p>
          <div class="code-details">
            <div class="code-row hex" data-copy="${hex}">
              <span class="code-label">HEX</span>
              <span class="code-val">${hex}</span>
              <button class="row-copy-btn" aria-label="Copy HEX">${copyIcon}</button>
            </div>
            <div class="code-row sub-code" data-copy="${rgb}">
              <span class="code-label">RGB</span>
              <span class="code-val">${rgb}</span>
              <button class="row-copy-btn" aria-label="Copy RGB">${copyIcon}</button>
            </div>
            <div class="code-row sub-code" data-copy="${cmyk}">
              <span class="code-label">CMYK</span>
              <span class="code-val">${cmyk}</span>
              <button class="row-copy-btn" aria-label="Copy CMYK">${copyIcon}</button>
            </div>
          </div>
        </div>
      </article>
    `;

    const copyToClipboard = (val, message) => {
      navigator.clipboard.writeText(val).then(() => {
        const toast = this.querySelector(".copy-toast");
        if (toast) {
          toast.textContent = message;
          toast.classList.add("show");
          setTimeout(() => toast.classList.remove("show"), 1500);
        }
      });
    };

    this.addEventListener("click", (e) => {
      const btn = e.target.closest(".row-copy-btn");
      if (btn) {
        const row = btn.closest(".code-row");
        const val = row?.dataset.copy;
        if (val) {
          copyToClipboard(val, `Copied ${row.querySelector(".code-label").textContent}!`);
        }
        return;
      }
      
      // Default behavior for clicking the card color area
      copyToClipboard(hex, "Copied HEX!");
    });
  }
}
customElements.define("color-swatch", ColorSwatch);

class SiteFooter extends HTMLElement {
  connectedCallback() {
    const activePath = window.location.pathname.split("/").filter(Boolean).pop() || "index.html";
    const links = [
      ["index.html", "Brand Guidelines"],
      ["strategy.html", "Core Strategy"],
      ["voice.html", "Brand Voice"],
      ["visuals.html", "Visual Identity"],
      ["gallery.html", "Asset Gallery"]
    ];

    const message = this.getAttribute("message") || "A system grounded in clarity, nutrition visibility, and source transparency.";

    this.innerHTML = `
      <footer class="site-footer">
        <div class="footer-container">
          <div class="footer-brand">
            <img class="footer-logo" src="${BoosterConfig.assets.wordmarkSvg}" alt="Booster">
            <p class="body-copy white">${message}</p>
          </div>
          
          <div class="footer-nav-block">
            <p class="label white">Navigation</p>
            <nav class="footer-links" aria-label="Footer navigation">
              ${links.map(([href, label]) => `
                <a class="footer-link ${activePath === href ? "active" : ""}" href="${href}">${label}</a>
              `).join("")}
            </nav>
          </div>

          <div class="footer-nav-block">
            <p class="label white">Process</p>
            <nav class="footer-links">
              <a class="footer-link" href="attributions.html">Attributions</a>
              <a class="footer-link" href="strawberry-scale.html">Strawberry Scale</a>
            </nav>
          </div>

          <div class="footer-bottom">
            <p class="small lilac">&copy; 2026 Booster Juice. Internal Guidelines Platform V2.1</p>
            <div class="footer-meta">
              <span class="small lilac">Confidential / For Internal Use</span>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define("site-footer", SiteFooter);

document.addEventListener("DOMContentLoaded", () => {
  new ProgressNav();
  initReveal();
});
