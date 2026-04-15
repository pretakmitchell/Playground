const CX = 600;
const CY = 650; // Matches expanded viewBox height so arc lands flush at bottom

// Base ecosystem data and tooltip dictionaries
const branches = [
    {
        title: "Daily\\nNourishment",
        summary: "Moving from occasional treats to habitual systems built around functional need states and clearer daily relevance.",
        points: ["Need-state menu", "Visible nutrition", "Breakfast moments", "Midday support", "Recovery routines"],
        tooltips: [
            "Menu structure optimized for functional needs rather than arbitrary flavors.",
            "Clear visual indicators revealing active ingredient payloads.",
            "Reliable offerings tailored for early day-part energy routines.",
            "Sustained energy and focus options for afternoon dips.",
            "High-protein and restorative formulations for post-exertion."
        ],
        textRot: -65
    },
    {
        title: "Supply &\\nSourcing",
        summary: "Elevating transparency through visible ingredient provenance and ethical procurement standards to build institutional trust.",
        points: ["Ingredient origins", "Grower visibility", "Product journey", "Sourcing standards", "Material disclosure"],
        tooltips: [
            "Tracing core ingredients directly to region and farm.",
            "Highlighting the people and operations behind Booster products.",
            "Transparent tracking from raw material to retail cup.",
            "Rigorous benchmarks for ethical and qualitative procurement.",
            "Complete honesty regarding sweetners, isolates, and additives."
        ],
        textRot: -25
    },
    {
        title: "Responsible\\nOperations",
        summary: "Streamlining operational waste and physical materials to align the brand’s wellness promise with measurable environmental progress.",
        points: ["Packaging systems", "Waste reduction", "Energy use", "Logistics efficiency", "Progress tracking"],
        tooltips: [
            "Simplifying and standardizing physical containers and lids.",
            "Clear disposal pathways to limit cross-contamination.",
            "Operational standards for store-level resource management.",
            "Smarter distribution models limiting carbon footprint overhead.",
            "Measurable, publicly accountable ESG metrics."
        ],
        textRot: 25
    },
    {
        title: "Social &\\nEnvironmental\\nStewardship",
        summary: "Connecting the brand to local health and restoration initiatives through proof-based stewardship and community participation.",
        points: ["Environmental restoration", "Supplier communities", "Local wellness", "Charitable realignment", "Positive contribution"],
        tooltips: [
            "Direct action funding ecological regeneration projects.",
            "Investment in the economic health of sourcing locales.",
            "Promoting physical health and wellness access in store communities.",
            "Focusing philanthropy directly on nourishment and activity initiatives.",
            "Ensuring net-positive operational outcomes for neighborhoods."
        ],
        textRot: 65
    }
];

const WEDGE_INNER_R = 210;
const WEDGE_OUTER_R = 330;
const POINT_R = 370;
const TEXT_R = 410;
const TOTAL_SPAN = 180;
const PILLAR_VOID_DEG = 2;  // Total angular void between adjacent pillars
const WEDGE_INSET_DEG = PILLAR_VOID_DEG / 2; // Each wedge is inset by half on each side

let activePillarIndex = null;
const baseSpan = (TOTAL_SPAN - (3 * PILLAR_VOID_DEG)) / 4;

// State arrays for interpolation
let currentSpans = [baseSpan, baseSpan, baseSpan, baseSpan];
let targetSpans = [baseSpan, baseSpan, baseSpan, baseSpan];

let currentFontSizes = [20, 20, 20, 20];
let targetFontSizes = [20, 20, 20, 20];

// DOM Node References to avoid React/VDOM overhead but keep high performance
const domNodes = {
    wedges: [],
    wedgeTexts: [],
    wedgeTSpans: [],
    points: []
};

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const r = angleInDegrees * Math.PI / 180.0;
    return { x: centerX + radius * Math.cos(r), y: centerY - radius * Math.sin(r) };
}

// Builds a rounded-corner annular sector.
// Each of the 4 corners gets a genuine arc of radius `cr` (corner radius).
function getSectorPath(cx, cy, innerR, outerR, startAngle, endAngle, cr = 14) {
    // Apply inset so the physical gap between wedges equals PILLAR_VOID_DEG degrees
    const s = startAngle - WEDGE_INSET_DEG;
    const e = endAngle + WEDGE_INSET_DEG;

    // Convert corner radius to equivalent angle at each radius
    const caOuter = (cr / outerR) * (180 / Math.PI);
    const caInner = (cr / innerR) * (180 / Math.PI);

    // 8 transition points — 2 per corner, one on each of the two meeting edges
    const a1 = polarToCartesian(cx, cy, outerR, s - caOuter); // outer-arc → start-radial
    const a2 = polarToCartesian(cx, cy, outerR - cr, s);           // start-radial near outer
    const a3 = polarToCartesian(cx, cy, outerR, e + caOuter); // outer-arc → end-radial
    const a4 = polarToCartesian(cx, cy, outerR - cr, e);           // end-radial near outer
    const a5 = polarToCartesian(cx, cy, innerR + cr, e);           // end-radial near inner
    const a6 = polarToCartesian(cx, cy, innerR, e + caInner); // inner-arc ← end-radial
    const a7 = polarToCartesian(cx, cy, innerR, s - caInner); // inner-arc → start-radial
    const a8 = polarToCartesian(cx, cy, innerR + cr, s);           // start-radial near inner

    const spanDeg = s - e; // always > 0 (s > e)
    const outerLarge = spanDeg > 180 ? 1 : 0;
    const innerLarge = spanDeg > 180 ? 1 : 0;

    return [
        "M", a1.x, a1.y,
        "A", outerR, outerR, 0, outerLarge, 1, a3.x, a3.y,  // outer arc (CW)
        "A", cr, cr, 0, 0, 1, a4.x, a4.y,                   // round outer-end corner
        "L", a5.x, a5.y,                                      // end radial line
        "A", cr, cr, 0, 0, 1, a6.x, a6.y,                   // round inner-end corner
        "A", innerR, innerR, 0, innerLarge, 0, a7.x, a7.y,  // inner arc (CCW)
        "A", cr, cr, 0, 0, 1, a8.x, a8.y,                   // round inner-start corner
        "L", a2.x, a2.y,                                      // start radial line
        "A", cr, cr, 0, 0, 1, a1.x, a1.y,                   // round outer-start corner
        "Z"
    ].join(" ");
}

document.addEventListener("DOMContentLoaded", () => {
    const elWedges = document.getElementById('wedges');
    const elPoints = document.getElementById('points');
    const tooltip = document.getElementById('eco-tooltip');
    if (!elWedges) return;

    // Center Booster Source Title
    const titleG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    titleG.innerHTML = `
        <text x="${CX}" y="${CY - 60}" text-anchor="middle" dominant-baseline="middle" class="map-wedge-text" style="fill: var(--bj-purple); font-size: 44px; letter-spacing: -0.02em; pointer-events: none;">Booster</text>
        <text x="${CX}" y="${CY - 15}" text-anchor="middle" dominant-baseline="middle" class="map-wedge-text" style="fill: var(--bj-purple); font-size: 44px; font-style: italic; letter-spacing: -0.02em; pointer-events: none;">Source</text>
    `;
    elWedges.appendChild(titleG);

    // Initialize DOM
    branches.forEach((b, i) => {
        // Wedge Path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'wedge-path');
        path.setAttribute('fill', '#ffffff');
        path.setAttribute('stroke', 'none'); // Remove stroke to reveal parallel gaps
        path.setAttribute('stroke-width', '0');

        // Interactivity
        path.addEventListener('click', () => {
            activePillarIndex = activePillarIndex === i ? null : i;
            updateTargets();
        });
        path.addEventListener('mouseenter', () => {
            if (activePillarIndex !== i && activePillarIndex === null) {
                path.style.fill = '#f4eff8'; // very light lilac
                path.style.stroke = '#f4eff8';
            }
        });
        path.addEventListener('mouseleave', () => {
            if (activePillarIndex !== i) {
                path.style.fill = '#ffffff';
                path.style.stroke = '#ffffff';
            }
        });

        elWedges.appendChild(path);
        domNodes.wedges.push(path);

        // Title Texts
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('class', 'map-wedge-text');
        text.style.pointerEvents = 'none'; // click flows to wedge

        const titleLines = b.title.split('\\n');
        const tspans = [];
        titleLines.forEach((line, lineIdx) => {
            let dy = lineIdx === 0 ? (titleLines.length > 2 ? -24 : (titleLines.length === 2 ? -12 : 0)) : 24;
            if (lineIdx === 2) dy = 24;
            const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            tspan.textContent = line;
            tspan.setAttribute('dy', dy);
            text.appendChild(tspan);
            tspans.push(tspan);
        });

        elWedges.appendChild(text);
        domNodes.wedgeTexts.push(text);
        domNodes.wedgeTSpans.push(tspans);

        // Points
        const pts = [];
        b.points.forEach((ptText, ptIdx) => {
            // Visible dot
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', '8');
            circle.setAttribute('fill', 'white');
            circle.setAttribute('stroke', '#c0a9d1');
            circle.setAttribute('stroke-width', '4');

            // Large invisible hit-target — easy to hover without being pixel-precise
            const hitTarget = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            hitTarget.setAttribute('r', '40');
            hitTarget.setAttribute('fill', 'transparent');
            hitTarget.setAttribute('stroke', 'none');
            hitTarget.style.cursor = 'pointer';

            const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textEl.setAttribute('dominant-baseline', 'middle');
            textEl.setAttribute('class', 'map-point-text');
            textEl.style.fontSize = '14px';
            textEl.style.fontWeight = '600';
            textEl.textContent = ptText;

            // Tooltip interactivity
            const handleHover = (e) => {
                const container = document.getElementById('ecosystem-canvas').parentElement;
                const rect = container.getBoundingClientRect();
                const tooltipText = b.tooltips[ptIdx];

                // Card with Titillium-style heading + descriptor
                tooltip.innerHTML = `
                  <div style="padding:16px 18px;">
                    <div style="font-family:var(--font-heading,'Titillium Web',sans-serif); font-size:16px; font-weight:700; letter-spacing:-0.01em; color:var(--bj-purple); margin-bottom:8px; line-height:1.2;">${ptText}</div>
                    <div style="font-size:13px; line-height:1.6; font-weight:400; color:rgba(47,23,66,0.75);">${tooltipText}</div>
                  </div>
                `;
                tooltip.style.opacity = '1';
                tooltip.style.padding = '0';
                tooltip.style.borderRadius = '14px';
                tooltip.style.width = '220px';

                // Track mouse position relative to the container
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;
                tooltip.style.left = (mx + 18) + 'px';
                tooltip.style.top = (my - 24) + 'px';

                textEl.style.fill = 'var(--bj-purple)';
                circle.setAttribute('stroke', 'var(--bj-purple)');
            };

            const handleHoverMove = (e) => {
                const container = document.getElementById('ecosystem-canvas').parentElement;
                const rect = container.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;
                tooltip.style.left = (mx + 18) + 'px';
                tooltip.style.top = (my - 24) + 'px';
            };

            const handleOut = () => {
                // Only hide if not in pillar focus mode (focus mode sets opacity=1 from updateTargets)
                if (activePillarIndex === null) tooltip.style.opacity = '0';
                else tooltip.style.opacity = '0'; // sub-point tooltip always hides on leave; panel re-shows on next click
                textEl.style.fill = 'rgba(47, 23, 66, 0.5)';
                let isFaded = activePillarIndex !== null && activePillarIndex !== i;
                circle.setAttribute('stroke', isFaded ? '#e6e6e6' : '#c0a9d1');
            };

            [hitTarget, textEl, circle].forEach(el => {
                el.addEventListener('mouseenter', handleHover);
                el.addEventListener('mousemove', handleHoverMove);
                el.addEventListener('mouseleave', handleOut);
            });

            elPoints.appendChild(hitTarget);
            elPoints.appendChild(circle);
            elPoints.appendChild(textEl);

            pts.push({ circle, text: textEl, hitTarget });
        });
        domNodes.points.push(pts);
    });

    // Initial render
    renderMap();
    animLoop();
});

function updateTargets() {
    const tooltip = document.getElementById('eco-tooltip');
    if (activePillarIndex === null) {
        targetSpans = [baseSpan, baseSpan, baseSpan, baseSpan];
        targetFontSizes = [20, 20, 20, 20];
        tooltip.style.opacity = '0';
    } else {
        const expandedSpan = 84;
        const remainingSpan = (TOTAL_SPAN - (3 * PILLAR_VOID_DEG) - expandedSpan) / 3;
        targetSpans = branches.map((_, i) => i === activePillarIndex ? expandedSpan : remainingSpan);
        targetFontSizes = branches.map((_, i) => i === activePillarIndex ? 26 : 14);

        // Show automatic summary for active pillar
        const b = branches[activePillarIndex];
        tooltip.innerHTML = `
          <div style="padding:20px 22px;">
            <div style="font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:rgba(47,23,66,0.45); font-weight:600; margin-bottom:8px;">PILLAR OVERVIEW</div>
            <div style="font-size:20px; font-weight:800; letter-spacing:-0.01em; color:var(--bj-purple); line-height:1.15; margin-bottom:12px;">${b.title.replace(/\\n/g, ' ')}</div>
            <div style="font-size:13px; line-height:1.65; font-weight:400; color:rgba(47,23,66,0.75);">${b.summary}</div>
          </div>
        `;
        tooltip.style.opacity = '1';
        tooltip.style.left = '24px';
        tooltip.style.top = '24px';
        tooltip.style.width = '260px';
        tooltip.style.padding = '0';
        tooltip.style.borderRadius = '16px';
    }
}

// Simple lerp
function animLoop() {
    let changed = false;
    for (let i = 0; i < 4; i++) {
        const diffSpan = targetSpans[i] - currentSpans[i];
        if (Math.abs(diffSpan) > 0.05) {
            currentSpans[i] += diffSpan * 0.12;
            changed = true;
        } else {
            currentSpans[i] = targetSpans[i];
        }

        const diffFont = targetFontSizes[i] - currentFontSizes[i];
        if (Math.abs(diffFont) > 0.05) {
            currentFontSizes[i] += diffFont * 0.12;
            changed = true;
        } else {
            currentFontSizes[i] = targetFontSizes[i];
        }
    }

    if (changed) {
        renderMap();
    }
    requestAnimationFrame(animLoop);
}

function renderMap() {
    let currentAngle = 180;

    branches.forEach((b, i) => {
        const span = currentSpans[i];
        const endAngle = currentAngle - span;

        // 1. Update Wedge
        const path = domNodes.wedges[i];
        path.setAttribute('d', getSectorPath(CX, CY, WEDGE_INNER_R, WEDGE_OUTER_R, currentAngle, endAngle));

        // Update Colors based on selection logic
        if (activePillarIndex === null) {
            path.style.opacity = '1';
            if (path.matches(':hover')) {
                path.style.fill = '#f4eff8';
                path.style.stroke = '#f4eff8';
            } else {
                path.style.fill = '#ffffff';
                path.style.stroke = '#ffffff';
            }
        } else if (activePillarIndex === i) {
            path.style.opacity = '1';
            path.style.fill = 'var(--bj-lilac)';
            path.style.stroke = 'none';
        } else {
            path.style.opacity = '0.4';
            path.style.fill = '#ffffff';
            path.style.stroke = 'none';
        }

        // 2. Update Title
        const midAngle = currentAngle - span / 2;
        const pMid = polarToCartesian(CX, CY, (WEDGE_INNER_R + WEDGE_OUTER_R) / 2, midAngle);

        let dynamicTextRot = 90 - midAngle;

        const textEl = domNodes.wedgeTexts[i];
        const tspans = domNodes.wedgeTSpans[i];

        textEl.setAttribute('x', pMid.x);
        textEl.setAttribute('y', pMid.y);
        textEl.setAttribute('transform', `rotate(${dynamicTextRot}, ${pMid.x}, ${pMid.y})`);
        textEl.style.fontSize = currentFontSizes[i] + 'px';
        textEl.style.opacity = (activePillarIndex !== null && activePillarIndex !== i) ? '0.2' : '1';
        if (activePillarIndex === i) textEl.style.fill = "white";
        else textEl.style.fill = "var(--bj-purple)";

        tspans.forEach(tspan => {
            tspan.setAttribute('x', pMid.x);
        });

        // 3. Update Points
        const pCount = b.points.length;
        domNodes.points[i].forEach((ptDOM, ptIdx) => {
            const t = pCount > 1 ? ptIdx / (pCount - 1) : 0.5;
            // Use WEDGE_INSET_DEG to match the actual drawn wedge boundary
            // 50px physical gap from the visible edge of the pillar block, converted to degrees at POINT_R
            const paddingPx = 50;
            const paddingDeg = (paddingPx / POINT_R) * (180 / Math.PI);
            const marginDeg = WEDGE_INSET_DEG + paddingDeg; // inset past the wedge edge + 50px more
            const effectiveSpan = Math.max(0, span - marginDeg * 2);
            const ptAngle = (currentAngle - marginDeg) - (t * effectiveSpan);

            const pCircle = polarToCartesian(CX, CY, POINT_R, ptAngle);
            ptDOM.circle.setAttribute('cx', pCircle.x);
            ptDOM.circle.setAttribute('cy', pCircle.y);

            // Keep the invisible hit-target co-located with the visible dot
            if (ptDOM.hitTarget) {
                ptDOM.hitTarget.setAttribute('cx', pCircle.x);
                ptDOM.hitTarget.setAttribute('cy', pCircle.y);
            }

            const isFaded = activePillarIndex !== null && activePillarIndex !== i;
            ptDOM.circle.style.opacity = isFaded ? '0.2' : '1';
            if (!ptDOM.circle.matches(':hover')) ptDOM.circle.setAttribute('stroke', isFaded ? '#f0f0f0' : '#c0a9d1');

            const pText = polarToCartesian(CX, CY, TEXT_R, ptAngle);
            const isLeftText = ptAngle > 90;

            let textRotation = -ptAngle;
            let tAnchor = 'start';
            let dxAdjust = 12;

            if (isLeftText) {
                textRotation = -ptAngle + 180;
                tAnchor = 'end';
                dxAdjust = -12;
            }

            ptDOM.text.setAttribute('x', pText.x);
            ptDOM.text.setAttribute('y', pText.y);
            ptDOM.text.setAttribute('dx', dxAdjust);
            ptDOM.text.setAttribute('text-anchor', tAnchor);
            ptDOM.text.setAttribute('transform', `rotate(${textRotation}, ${pText.x}, ${pText.y})`);
            ptDOM.text.style.opacity = isFaded ? '0.3' : '1';
        });

        currentAngle = endAngle - PILLAR_VOID_DEG; // Skip the angular void completely
    });
}
