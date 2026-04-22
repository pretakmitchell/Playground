/**
 * Strawberry Scale Procedural Generator
 * Handles dynamic seed placement and detail scaling for the Booster strawberry icon.
 */

class StrawberryScale {
  constructor() {
    this.container = document.getElementById('strawberry-stage');
    this.slider = document.getElementById('detail-slider');
    this.seedCountDisplay = document.getElementById('seed-count');
    this.sizeDisplay = document.getElementById('current-size');
    this.refreshBtn = document.getElementById('refresh-seeds');

    this.bodyPathD = "M437.22,251.83l-85.68-7.83c-2.07-.19-4.15.21-6,1.16l-125.37,64.21c-2.34,1.2-4.17,3.2-5.16,5.63l-15.32,37.64c-.67,1.64-.93,3.42-.76,5.18l6.73,70.22c.24,2.48,1.31,4.8,3.04,6.59l128.18,132.21c1.72,1.77,3.98,2.91,6.42,3.24l61.35,8.24c3.35.45,6.72-.67,9.14-3.04l44.26-43.34c1.54-1.51,2.61-3.45,3.06-5.56l35.86-169.08c.16-.75.24-1.51.24-2.28v-53.08c0-3.37-1.55-6.56-4.2-8.64l-50.01-39.21c-1.66-1.3-3.67-2.1-5.77-2.29Z";
    
    this.leafPaths = [
      "M216.87,276.31l30.94-13.31c7.15-3.08,8.92-12.42,3.37-17.89l-47.43-46.83c-3.1-3.06-7.71-4-11.75-2.39l-33.08,13.11c-7.45,2.95-9.33,12.64-3.51,18.16l49.56,47.03c3.18,3.02,7.86,3.85,11.89,2.12Z",
      "M302.45,206.25l36.77-3.51c5.1-.49,9.18-4.43,9.84-9.51l9.47-72.76c.98-7.54-5.82-13.77-13.25-12.13l-79.55,17.59c-7.21,1.59-10.82,9.71-7.17,16.13l33.31,58.68c2.14,3.76,6.28,5.92,10.59,5.51Z",
      "M407.25,211.66l21.29,8.4c4.04,1.6,8.64.66,11.74-2.4l38.52-38.01c5.39-5.32,3.9-14.38-2.92-17.69l-32.68-15.84c-5.12-2.48-11.29-.64-14.21,4.25l-27.12,45.45c-3.47,5.81-.9,13.35,5.39,15.83Z"
    ];

    this.colors = {
      purple: "#53286E",
      neon: "#E11FFA",
      white: "#FFFFFF"
    };

    this.seedSeed = Math.random(); // Base seed for randomization
    this.bind();
    this.render();
  }

  bind() {
    this.slider.addEventListener('input', () => this.render());
    this.refreshBtn.addEventListener('click', () => {
      this.seedSeed = Math.random();
      this.render();
    });
  }

  render() {
    const val = parseFloat(this.slider.value);
    
    // Icon size scales from 32px to 600px
    const size = 32 + (val / 100) * 568;
    
    // Seed count scales from 2 to 20
    const seedCount = Math.floor(2 + (val / 100) * 18);
    
    this.seedCountDisplay.textContent = seedCount;
    this.sizeDisplay.textContent = Math.round(size) + 'px';

    const svg = this.generateSvg(size, seedCount);
    this.container.innerHTML = '';
    this.container.appendChild(svg);
  }

  generateSvg(size, seedCount) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 684 684");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.style.transition = "all 400ms cubic-bezier(0.16, 1, 0.3, 1)";

    // Define Clip Path
    const defs = document.createElementNS(ns, "defs");
    const clipPath = document.createElementNS(ns, "clipPath");
    clipPath.setAttribute("id", "strawberry-clip");
    const clipBody = document.createElementNS(ns, "path");
    clipBody.setAttribute("d", this.bodyPathD);
    clipPath.appendChild(clipBody);
    defs.appendChild(clipPath);
    svg.appendChild(defs);

    // 1. Draw Leaves
    this.leafPaths.forEach(d => {
      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", this.colors.neon);
      svg.appendChild(path);
    });

    // 2. Draw Body
    const body = document.createElementNS(ns, "path");
    body.setAttribute("d", this.bodyPathD);
    body.setAttribute("fill", this.colors.purple);
    svg.appendChild(body);

    // 3. Procedural Seeds (in a clipped group)
    const seedGroup = document.createElementNS(ns, "g");
    seedGroup.setAttribute("clip-path", "url(#strawberry-clip)");
    
    // Original organic brand seed path (normalized)
    const seedPathData = "M0.6,-13.4 L-5.2,-9.5 C-7,-8.4 -8.3,-6.7 -9,-4.7 L-12.9,7.5 C-13.6,9.6 -13.5,11.9 -12.7,13.9 L-11.2,17.4 C-9.3,21.9 -4.2,24 -0.2,22.1 L12.8,16.2 C14.1,15.6 15.2,14.7 16,13.6 L25,0.7 C27, -1.5 27.7, -4.5 26.9, -7.3 L20.7, -26 C19.1, -31.7 12.5, -34.8 7.5, -31 L0.6, -13.4 Z";

    const seeds = this.generateSeeds(seedCount);
    seeds.forEach(s => {
      const sp = document.createElementNS(ns, "path");
      sp.setAttribute("d", seedPathData);
      sp.setAttribute("transform", `translate(${s.x} ${s.y}) rotate(${s.rotation}) scale(${s.scale})`);
      sp.setAttribute("fill", this.colors.white);
      seedGroup.appendChild(sp);
    });
    svg.appendChild(seedGroup);

    return svg;
  }

  generateSeeds(count) {
    const testerSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    testerSvg.setAttribute("viewBox", "0 0 684 684");
    testerSvg.setAttribute("width", "684");
    testerSvg.setAttribute("height", "684");
    testerSvg.style.position = "absolute";
    testerSvg.style.left = "-9999px";
    
    const testerPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    testerPath.setAttribute("d", this.bodyPathD);
    testerSvg.appendChild(testerPath);
    document.body.appendChild(testerSvg);

    const seeds = [];
    const rng = this.createRng(this.seedSeed);
    
    const bounds = { x1: 230, x2: 470, y1: 300, y2: 600 };
    const seedMargin = 38; 

    // Seed Scaling Logic: Seeds scale at a slower rate than the berry
    const valRatio = parseFloat(this.slider.value) / 100;
    const relativeSeedScale = 1.25 - (valRatio * 0.45); // 1.25 (favicon) -> 0.8 (display)
    const seedBaseSize = 0.55 * relativeSeedScale;

    let attempts = 0;
    while (seeds.length < count && attempts < 1000) {
      attempts++;
      const x = bounds.x1 + rng() * (bounds.x2 - bounds.x1);
      const y = bounds.y1 + rng() * (bounds.y2 - bounds.y1);

      const pC = this.getSvgPoint(testerSvg, x, y);
      const checkRange = 32;
      const points = [
        this.getSvgPoint(testerSvg, x, y - checkRange),
        this.getSvgPoint(testerSvg, x, y + checkRange),
        this.getSvgPoint(testerSvg, x - checkRange, y),
        this.getSvgPoint(testerSvg, x + checkRange, y)
      ];

      if (testerPath.isPointInFill(pC) && points.every(p => testerPath.isPointInFill(p))) {
        const tooClose = seeds.some(s => Math.hypot(s.x - x, s.y - y) < 58);
        if (!tooClose) {
          seeds.push({ 
            x, 
            y, 
            scale: seedBaseSize,
            rotation: (rng() * 30) - 15 
          });
        }
      }
    }

    document.body.removeChild(testerSvg);
    return seeds;
  }

  getSvgPoint(svg, x, y) {
    const pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    return pt;
  }

  createRng(seed) {
    let m = 0x80000000;
    let a = 1103515245;
    let c = 12345;
    let state = seed ? seed * m : Math.floor(Math.random() * (m - 1));
    return function() {
      state = (a * state + c) % m;
      return state / (m - 1);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new StrawberryScale();
});
