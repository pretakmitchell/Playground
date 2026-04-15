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
    wordmarkSvg: "./Brand Assets/Logos/SVG Versions/Main - Wordmark (primary Logo).svg",
    wordmarkPng: "./Brand Assets/Logos/Main - Wordmark (primary Logo).png",
    iconSvg: "./Brand Assets/Logos/SVG Versions/Secondary - Main Icon (Secondary Logo).svg",
    iconPng: "./Brand Assets/Logos/Secondary - Main Icon (Secondary Logo).png",
    fullWordmarkSvg: "./Brand Assets/Logos/SVG Versions/Secondary - Full Wordmark.svg",
    fullWordmarkPng: "./Brand Assets/Logos/Secondary - Full Wordmark.png",
    comboSvg: "./Brand Assets/Logos/Lockups/Secondary - Wordmark + Logo.svg",
    legalSvg: "./Brand Assets/Logos/Lockups/Tetritary - Full Wordmark + Logo (company documents only).svg",
    heroTwoCups: "./Brand Assets/Image assets/TwoCups.png",
    cheers: "./Brand Assets/Image assets/Cheers.png",
    cup: "./Brand Assets/Image assets/Cup.jpeg",
    holdingCup: "./Brand Assets/Image assets/Holding Cup.jpeg",
    bagCup: "./Brand Assets/Image assets/Bag + Cup.jpeg",
    bagsWrap: "./Brand Assets/Image assets/TwoBagsAndWrap.jpeg",
    generatedCup: "./Brand Assets/Image assets/Generated/booster_cup_wrap_1776116781883.png",
    generatedTote: "./Brand Assets/Image assets/Generated/booster_tote_mockup_1776116766320.png",
    generatedApp: "./Brand Assets/Image assets/Generated/booster_ui_app_1776116752479.png"
  },
  validLogoCombos: {
    deep: ["white", "lilac", "neon"],
    purple: ["white", "lilac"],
    lilac: ["deep", "purple", "black"],
    neon: ["deep", "white", "black"],
    emphasis: ["deep", "purple", "neon", "black"],
    grey: ["deep", "purple", "neon", "black"],
    white: ["deep", "purple", "neon", "black"],
    black: ["white", "lilac", "neon"]
  }
};

class TopNav extends HTMLElement {
  connectedCallback() {
    const activePath = window.location.pathname.split("/").pop() || "index.html";
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
          <a class="nav-action" href="mailto:hello@boosterjuice.example">Get in Touch</a>
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
    this.wrap = document.createElement("div");
    this.wrap.className = "progress-wrap";
    this.wrap.innerHTML = `
      <div class="progress-glass" aria-hidden="true">
        <div class="progress-glass-blur"></div>
        <div class="progress-glass-tint"></div>
      </div>
      <p class="progress-hint">Click To expand</p>
      <nav class="progress-navigator" aria-label="Section progress">
        ${this.sections.map((section, index) => this.sectionButton(section, index)).join("")}
      </nav>
      <div class="progress-menu" aria-hidden="true">
        ${this.sections.map((section, index) => this.menuGroup(section, index)).join("")}
      </div>
    `;

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
        const index = Number(button.dataset.progressIndex);
        if (index !== this.activeIndex) {
          this.scrollToSection(index);
          this.setOpen(true);
          return;
        }
        this.setOpen(!this.open);
        event.stopPropagation();
      });
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
    this.menu?.setAttribute("aria-hidden", String(!open));
  }
}

class LogoColourSwitcher extends HTMLElement {
  constructor() {
    super();
    this.bg = "black";
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
    const logoKeys = ["deep", "purple", "lilac", "neon", "white", "black"];

    this.innerHTML = `
      <div class="switcher">
        <div class="switch-lockups" role="group" aria-label="Logo lockup">
          ${Object.entries(this.lockups).map(([key, item]) => `
            <button class="lockup-thumb ${this.lockup === key ? "active" : ""}" type="button" data-lockup="${key}">
              <span class="thumb-art">
                <img src="${item.fallback}" alt="">
              </span>
              <span class="label small">${item.label}</span>
            </button>
          `).join("")}
        </div>

        <div class="switch-controls">
          <div class="switch-group">
            <div class="switch-row" data-bg-options>
              ${bgKeys.map((key) => this.swatchButton("bg", key)).join("")}
            </div>
            <p class="label">Background Colour</p>
          </div>
          <div class="switch-group">
            <div class="switch-row" data-logo-options>
              ${logoKeys.map((key) => this.swatchButton("logo", key)).join("")}
            </div>
            <p class="label">Logo Colour</p>
          </div>
          <div class="switch-group">
            <div class="accent-toggle">
              <button type="button" data-accent="on">On</button>
              <button type="button" data-accent="off">Off</button>
            </div>
            <p class="label">Emphasis</p>
          </div>
        </div>

        <div class="switcher-note">
          <p class="label small">Rule</p>
          <p class="body-copy">Invalid contrast pairs are disabled. When emphasis is on, the exclamation blocks can use a separate accent colour instead of matching the wordmark.</p>
        </div>

        <div class="switcher-preview" data-preview>
          <div class="switch-svg" data-svg-stage aria-label="Live logo preview"></div>
          <a class="download-combo" href="${this.lockups[this.lockup].source}" download>Download this Combo</a>
        </div>
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
    this.querySelectorAll("[data-lockup]").forEach((button) => {
      button.addEventListener("click", () => {
        this.lockup = button.dataset.lockup;
        this.update();
      });
    });

    this.querySelectorAll("[data-bg]").forEach((button) => {
      button.addEventListener("click", () => {
        this.bg = button.dataset.bg;
        const valid = BoosterConfig.validLogoCombos[this.bg] || [];
        if (!valid.includes(this.logo)) this.logo = valid[0] || "white";
        this.update();
      });
    });

    this.querySelectorAll("[data-logo]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.disabled) return;
        this.logo = button.dataset.logo;
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

  async update() {
    const preview = this.querySelector("[data-preview]");
    const stage = this.querySelector("[data-svg-stage]");
    const download = this.querySelector(".download-combo");
    if (!preview || !stage) return;

    preview.style.background = BoosterConfig.colours[this.bg];
    download?.setAttribute("href", this.lockups[this.lockup].source);

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
      button.classList.toggle("active", (button.dataset.accent === "on") === this.accentOn);
    });

    await this.renderSvg(stage);
  }

  accentColour() {
    if (!this.accentOn) return BoosterConfig.colours[this.logo];
    if (this.bg === "neon") return BoosterConfig.colours.white;
    if (this.bg === "lilac") return BoosterConfig.colours.deep;
    if (this.logo === "neon") return BoosterConfig.colours.lilac;
    return BoosterConfig.colours.neon;
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
      style.textContent = `.cls-1{fill:${accentColour};}.cls-2{fill:${textColour};}`;
      if (!style.parentElement) svg.prepend(style);
      svg.removeAttribute("width");
      svg.removeAttribute("height");
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
        <p class="label" style="margin-bottom:18px;">${label}</p>
        <div class="type-controls">
          ${weights.map((weight) => `
            <button class="type-control ${weight === start ? "active" : ""}" type="button" data-weight="${weight}">
              ${this.weightName(weight)}
            </button>
          `).join("")}
        </div>
        <div class="type-box" contenteditable="true" spellcheck="false" style="font-family:'${family}', sans-serif; font-weight:${start};">${sample}</div>
      </div>
    `;

    const box = this.querySelector(".type-box");
    this.querySelectorAll("[data-weight]").forEach((button) => {
      button.addEventListener("click", () => {
        this.querySelectorAll("[data-weight]").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        if (box) box.style.fontWeight = button.dataset.weight;
      });
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

document.addEventListener("DOMContentLoaded", () => {
  new ProgressNav();
  initReveal();
});
