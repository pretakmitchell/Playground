/* global React, ReactDOM, d3 */
const { useEffect, useMemo, useRef, useState } = React;
/**
 * Dream — Opportunities in Regenerative Economies (Structured Radial Map • v4)
 *
 * This version applies your latest direction:
 * - Ideas use translucent fills (micro ideas ≈10% opacity; larger ideas max 35%). Only THEMES (center + mixed trends) are solid.
 * - Stronger hierarchy + spacing: small ideas furthest out, then big ideas, then microtrends, then mixed trends, then the fixed center.
 * - Extended radii with staggered rings to prevent label collisions; automatic multi-line labels.
 * - Center circle wraps text and auto-sizes to fit fully.
 * - No sector background fills; thirds are implied purely by layout.
 * - Wavy links render behind nodes with subtle gradients.
 */
function DreamOpportunitiesMapV4() {
    var _a, _b, _c, _d;
    /** ====== CONFIG ====== */
    const COLORS = {
        brand: { primary: "#5cce93", deep: "#014621", mint: "#b9f6d8" },
        trends: {
            SSC: "#84e4db",
            RA: "#b9f6d8",
            RL: d3.interpolateRgb("#8fb3f0", "#2871dc")(0.25),
        },
        micro: {
            Microgrids: "#68d0f0",
            "15‑Minute Cities": "#a1eecb",
            VPPs: "#6ec8f5",
            DERMS: "#6edcd2",
            "District Energy": "#74dcd2",
            "Resilience Hubs": "#88dfd0",
            "EV V2G": "#5fc4e0",
            "Smart‑City Infrastructure": "#9fd4d8",
            "Precision Agriculture": "#bdf4c8",
            "Carbon Farming": "#c8f5d8",
            "Soil Regeneration": "#baf3d1",
            MRV: "#c4f2df",
            "Biofertilizers / Microbial Inputs": "#caf5e5",
            "Synthetic Biology": "#b18ae8",
            "Ag‑Data Platforms": "#c8f7e6",
            "Circular Economy": "#a9c5f5",
            "Waste‑Heat Recovery": "#9bbdf3",
            "Food‑Waste Upcycling": "#a7c8f0",
            "Enzymatic / Chemical Recycling": "#a2b7f2",
            "Bio‑based Materials": "#b7cbf3",
            "Reverse Logistics": "#9dc0ee",
        },
        gray: { nodeFill: "#e5e7eb", nodeStroke: "#9ca3af", edge: "#d1d5db", text: "#6b7280" },
    };
    const core = {
        id: "core",
        label: "Dream — Opportunities\nin Regenerative\nEconomies",
        type: "core",
        size: 200,
        desc: "Center of the map. A strategy lens connecting Dream’s developments to regenerative, circular, and self‑sustaining opportunity spaces.",
        tags: ["Center", "Vision"],
    };
    const mixed = [
        { id: "ssc", label: "Self‑Sustaining / Regenerative\nCommunities", type: "mixed", trend: "SSC", size: 120, tags: ["Mixed Trend"], desc: "Decentralized, resilient, data‑driven civic infrastructure: microgrids, VPPs, DERMS, district energy, V2G, resilience hubs, smart‑city fabric." },
        { id: "ra", label: "Regenerative Agriculture /\nResource‑Positive Food Systems", type: "mixed", trend: "RA", size: 120, tags: ["Mixed Trend"], desc: "Precision ag, soil health, MRV, carbon farming, biofertilizers, synbio for ag, ag‑data platforms, urban and peri‑urban food webs." },
        { id: "rl", label: "Resource Looping /\nCircular Systems", type: "mixed", trend: "RL", size: 120, tags: ["Mixed Trend"], desc: "Circular economy, reverse logistics, waste‑heat upcycling, chemical/enzymatic recycling, circular materials & construction." },
    ];
    const des = { id: "des", label: "Dream Energy System\n(DES)", type: "idea", trend: "SSC", size: 120, tags: ["Original", "Platform"], desc: "Community energy platform integrating storage, mobility, heat recovery, and a digital operating layer." };
    const desComponents = [
        { id: "des_storage", label: "Critical‑Load\nEnergy Storage", type: "component", trend: "SSC", size: 62, tags: ["Original", "Storage"], desc: "Resilience‑first batteries sized for essential loads and grid services revenue." },
        { id: "des_smart_centres", label: "Smart Energy\nCentres", type: "component", trend: "SSC", size: 60, tags: ["Original", "Operations"], desc: "On‑site hubs integrating thermal, PV, controls, and communications — the DES brain." },
        { id: "des_ev_mobility", label: "Electric Vehicle\nMobility Service", type: "component", trend: "SSC", size: 66, tags: ["Original", "Mobility"], desc: "Shared EVs + charging as a service, integrated with V2X for flexibility markets." },
        { id: "des_waste_heat", label: "Waste‑Heat\nRecovery Units", type: "component", trend: "SSC", size: 60, tags: ["Original", "Thermal"], desc: "Capture low‑grade heat from data rooms, retail, and wastewater for district loops." },
        { id: "des_dashboard", label: "Digital Energy\nSystems Dashboard", type: "component", trend: "SSC", size: 60, tags: ["Original", "Digital"], desc: "Portfolio‑level command, DERMS control, carbon & comfort KPIs, and resident apps." },
    ];
    const largeIdeas = [
        { id: "district_thermal", label: "District Thermal\nMicrogrid", type: "idea", trend: "SSC", size: 96, tags: ["Heat", "Grid"], desc: "Ambient loops + geoexchange pods stitched into DES load management." },
        { id: "vpp_derms", label: "VPP + DERMS\nOrchestration", type: "idea", trend: "SSC", size: 92, tags: ["Flexibility", "Revenue"], desc: "Portfolio‑level aggregation for market participation and peak shaving." },
        { id: "resilience_hubs", label: "Community\nResilience Hubs", type: "idea", trend: "SSC", size: 86, tags: ["Resilience", "Community"], desc: "Multi‑use spaces with critical power, comms, cooling/heat, supplies, and Wi‑Fi." },
        { id: "smart_home_kits", label: "Smart Home\nEnergy Kit Program", type: "idea", trend: "SSC", size: 82, tags: ["Demand‑side", "Engagement"], desc: "Resident kits (sub‑metering, TOU nudges, smart plugs) linked to the DES app." },
        { id: "ev_v2g", label: "EV V2G Fleet\nContracting", type: "idea", trend: "SSC", size: 88, tags: ["Mobility", "Flexibility"], desc: "Leased EV fleets provide grid services; credits returned to subscribers." },
        { id: "agrovoltaics", label: "Agrovoltaics at\nEdges of Sites", type: "idea", trend: "RA", size: 92, tags: ["Food", "Energy"], desc: "Dual‑use PV with shade‑tolerant crops on parking canopies and berms." },
        { id: "soil_mrv", label: "Soil Health\nMRV Platform", type: "idea", trend: "RA", size: 98, tags: ["MRV", "Data"], desc: "Open MRV for urban farms & partners; unlocks nature credits and co‑benefits." },
        { id: "biofertilizer_coop", label: "Biofertilizer /\nMicrobial Inputs Co‑op", type: "idea", trend: "RA", size: 86, tags: ["Inputs", "Co‑op"], desc: "Member purchasing + trials with local growers; links to compost digestate." },
        { id: "synbio_food", label: "SynBio Upcycled\nIngredients Lab", type: "idea", trends: ["RA", "RL"], microtrend: "Synthetic Biology", size: 92, tags: ["Pilot", "R&D"], desc: "Fermentation + precision enzymes to valorize local side streams into food." },
        { id: "food_waste_biogas", label: "Food‑Waste →\nBiogas + Heat", type: "idea", trends: ["RL", "SSC"], size: 96, tags: ["Waste", "Heat"], desc: "Anaerobic digestion tied to district thermal; credits looped to residents." },
        { id: "reverse_logistics", label: "Reverse Logistics\n& Materials Recovery", type: "idea", trend: "RL", size: 94, tags: ["Logistics", "Jobs"], desc: "Parcel lockers + returns → sorting micro‑hub; feed local reuse markets." },
        { id: "circular_construction", label: "Circular Construction\nMaterials Exchange", type: "idea", trends: ["RL", "SSC"], size: 90, tags: ["Construction", "Marketplace"], desc: "Deconstruction marketplace for lumber, fixtures, facade elements, fill." },
        { id: "water_circularity", label: "Community Water\nCircularity Hub", type: "idea", trends: ["RL", "SSC"], size: 86, tags: ["Water", "Resilience"], desc: "Greywater capture, rain gardens, storm retention + IoT leak analytics." },
        { id: "repair_reuse", label: "Repair & Reuse\nCommons", type: "idea", trend: "RL", size: 90, tags: ["Community", "Jobs"], desc: "Makerspace + tool library; appliance, bike, textile repair events." },
        { id: "plastics_recycling", label: "Enzymatic / Chemical\nPlastics Recycling", type: "idea", trend: "RL", size: 86, tags: ["Pilot", "R&D"], desc: "Small‑footprint pilot converting PET/PLA streams into new feedstock." },
        { id: "urban_farm_network", label: "Urban Farm &\nCompost Network", type: "idea", trends: ["RA", "RL"], size: 92, tags: ["Food", "Soil"], desc: "Neighbourhood plots + compost collection; soil loops back to plantings." },
    ];
    const microNodes = [
        { id: "micro_microgrids", label: "Microgrids", type: "microtrend", trend: "SSC", microtrend: "Microgrids", size: 56 },
        { id: "micro_15min", label: "15‑Minute Cities", type: "microtrend", trend: "SSC", microtrend: "15‑Minute Cities", size: 56 },
        { id: "micro_vpps", label: "VPPs", type: "microtrend", trend: "SSC", microtrend: "VPPs", size: 52 },
        { id: "micro_derms", label: "DERMS", type: "microtrend", trend: "SSC", microtrend: "DERMS", size: 52 },
        { id: "micro_district", label: "District Energy", type: "microtrend", trend: "SSC", microtrend: "District Energy", size: 52 },
        { id: "micro_resilience", label: "Resilience Hubs", type: "microtrend", trend: "SSC", microtrend: "Resilience Hubs", size: 52 },
        { id: "micro_v2g", label: "EV V2G", type: "microtrend", trend: "SSC", microtrend: "EV V2G", size: 50 },
        { id: "micro_smartcity", label: "Smart‑City Infrastructure", type: "microtrend", trend: "SSC", microtrend: "Smart‑City Infrastructure", size: 52 },
        { id: "micro_precision", label: "Precision Agriculture", type: "microtrend", trend: "RA", microtrend: "Precision Agriculture", size: 52 },
        { id: "micro_carbon", label: "Carbon Farming", type: "microtrend", trend: "RA", microtrend: "Carbon Farming", size: 52 },
        { id: "micro_soil", label: "Soil Regeneration", type: "microtrend", trend: "RA", microtrend: "Soil Regeneration", size: 52 },
        { id: "micro_mrv", label: "MRV", type: "microtrend", trend: "RA", microtrend: "MRV", size: 48 },
        { id: "micro_biofert", label: "Biofertilizers / Microbial Inputs", type: "microtrend", trend: "RA", microtrend: "Biofertilizers / Microbial Inputs", size: 52 },
        { id: "micro_synbio", label: "Synthetic Biology", type: "microtrend", trend: "RA", microtrend: "Synthetic Biology", size: 56 },
        { id: "micro_agdata", label: "Ag‑Data Platforms", type: "microtrend", trend: "RA", microtrend: "Ag‑Data Platforms", size: 48 },
        { id: "micro_circular", label: "Circular Economy", type: "microtrend", trend: "RL", microtrend: "Circular Economy", size: 52 },
        { id: "micro_wasteheat", label: "Waste‑Heat Recovery", type: "microtrend", trend: "RL", microtrend: "Waste‑Heat Recovery", size: 52 },
        { id: "micro_upcycling", label: "Food‑Waste Upcycling", type: "microtrend", trend: "RL", microtrend: "Food‑Waste Upcycling", size: 52 },
        { id: "micro_recycling", label: "Enzymatic / Chemical Recycling", type: "microtrend", trend: "RL", microtrend: "Enzymatic / Chemical Recycling", size: 52 },
        { id: "micro_biobased", label: "Bio‑based Materials", type: "microtrend", trend: "RL", microtrend: "Bio‑based Materials", size: 52 },
        { id: "micro_reverse", label: "Reverse Logistics", type: "microtrend", trend: "RL", microtrend: "Reverse Logistics", size: 52 },
    ];
    // Connectivity
    const edges = [
        { source: "core", target: "ssc" },
        { source: "core", target: "ra" },
        { source: "core", target: "rl" },
        { source: "ssc", target: "des" },
        ...desComponents.map((n) => ({ source: "des", target: n.id })),
        { source: "ssc", target: "district_thermal" },
        { source: "ssc", target: "vpp_derms" },
        { source: "ssc", target: "resilience_hubs" },
        { source: "ssc", target: "smart_home_kits" },
        { source: "ssc", target: "ev_v2g" },
        { source: "ra", target: "agrovoltaics" },
        { source: "ra", target: "soil_mrv" },
        { source: "ra", target: "biofertilizer_coop" },
        { source: "rl", target: "reverse_logistics" },
        { source: "rl", target: "repair_reuse" },
        { source: "rl", target: "plastics_recycling" },
        { source: "rl", target: "food_waste_biogas" },
        { source: "ssc", target: "food_waste_biogas" },
        { source: "rl", target: "circular_construction" },
        { source: "ssc", target: "circular_construction" },
        { source: "ssc", target: "water_circularity" },
        { source: "rl", target: "water_circularity" },
        { source: "ra", target: "urban_farm_network" },
        { source: "rl", target: "urban_farm_network" },
        { source: "ra", target: "synbio_food" },
        { source: "rl", target: "synbio_food" },
        { source: "ssc", target: "micro_microgrids" },
        { source: "ssc", target: "micro_15min" },
        { source: "ssc", target: "micro_vpps" },
        { source: "ssc", target: "micro_derms" },
        { source: "ssc", target: "micro_district" },
        { source: "ssc", target: "micro_resilience" },
        { source: "ssc", target: "micro_v2g" },
        { source: "ssc", target: "micro_smartcity" },
        { source: "ra", target: "micro_precision" },
        { source: "ra", target: "micro_carbon" },
        { source: "ra", target: "micro_soil" },
        { source: "ra", target: "micro_mrv" },
        { source: "ra", target: "micro_biofert" },
        { source: "ra", target: "micro_synbio" },
        { source: "ra", target: "micro_agdata" },
        { source: "rl", target: "micro_circular" },
        { source: "rl", target: "micro_wasteheat" },
        { source: "rl", target: "micro_upcycling" },
        { source: "rl", target: "micro_recycling" },
        { source: "rl", target: "micro_biobased" },
        { source: "rl", target: "micro_reverse" },
        { source: "district_thermal", target: "micro_district" },
        { source: "des_waste_heat", target: "micro_wasteheat" },
        { source: "reverse_logistics", target: "micro_reverse" },
        { source: "plastics_recycling", target: "micro_recycling" },
        { source: "food_waste_biogas", target: "micro_upcycling" },
        { source: "soil_mrv", target: "micro_mrv" },
        { source: "biofertilizer_coop", target: "micro_biofert" },
        { source: "synbio_food", target: "micro_synbio" },
        { source: "ev_v2g", target: "micro_v2g" },
        { source: "vpp_derms", target: "micro_vpps" },
        { source: "des_dashboard", target: "micro_smartcity" },
        { source: "agrovoltaics", target: "micro_precision" },
    ];
    /** ====== REFS & STATE ====== */
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const gRef = useRef(null);
    const zoomRef = useRef(null);
    const transformRef = useRef(d3.zoomIdentity);
    const [dims, setDims] = useState({ w: 1200, h: 720 });
    // UI state
    const [showOriginal, setShowOriginal] = useState(true);
    const [showIdeas, setShowIdeas] = useState(true);
    const [showMicro, setShowMicro] = useState(true);
    const [activeTrends, setActiveTrends] = useState(["SSC", "RA", "RL"]);
    const [colorOn, setColorOn] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [search, setSearch] = useState("");
    const allNodes = useMemo(() => [core, ...mixed, des, ...desComponents, ...largeIdeas, ...microNodes], []);
    /** ====== TYPOGRAPHY & DIMENSIONS HELPERS ====== */
    function fontSizeFor(n) {
        if (n.type === "core")
            return 15;
        if (n.type === "mixed")
            return 15;
        if (n.type === "microtrend")
            return 12;
        if (n.type === "component")
            return 10.5;
        return (n.size || 0) < 90 ? 10.5 : 13;
    }
    function wrapLines(label, maxChars) {
        if (!label)
            return [""];
        if (label.includes("\n"))
            return label.split("\n");
        const words = label.split(/\s+/);
        const lines = [];
        let line = "";
        for (const w of words) {
            const test = (line ? line + " " : "") + w;
            if (test.length <= maxChars)
                line = test;
            else {
                if (line)
                    lines.push(line);
                line = w;
            }
        }
        if (line)
            lines.push(line);
        return lines;
    }
    function pillDims(n) {
        const f = fontSizeFor(n);
        const charW = f * 0.6;
        const baseTarget = n.type === "mixed"
            ? 340
            : n.type === "microtrend"
                ? 240
                : n.type === "idea"
                    ? (n.size || 0) < 90
                        ? 210
                        : 270
                    : 250;
        const targetW = baseTarget;
        const paddingX = 36;
        const paddingY = 14;
        const maxChars = Math.max(8, Math.floor((targetW - paddingX) / charW));
        const lines = wrapLines(n.label, maxChars);
        const longest = Math.max(...lines.map((l) => l.length), 1);
        const w = Math.max(72, Math.min(targetW, longest * charW + paddingX));
        const lineH = f * 1.24;
        const h = Math.max(28, lines.length * lineH + paddingY);
        return { w, h, f, lines, lineH };
    }
    function coreCircleDims(n) {
        const f = 14;
        const charW = f * 0.62;
        const lines = wrapLines(n.label, 22);
        const longest = Math.max(...lines.map((l) => l.length), 1);
        const textW = longest * charW + 32;
        const lineH = f * 1.2;
        const textH = lines.length * lineH + 20;
        const r = Math.max(120, Math.max(textW / 2 + 32, textH / 2 + 32));
        return { r, f, lines, lineH };
    }
    function nodeOpacity(n) {
        var _a;
        if (n.type === "core" || n.type === "mixed")
            return 1;
        if (n.type === "microtrend")
            return 0.25;
        if (n.type === "component" || (n.type === "idea" && (n.size || 0) < 90))
            return 0.12;
        const s = Math.max(60, Math.min(120, (_a = n.size) !== null && _a !== void 0 ? _a : 100));
        const scaled = 0.22 + ((s - 60) / 60) * 0.15;
        return Math.min(0.38, scaled);
    }
    function rawNodeColor(n) {
        if (n.type === "core")
            return COLORS.brand.deep;
        if (n.type === "mixed")
            return (n.trend && COLORS.trends[n.trend]) || COLORS.brand.mint;
        if (n.type === "microtrend")
            return COLORS.micro[n.microtrend] || (n.trend && COLORS.trends[n.trend]) || COLORS.brand.mint;
        const t = n.trend || (n.trends && n.trends[0]);
        return t ? COLORS.trends[t] : COLORS.brand.mint;
    }
    const estimatedMetrics = useMemo(() => {
        const map = new Map();
        allNodes.forEach((n) => {
            if (n.type === "core") {
                const { r } = coreCircleDims(n);
                map.set(n.id, { r });
            }
            else {
                const { w, h } = pillDims(n);
                map.set(n.id, { w, h });
            }
        });
        return map;
    }, [allNodes]);
    /** ====== FILTERING ====== */
    const visibleNodeIds = useMemo(() => {
        var _a;
        const ids = new Set();
        for (const n of allNodes) {
            const inTrend = n.trend ? activeTrends.includes(n.trend) : n.trends ? n.trends.some((t) => activeTrends.includes(t)) : true;
            if (!inTrend)
                continue;
            const isOriginal = (_a = n.tags) === null || _a === void 0 ? void 0 : _a.includes("Original");
            const isMicro = n.type === "microtrend";
            const isIdeaLike = n.type === "idea" || n.type === "component" || n.type === "mixed" || n.type === "core";
            if (isOriginal && !showOriginal)
                continue;
            if (isMicro && !showMicro)
                continue;
            if (isIdeaLike && !showIdeas && !isOriginal && n.type !== "mixed" && n.type !== "core")
                continue;
            ids.add(n.id);
        }
        return ids;
    }, [allNodes, activeTrends, showOriginal, showIdeas, showMicro]);
    const visibleEdges = useMemo(() => edges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)), [visibleNodeIds]);
    const nodeById = useMemo(() => new Map(allNodes.map((n) => [n.id, n])), [allNodes]);
    /** ====== LAYOUT (RADIAL) ====== */
    function sectorAngles(t) {
        const centers = { SSC: -Math.PI / 2, RA: Math.PI / 6, RL: (5 * Math.PI) / 6 };
        const center = centers[t];
        const half = (Math.PI * 2) / 6; // 60° span either side → 120° sector
        return { center, start: center - half, end: center + half };
    }
    function polar(cx, cy, r, a) { return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }; }
    function averageAngles(angles) {
        const sx = d3.mean(angles.map((a) => Math.cos(a))) || 0;
        const sy = d3.mean(angles.map((a) => Math.sin(a))) || 0;
        return Math.atan2(sy, sx);
    }
    const positions = useMemo(() => {
        const W = dims.w, H = dims.h;
        const cx = W / 2, cy = H / 2;
        const M = Math.min(W, H);
        const R1 = M * 0.22; // mixed
        const R2 = M * 0.40; // microtrends (+ DES)
        const R3 = M * 0.62; // big ideas inner ring
        const R3b = R3 + 14; // stagger ring for spacing
        const R4 = M * 0.78; // small ideas outer ring
        const R4b = R4 + 22; // second outer ring for spacing
        const pos = new Map();
        // center
        pos.set("core", { x: cx, y: cy });
        // mixed trends
        ["SSC", "RA", "RL"].forEach((t) => {
            const { center } = sectorAngles(t);
            const p = polar(cx, cy, R1, center);
            pos.set(t.toLowerCase(), { x: p.x, y: p.y, a: center, r: R1 });
        });
        pos.__R = { R1, R2, R3, R3b, R4, R4b, cx, cy, M };
        // microtrends along R2
        const byTrend = { SSC: [], RA: [], RL: [] };
        microNodes.forEach((m) => byTrend[m.trend].push(m));
        function layoutBand(items, angleStart, angleEnd, padding) {
            if (!items.length)
                return;
            const start = angleStart + padding;
            const end = angleEnd - padding;
            if (end <= start) {
                items.forEach(({ node, radius }) => {
                    const a = (angleStart + angleEnd) / 2;
                    const p = polar(cx, cy, radius, a);
                    pos.set(node.id, { x: p.x, y: p.y, a, r: radius });
                });
                return;
            }
            const entries = items.map(({ node, radius }) => {
                var _a;
                const metric = estimatedMetrics.get(node.id);
                const width = ((_a = metric === null || metric === void 0 ? void 0 : metric.w) !== null && _a !== void 0 ? _a : 160) + 48;
                return { node, radius, width };
            });
            const available = end - start;
            let arcs = entries.map((entry) => entry.width / entry.radius);
            let totalArc = d3.sum(arcs);
            if (totalArc > available) {
                const scale = Math.min(totalArc / Math.max(available, 0.0001) + 0.08, 1.8);
                entries.forEach((entry) => {
                    entry.radius *= scale;
                });
                arcs = entries.map((entry) => entry.width / entry.radius);
                totalArc = d3.sum(arcs);
            }
            const gap = Math.max((available - totalArc) / (entries.length + 1), (6 * Math.PI) / 180 / (entries.length || 1));
            let cursor = start + gap;
            entries.forEach((entry, idx) => {
                const arc = entry.width / entry.radius;
                const angle = cursor + arc / 2;
                cursor += arc + gap;
                const p = polar(cx, cy, entry.radius, angle);
                pos.set(entry.node.id, { x: p.x, y: p.y, a: angle, r: entry.radius });
            });
        }
        Object.keys(byTrend).forEach((t) => {
            const arr = byTrend[t];
            const { start, end } = sectorAngles(t);
            const items = arr.map((node) => ({ node, radius: R2 }));
            layoutBand(items, start, end, (14 * Math.PI) / 180);
        });
        // DES on R2 within SSC
        const aDes = sectorAngles("SSC").center + (18 * Math.PI) / 180;
        const pDes = polar(cx, cy, R2, aDes);
        pos.set("des", { x: pDes.x, y: pDes.y, a: aDes, r: R2 });
        // DES components orbit
        const compR = 130;
        desComponents.forEach((c, i) => {
            const ang = aDes + (i / desComponents.length) * Math.PI * 1.8 - Math.PI * 0.9;
            const p = { x: pDes.x + compR * Math.cos(ang), y: pDes.y + compR * Math.sin(ang) };
            pos.set(c.id, { x: p.x, y: p.y, a: ang });
        });
        // ideas → big (R3/R3b) and small (R4/R4b)
        const big = [], small = [];
        largeIdeas.forEach((n) => { var _a; return (((_a = n.size) !== null && _a !== void 0 ? _a : 0) >= 90 ? big : small).push(n); });
        function filterByTrend(arr, trend) {
            return arr.filter((n) => n.trend === trend ||
                (!!n.trends && n.trends.length === 1 && n.trends[0] === trend) ||
                (n.trends && n.trends.length > 1 && n.trends.includes(trend)));
        }
        ["SSC", "RA", "RL"].forEach((t) => {
            const subset = filterByTrend(big, t).filter((n) => !(n.trends && n.trends.length > 1));
            const { start, end } = sectorAngles(t);
            const items = subset.map((n, i) => ({ node: n, radius: i % 2 === 0 ? R3 : R3b }));
            layoutBand(items, start, end, (20 * Math.PI) / 180);
        });
        ["SSC", "RA", "RL"].forEach((t) => {
            const subset = filterByTrend(small, t).filter((n) => !(n.trends && n.trends.length > 1));
            const { start, end } = sectorAngles(t);
            const items = subset.map((n, i) => ({ node: n, radius: i % 2 === 0 ? R4 : R4b }));
            layoutBand(items, start, end, (22 * Math.PI) / 180);
        });
        const multiTrendIdeas = largeIdeas.filter((n) => (n.trends || []).length > 1);
        if (multiTrendIdeas.length) {
            const items = multiTrendIdeas.map((n) => {
                const angs = (n.trends || []).map((t) => sectorAngles(t).center);
                const a = averageAngles(angs);
                return { node: n, radius: R3 + 24, angle: a };
            });
            items.sort((a, b) => a.angle - b.angle);
            const minSpacing = (18 * Math.PI) / 180;
            for (let i = 1; i < items.length; i++) {
                const prev = items[i - 1];
                const curr = items[i];
                if (curr.angle - prev.angle < minSpacing) {
                    const shift = minSpacing - (curr.angle - prev.angle);
                    curr.angle += shift;
                }
            }
            items.forEach(({ node, radius, angle }) => {
                const p = polar(cx, cy, radius, angle);
                pos.set(node.id, { x: p.x, y: p.y, a: angle, r: radius });
            });
        }
        return pos;
    }, [dims, estimatedMetrics, microNodes, desComponents, largeIdeas]);
    const layoutPositionsRef = useRef(positions);
    /** ====== RENDER ====== */
    useEffect(() => {
        var _a;
        const svg = d3.select(svgRef.current);
        const g = d3.select(gRef.current);
        svg.selectAll("defs").remove();
        const defs = svg.append("defs");
        const shadow = defs
            .append("filter")
            .attr("id", "nodeShadow")
            .attr("x", "-40%")
            .attr("y", "-40%")
            .attr("width", "180%")
            .attr("height", "180%")
            .attr("color-interpolation-filters", "sRGB");
        shadow
            .append("feDropShadow")
            .attr("dx", 0)
            .attr("dy", 0)
            .attr("stdDeviation", 6)
            .attr("flood-color", "#1c5c40")
            .attr("flood-opacity", 0.45);
        const nodes = allNodes.filter((n) => visibleNodeIds.has(n.id));
        const links = visibleEdges.map((e, i) => ({ ...e, __id: i }));
        layoutPositionsRef.current = new Map(positions);
        const metricsCache = new Map();
        nodes.forEach((n) => {
            const metric = n.type === "core" ? coreCircleDims(n) : pillDims(n);
            metricsCache.set(n.id, metric);
        });
        const adjacency = new Map();
        links.forEach((l) => {
            if (!adjacency.has(l.source))
                adjacency.set(l.source, new Set());
            if (!adjacency.has(l.target))
                adjacency.set(l.target, new Set());
            adjacency.get(l.source).add(l.target);
            adjacency.get(l.target).add(l.source);
        });
        const neighborSet = new Set();
        if (selectedId) {
            neighborSet.add(selectedId);
            (_a = adjacency.get(selectedId)) === null || _a === void 0 ? void 0 : _a.forEach((id) => neighborSet.add(id));
        }
        links.forEach((l) => {
            const a = nodeById.get(l.source);
            const b = nodeById.get(l.target);
            const id = `grad_${l.__id}`;
            const c1 = rawNodeColor(a);
            const c2 = rawNodeColor(b);
            const grad = defs.append("linearGradient").attr("id", id).attr("gradientUnits", "userSpaceOnUse");
            grad.append("stop").attr("offset", "0%").attr("stop-color", c1);
            grad.append("stop").attr("offset", "100%").attr("stop-color", c2);
            l.__grad = id;
        });
        const gLinks = g.selectAll("g.edge-layer").data([0]).join("g").attr("class", "edge-layer");
        const gNodes = g.selectAll("g.node-layer").data([0]).join("g").attr("class", "node-layer");
        function anchorPoint(id, otherId) {
            var _a, _b;
            const node = nodeById.get(id);
            const p = positions.get(id);
            const other = positions.get(otherId);
            const angle = Math.atan2(other.y - p.y, other.x - p.x);
            if (node.type === "core") {
                const metric = metricsCache.get(id) || { r: 120 };
                const r = (metric.r || 120) + 4;
                return { x: p.x + Math.cos(angle) * r, y: p.y + Math.sin(angle) * r };
            }
            const metric = metricsCache.get(id) || { w: 160, h: 60 };
            const hw = ((_a = metric.w) !== null && _a !== void 0 ? _a : 160) / 2 + 6;
            const hh = ((_b = metric.h) !== null && _b !== void 0 ? _b : 60) / 2 + 6;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const scale = 1 / Math.max(Math.abs(cos) / hw, Math.abs(sin) / hh, 0.0001);
            return { x: p.x + cos * hw * scale, y: p.y + sin * hh * scale };
        }
        function linkPath(s, t) {
            const dx = t.x - s.x, dy = t.y - s.y;
            const dist = Math.hypot(dx, dy);
            const nx = -dy / (dist || 1), ny = dx / (dist || 1);
            const curv = Math.min(80, dist * 0.25);
            const c1 = { x: s.x + dx * 0.33 + nx * curv, y: s.y + dy * 0.33 + ny * curv };
            const c2 = { x: s.x + dx * 0.66 - nx * curv, y: s.y + dy * 0.66 - ny * curv };
            return `M ${s.x},${s.y} C ${c1.x},${c1.y} ${c2.x},${c2.y} ${t.x},${t.y}`;
        }
        // LINKS (behind)
        const linkSel = gLinks
            .selectAll("path.link")
            .data(links, (d) => `${d.source}-${d.target}`)
            .join((enter) => enter.append("path").attr("class", "link").attr("fill", "none").attr("stroke-width", 2).attr("stroke-linecap", "round"));
        linkSel
            .attr("d", (d) => {
            const start = anchorPoint(d.source, d.target);
            const end = anchorPoint(d.target, d.source);
            d.__start = start;
            d.__end = end;
            return linkPath(start, end);
        })
            .attr("stroke", (d) => {
            const start = d.__start;
            const end = d.__end;
            const lg = svg.select(`linearGradient#${d.__grad}`);
            lg.attr("x1", start.x).attr("y1", start.y).attr("x2", end.x).attr("y2", end.y);
            const active = !selectedId || d.source === selectedId || d.target === selectedId;
            if (!colorOn || !active)
                return COLORS.gray.edge;
            return `url(#${d.__grad})`;
        })
            .attr("opacity", (d) => {
            const active = !selectedId || d.source === selectedId || d.target === selectedId;
            return active ? 0.82 : 0.15;
        })
            .attr("stroke-width", (d) => (!selectedId || d.source === selectedId || d.target === selectedId ? 2.4 : 1.8));
        // NODES
        const nodeSel = gNodes
            .selectAll("g.node")
            .data(nodes, (d) => d.id)
            .join((enter) => {
            const gN = enter.append("g").attr("class", "node cursor-pointer");
            gN.append("rect").attr("rx", 14).attr("ry", 14).attr("stroke-width", 1.1);
            gN.append("circle").attr("class", "core-circle").attr("r", 0);
            gN.append("text").attr("class", "label select-none").attr("text-anchor", "middle");
            return gN;
        })
            .on("click", (_evt, d) => {
            var _a;
            setSelectedId((prev) => (prev === d.id ? null : d.id));
            const t = transformRef.current.k;
            const p = (_a = layoutPositionsRef.current.get(d.id)) !== null && _a !== void 0 ? _a : positions.get(d.id);
            const z = Math.max(1.1, t);
            const newT = d3.zoomIdentity.translate(dims.w / 2 - z * p.x, dims.h / 2 - z * p.y).scale(z);
            d3.select(svgRef.current).transition().duration(600).call(zoomRef.current.transform, newT);
        });
        nodeSel.each(function (d) {
            var _a, _b;
            const gN = d3.select(this);
            const p = positions.get(d.id);
            const isSelected = selectedId === d.id;
            const isNeighbor = neighborSet.has(d.id);
            const shouldFade = !!selectedId && !isNeighbor;
            if (d.type === "core") {
                const { r, f, lines, lineH } = coreCircleDims(d);
                gN.select("rect").attr("display", "none");
                gN
                    .select("circle.core-circle")
                    .attr("display", "block")
                    .attr("r", r)
                    .attr("fill", colorOn && !shouldFade ? COLORS.brand.deep : COLORS.gray.nodeFill)
                    .attr("stroke", d3.color(colorOn && !shouldFade ? COLORS.brand.deep : COLORS.gray.nodeStroke).darker(0.2).toString())
                    .attr("opacity", isSelected ? 1 : shouldFade ? 0.65 : 1);
                const txt = gN.select("text");
                txt.selectAll("tspan").remove();
                txt
                    .attr("font-family", "'Montserrat', ui-sans-serif")
                    .attr("font-weight", 700)
                    .attr("font-size", f)
                    .attr("fill", isSelected || (!shouldFade && colorOn) ? "#ffffff" : COLORS.gray.text);
                lines.forEach((ln, i) => txt.append("tspan").attr("x", 0).attr("dy", i === 0 ? -((lines.length - 1) * lineH) / 2 : lineH).text(ln));
                gN.attr("transform", `translate(${p.x},${p.y})`);
                gN.attr("filter", isSelected ? "url(#nodeShadow)" : null);
                return;
            }
            const { w, h, f, lines, lineH } = pillDims(d);
            const fill = !colorOn || shouldFade ? COLORS.gray.nodeFill : rawNodeColor(d);
            const stroke = !colorOn || shouldFade ? COLORS.gray.nodeStroke : ((_b = (_a = d3.color(fill)) === null || _a === void 0 ? void 0 : _a.darker(0.7)) === null || _b === void 0 ? void 0 : _b.toString()) || "#2c2c2c";
            const opBase = nodeOpacity(d);
            const op = isSelected ? 1 : shouldFade ? opBase * 0.45 : opBase;
            gN.select("circle.core-circle").attr("display", "none");
            gN
                .select("rect")
                .attr("display", "block")
                .attr("x", -w / 2)
                .attr("y", -h / 2)
                .attr("width", w)
                .attr("height", h)
                .attr("fill", fill)
                .attr("stroke", stroke)
                .attr("opacity", op);
            const txt = gN.select("text");
            txt.selectAll("tspan").remove();
            txt
                .attr("font-family", "'Montserrat', ui-sans-serif")
                .attr("font-weight", d.type === "mixed" ? 700 : 600)
                .attr("font-size", f)
                .attr("fill", isSelected
                ? COLORS.brand.deep
                : !colorOn || shouldFade
                    ? COLORS.gray.text
                    : "#00302a");
            lines.forEach((ln, i) => txt.append("tspan").attr("x", 0).attr("dy", i === 0 ? -((lines.length - 1) * lineH) / 2 : lineH).text(ln));
            gN.attr("transform", `translate(${p.x},${p.y})`);
            gN.attr("filter", isSelected ? "url(#nodeShadow)" : null);
        });
        if (!zoomRef.current) {
            zoomRef.current = d3.zoom().scaleExtent([0.6, 2.8]).on("zoom", (event) => {
                transformRef.current = event.transform;
                g.attr("transform", transformRef.current.toString());
            });
            d3.select(svgRef.current).call(zoomRef.current);
        }
    }, [positions, visibleNodeIds, visibleEdges, colorOn, dims, selectedId, allNodes, nodeById]);
    /** ====== RESIZE ====== */
    useEffect(() => {
        const ro = new ResizeObserver((entries) => { for (const e of entries) {
            const cr = e.contentRect;
            setDims({ w: cr.width, h: cr.height });
        } });
        if (containerRef.current)
            ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);
    /** ====== SEARCH ====== */
    function handleSearchSubmit(e) {
        e.preventDefault();
        const q = search.trim().toLowerCase();
        if (!q)
            return;
        const target = allNodes.find((n) => n.label.toLowerCase().includes(q));
        if (!target)
            return;
        setSelectedId(target.id);
        const t = transformRef.current.k;
        const p = positions.get(target.id);
        const z = Math.max(1.1, t);
        const newT = d3.zoomIdentity.translate(dims.w / 2 - z * p.x, dims.h / 2 - z * p.y).scale(z);
        d3.select(svgRef.current).transition().duration(650).call(zoomRef.current.transform, newT);
    }
    /** ====== UI HELPERS ====== */
    function trendChip(t) {
        var _a, _b;
        const label = t === "SSC" ? "Self‑Sustaining Communities" : t === "RA" ? "Regenerative Agriculture" : "Resource Looping";
        const color = COLORS.trends[t];
        return (React.createElement("button", { key: t, onClick: () => setActiveTrends((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])), className: `rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2 border transition-colors ${activeTrends.includes(t) ? "text-slate-900" : "opacity-40 hover:opacity-60"}`, style: { background: color, borderColor: (_b = (_a = d3.color(color)) === null || _a === void 0 ? void 0 : _a.darker(0.6)) === null || _b === void 0 ? void 0 : _b.toString() }, title: label }, label));
    }
    const selected = selectedId ? allNodes.find((n) => n.id === selectedId) : null;
    return (React.createElement("div", { ref: containerRef, className: "relative w-full h-[88vh] bg-white" },
        React.createElement("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
        React.createElement("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" }),
        React.createElement("link", { href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Roboto+Mono:wght@500;600&display=swap", rel: "stylesheet" }),
        React.createElement("div", { className: "absolute top-0 left-0 right-0 z-20 pointer-events-none" },
            React.createElement("div", { className: "mx-auto max-w-7xl px-4 py-4" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement("div", { className: "pointer-events-auto" },
                        React.createElement("h1", { className: "text-2xl sm:text-3xl font-bold", style: { fontFamily: "'Montserrat', ui-sans-serif", color: COLORS.brand.deep } }, "Dream \u2014 Opportunities in Regenerative Economies"),
                        React.createElement("p", { className: "text-sm text-slate-500 mt-1", style: { fontFamily: "'Roboto Mono', ui-monospace" } }, "Structured radial map \u2022 Zoom, filter, and click nodes for details.")),
                    React.createElement("div", { className: "pointer-events-auto flex items-center gap-3" },
                        React.createElement("label", { className: "flex items-center gap-2 text-sm" },
                            React.createElement("input", { type: "checkbox", checked: colorOn, onChange: (e) => setColorOn(e.target.checked), className: "h-4 w-4 rounded border-slate-300" }),
                            React.createElement("span", null, "Color coding")),
                        React.createElement("label", { className: "flex items-center gap-2 text-sm" },
                            React.createElement("input", { type: "checkbox", checked: showOriginal, onChange: (e) => setShowOriginal(e.target.checked), className: "h-4 w-4 rounded border-slate-300" }),
                            React.createElement("span", null, "Original (A2)")),
                        React.createElement("label", { className: "flex items-center gap-2 text-sm" },
                            React.createElement("input", { type: "checkbox", checked: showIdeas, onChange: (e) => setShowIdeas(e.target.checked), className: "h-4 w-4 rounded border-slate-300" }),
                            React.createElement("span", null, "Additional ideas")),
                        React.createElement("label", { className: "flex items-center gap-2 text-sm" },
                            React.createElement("input", { type: "checkbox", checked: showMicro, onChange: (e) => setShowMicro(e.target.checked), className: "h-4 w-4 rounded border-slate-300" }),
                            React.createElement("span", null, "Microtrends")))))),
        React.createElement("div", { className: "absolute left-4 top-24 z-20 w-[320px] pointer-events-auto" },
            React.createElement("div", { className: "rounded-2xl shadow-lg border border-slate-200 bg-white/95 backdrop-blur p-4" },
                React.createElement("div", { className: "mb-3" },
                    React.createElement("div", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2", style: { fontFamily: "'Roboto Mono', ui-monospace" } }, "Filters"),
                    React.createElement("div", { className: "flex flex-wrap" }, ["SSC", "RA", "RL"].map((t) => trendChip(t)))),
                React.createElement("form", { onSubmit: handleSearchSubmit, className: "mb-3" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("input", { type: "text", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search ideas, microtrends\u2026", className: "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300", style: { fontFamily: "'Montserrat', ui-sans-serif" }, list: "node-suggestions" }),
                        React.createElement("button", { type: "submit", className: "rounded-xl px-3 py-2 text-sm font-semibold text-white", style: { background: COLORS.brand.primary } }, "Go")),
                    React.createElement("datalist", { id: "node-suggestions" }, allNodes.map((n) => (React.createElement("option", { key: n.id, value: n.label.replace(/\n/g, ' ') }))))),
                React.createElement("div", { className: "text-[11px] text-slate-500 leading-relaxed" },
                    React.createElement("p", null,
                        React.createElement("span", { className: "font-semibold" }, "Tip:"),
                        " Wavy links show influence and connection. Toggle color off for grayscale; selecting a node refocuses the view.")))),
        React.createElement("svg", { ref: svgRef, className: "absolute inset-0 w-full h-full", role: "graphics-document" },
            React.createElement("g", { ref: gRef })),
        React.createElement("div", { className: `absolute top-20 right-4 z-30 w-[360px] transition-all duration-300 pointer-events-auto ${selected ? "translate-x-0 opacity-100" : "translate-x-[380px] opacity-0 pointer-events-none"}` },
            React.createElement("div", { className: "rounded-2xl shadow-xl border border-slate-200 bg-white/95 backdrop-blur p-5" }, selected ? (React.createElement("div", null,
                React.createElement("div", { className: "flex items-start justify-between gap-4" },
                    React.createElement("h2", { className: "text-lg font-bold", style: { fontFamily: "'Montserrat', ui-sans-serif", color: COLORS.brand.deep } }, selected.label.split('\n').join(' ')),
                    React.createElement("button", { onClick: () => setSelectedId(null), title: "Close", className: "text-slate-500 hover:text-slate-700" }, "\u2715")),
                (selected.trends || selected.trend) && (React.createElement("div", { className: "mt-2 flex flex-wrap gap-2" }, (selected.trends || (selected.trend ? [selected.trend] : [])).map((t) => {
                    var _a, _b;
                    return (React.createElement("span", { key: t, className: "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium border", style: { background: COLORS.trends[t], borderColor: (_b = (_a = d3.color(COLORS.trends[t])) === null || _a === void 0 ? void 0 : _a.darker(0.6)) === null || _b === void 0 ? void 0 : _b.toString() } }, t === "SSC" ? "Self‑Sustaining Communities" : t === "RA" ? "Regenerative Agriculture" : "Resource Looping"));
                }))),
                selected.tags && selected.tags.length > 0 && (React.createElement("div", { className: "mt-2 flex flex-wrap gap-2" }, selected.tags.map((tag) => (React.createElement("span", { key: tag, className: "inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium border border-slate-200" }, tag))))),
                selected.microtrend && (React.createElement("div", { className: "mt-2" },
                    React.createElement("span", { className: "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium border", style: { background: (_a = COLORS.micro[selected.microtrend]) !== null && _a !== void 0 ? _a : COLORS.brand.mint, borderColor: (_d = (_c = d3.color((_b = COLORS.micro[selected.microtrend]) !== null && _b !== void 0 ? _b : COLORS.brand.mint)) === null || _c === void 0 ? void 0 : _c.darker(0.6)) === null || _d === void 0 ? void 0 : _d.toString() } },
                        "Microtrend: ",
                        selected.microtrend))),
                React.createElement("p", { className: "mt-3 text-sm text-slate-700 leading-relaxed", style: { fontFamily: "'Montserrat', ui-sans-serif" } }, selected.desc || "Explore connections and related microtrends by following the curved links in the map."),
                selected.id === "des" && (React.createElement("div", { className: "mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3" },
                    React.createElement("div", { className: "text-[11px] font-semibold uppercase tracking-wide text-emerald-700", style: { fontFamily: "'Roboto Mono', ui-monospace" } }, "DES Components"),
                    React.createElement("ul", { className: "mt-1 text-sm list-disc pl-5 text-emerald-900" },
                        React.createElement("li", null, "Critical\u2011load batteries sized for essential services + market revenue"),
                        React.createElement("li", null, "Smart Energy Centres as local control rooms for thermal + electrical"),
                        React.createElement("li", null, "EV mobility service integrated with V2X"),
                        React.createElement("li", null, "Waste\u2011heat capture tied to district loops"),
                        React.createElement("li", null, "Digital dashboard with portfolio\u2011level DERMS + resident app")))))) : null)),
        React.createElement("div", { className: "absolute bottom-3 right-4 text-[11px] text-slate-400", style: { fontFamily: "'Roboto Mono', ui-monospace" } }, "\u00A9 Dream \u2014 Conceptual & Foresight Methods \u2022 Interactive map v4")));
}
function mountDreamOpportunitiesMap() {
    const mount = document.getElementById("dream-map-root");
    if (mount && !mount.dataset.dreamMapMounted) {
        mount.dataset.dreamMapMounted = "true";
        const root = ReactDOM.createRoot(mount);
        root.render(React.createElement(DreamOpportunitiesMapV4, null));
    }
}
if (typeof window !== "undefined") {
    // @ts-ignore expose for debugging when loaded via script tag
    window.DreamOpportunitiesMapV4 = DreamOpportunitiesMapV4;
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        mountDreamOpportunitiesMap();
    }, { once: true });
}
else {
    mountDreamOpportunitiesMap();
}
