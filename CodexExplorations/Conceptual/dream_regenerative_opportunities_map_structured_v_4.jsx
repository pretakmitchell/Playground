import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

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

export default function DreamOpportunitiesMapV4() {
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
  } as const;

  /** ====== DATA ====== */
  type NodeType = "core" | "mixed" | "idea" | "component" | "microtrend";
  type TrendKey = "SSC" | "RA" | "RL";

  type GraphNode = {
    id: string;
    label: string;
    type: NodeType;
    trend?: TrendKey;
    trends?: TrendKey[];
    microtrend?: string;
    tags?: string[];
    size?: number;
    desc?: string;
  };

  type GraphEdge = { source: string; target: string; relation?: string };

  const core: GraphNode = {
    id: "core",
    label: "Dream — Opportunities\nin Regenerative\nEconomies",
    type: "core",
    size: 200,
    desc: "Center of the map. A strategy lens connecting Dream’s developments to regenerative, circular, and self‑sustaining opportunity spaces.",
    tags: ["Center", "Vision"],
  };

  const mixed: GraphNode[] = [
    { id: "ssc", label: "Self‑Sustaining / Regenerative\nCommunities", type: "mixed", trend: "SSC", size: 120, tags: ["Mixed Trend"], desc: "Decentralized, resilient, data‑driven civic infrastructure: microgrids, VPPs, DERMS, district energy, V2G, resilience hubs, smart‑city fabric." },
    { id: "ra", label: "Regenerative Agriculture /\nResource‑Positive Food Systems", type: "mixed", trend: "RA", size: 120, tags: ["Mixed Trend"], desc: "Precision ag, soil health, MRV, carbon farming, biofertilizers, synbio for ag, ag‑data platforms, urban and peri‑urban food webs." },
    { id: "rl", label: "Resource Looping /\nCircular Systems", type: "mixed", trend: "RL", size: 120, tags: ["Mixed Trend"], desc: "Circular economy, reverse logistics, waste‑heat upcycling, chemical/enzymatic recycling, circular materials & construction." },
  ];

  const des: GraphNode = { id: "des", label: "Dream Energy System\n(DES)", type: "idea", trend: "SSC", size: 120, tags: ["Original", "Platform"], desc: "Community energy platform integrating storage, mobility, heat recovery, and a digital operating layer." };
  const desComponents: GraphNode[] = [
    { id: "des_storage", label: "Critical‑Load\nEnergy Storage", type: "component", trend: "SSC", size: 62, tags: ["Original", "Storage"], desc: "Resilience‑first batteries sized for essential loads and grid services revenue." },
    { id: "des_smart_centres", label: "Smart Energy\nCentres", type: "component", trend: "SSC", size: 60, tags: ["Original", "Operations"], desc: "On‑site hubs integrating thermal, PV, controls, and communications — the DES brain." },
    { id: "des_ev_mobility", label: "Electric Vehicle\nMobility Service", type: "component", trend: "SSC", size: 66, tags: ["Original", "Mobility"], desc: "Shared EVs + charging as a service, integrated with V2X for flexibility markets." },
    { id: "des_waste_heat", label: "Waste‑Heat\nRecovery Units", type: "component", trend: "SSC", size: 60, tags: ["Original", "Thermal"], desc: "Capture low‑grade heat from data rooms, retail, and wastewater for district loops." },
    { id: "des_dashboard", label: "Digital Energy\nSystems Dashboard", type: "component", trend: "SSC", size: 60, tags: ["Original", "Digital"], desc: "Portfolio‑level command, DERMS control, carbon & comfort KPIs, and resident apps." },
  ];

  const largeIdeas: GraphNode[] = [
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

  const microNodes: GraphNode[] = [
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
  const edges: GraphEdge[] = [
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
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const [dims, setDims] = useState({ w: 1200, h: 720 });

  // UI state
  const [showOriginal, setShowOriginal] = useState(true);
  const [showIdeas, setShowIdeas] = useState(true);
  const [showMicro, setShowMicro] = useState(true);
  const [activeTrends, setActiveTrends] = useState<TrendKey[]>(["SSC", "RA", "RL"]);
  const [colorOn, setColorOn] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const allNodes: GraphNode[] = useMemo(() => [core, ...mixed, des, ...desComponents, ...largeIdeas, ...microNodes], []);

  /** ====== FILTERING ====== */
  const visibleNodeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const n of allNodes) {
      const inTrend = n.trend ? activeTrends.includes(n.trend) : n.trends ? n.trends.some((t) => activeTrends.includes(t)) : true;
      if (!inTrend) continue;
      const isOriginal = n.tags?.includes("Original");
      const isMicro = n.type === "microtrend";
      const isIdeaLike = n.type === "idea" || n.type === "component" || n.type === "mixed" || n.type === "core";
      if (isOriginal && !showOriginal) continue;
      if (isMicro && !showMicro) continue;
      if (isIdeaLike && !showIdeas && !isOriginal && n.type !== "mixed" && n.type !== "core") continue;
      ids.add(n.id);
    }
    return ids;
  }, [allNodes, activeTrends, showOriginal, showIdeas, showMicro]);

  const visibleEdges = useMemo(() => edges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)), [visibleNodeIds]);

  const nodeById = useMemo(() => new Map(allNodes.map((n) => [n.id, n])), [allNodes]);

  /** ====== LAYOUT (RADIAL) ====== */
  function sectorAngles(t: TrendKey) {
    const centers: Record<TrendKey, number> = { SSC: -Math.PI / 2, RA: Math.PI / 6, RL: (5 * Math.PI) / 6 };
    const center = centers[t];
    const half = (Math.PI * 2) / 6; // 60° span either side → 120° sector
    return { center, start: center - half, end: center + half };
  }

  function polar(cx: number, cy: number, r: number, a: number) { return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }; }
  function averageAngles(angles: number[]) {
    const sx = d3.mean(angles.map((a) => Math.cos(a))) || 0;
    const sy = d3.mean(angles.map((a) => Math.sin(a))) || 0;
    return Math.atan2(sy, sx);
  }

  const positions = useMemo(() => {
    const W = dims.w, H = dims.h; const cx = W / 2, cy = H / 2; const M = Math.min(W, H);
    const R1 = M * 0.22; // mixed
    const R2 = M * 0.40; // microtrends (+ DES)
    const R3 = M * 0.62; // big ideas inner ring
    const R3b = R3 + 14;  // stagger ring for spacing
    const R4 = M * 0.78; // small ideas outer ring
    const R4b = R4 + 22; // second outer ring for spacing

    const pos = new Map<string, { x: number; y: number; a?: number }>();

    // center
    pos.set("core", { x: cx, y: cy });

    // mixed trends
    (["SSC", "RA", "RL"] as TrendKey[]).forEach((t) => {
      const { center } = sectorAngles(t);
      const p = polar(cx, cy, R1, center);
      pos.set(t.toLowerCase(), { x: p.x, y: p.y, a: center });
    });

    (pos as any).__R = { R1, R2, R3, R3b, R4, R4b, cx, cy, M };

    // microtrends along R2
    const byTrend: Record<TrendKey, GraphNode[]> = { SSC: [], RA: [], RL: [] } as any;
    microNodes.forEach((m) => byTrend[m.trend as TrendKey].push(m));
    (Object.keys(byTrend) as TrendKey[]).forEach((t) => {
      const arr = byTrend[t];
      const { start, end } = sectorAngles(t);
      const pad = (12 * Math.PI) / 180;
      const angles = d3.range(arr.length).map((i) => d3.interpolateNumber(start + pad, end - pad)(arr.length === 1 ? 0.5 : i / (arr.length - 1)));
      arr.forEach((n, i) => { const a = angles[i]; const p = polar(cx, cy, R2, a); pos.set(n.id, { x: p.x, y: p.y, a }); });
    });

    // DES on R2 within SSC
    const aDes = sectorAngles("SSC").center + (18 * Math.PI) / 180;
    const pDes = polar(cx, cy, R2, aDes);
    pos.set("des", { x: pDes.x, y: pDes.y, a: aDes });

    // DES components orbit
    const compR = 130;
    desComponents.forEach((c, i) => {
      const ang = aDes + (i / desComponents.length) * Math.PI * 1.8 - Math.PI * 0.9;
      const p = { x: pDes.x + compR * Math.cos(ang), y: pDes.y + compR * Math.sin(ang) };
      pos.set(c.id, { x: p.x, y: p.y, a: ang });
    });

    // ideas → big (R3/R3b) and small (R4/R4b)
    const big: GraphNode[] = [], small: GraphNode[] = [];
    largeIdeas.forEach((n) => ((n.size ?? 0) >= 90 ? big : small).push(n));

    function placeRing(arr: GraphNode[], trend: TrendKey, Rprimary: number, Ralt: number) {
      const subset = arr.filter((n) => (n.trend || n.trends?.[0]) === trend || (n.trends && n.trends.length === 1 && n.trends[0] === trend));
      const { start, end } = sectorAngles(trend);
      const pad = (18 * Math.PI) / 180;
      const angles = d3.range(subset.length).map((i) => d3.interpolateNumber(start + pad, end - pad)(subset.length === 1 ? 0.5 : i / (subset.length - 1)));
      subset.forEach((n, i) => {
        const a = angles[i];
        const r = i % 2 === 0 ? Rprimary : Ralt; // stagger radius to reduce overlaps
        const p = polar(cx, cy, r, a);
        pos.set(n.id, { x: p.x, y: p.y, a });
      });
    }

    (["SSC", "RA", "RL"] as TrendKey[]).forEach((t) => placeRing(big, t, R3, R3b));
    (["SSC", "RA", "RL"] as TrendKey[]).forEach((t) => placeRing(small, t, R4, R4b));

    // multi‑trend ideas averaged, placed between R3 and R4
    largeIdeas.filter((n) => (n.trends || []).length > 1).forEach((n, idx) => {
      const angs = (n.trends || []).map((t) => sectorAngles(t as TrendKey).center);
      const a = averageAngles(angs);
      const r = R3 + 10 + (idx % 3) * 16; // stagger three bands
      const p = polar(cx, cy, r, a);
      pos.set(n.id, { x: p.x, y: p.y, a });
    });

    return pos;
  }, [dims]);

  /** ====== RENDER ====== */
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    svg.selectAll("defs").remove();
    const defs = svg.append("defs");

    const nodes = allNodes.filter((n) => visibleNodeIds.has(n.id));
    const links = visibleEdges.map((e, i) => ({ ...e, __id: i }));

    links.forEach((l) => {
      const a = nodeById.get(l.source)!; const b = nodeById.get(l.target)!;
      const id = `grad_${l.__id}`;
      const c1 = colorOn ? baseColor(a) : COLORS.gray.edge;
      const c2 = colorOn ? baseColor(b) : COLORS.gray.edge;
      const grad = defs.append("linearGradient").attr("id", id).attr("gradientUnits", "userSpaceOnUse");
      grad.append("stop").attr("offset", "0%").attr("stop-color", c1);
      grad.append("stop").attr("offset", "100%" ).attr("stop-color", c2);
      (l as any).__grad = id;
    });

    const gLinks = g.selectAll("g.edge-layer").data([0]).join("g").attr("class", "edge-layer");
    const gNodes = g.selectAll("g.node-layer").data([0]).join("g").attr("class", "node-layer");

    function baseColor(n: GraphNode) {
      if (n.type === "core") return COLORS.brand.deep;
      if (n.type === "mixed") return (n.trend && COLORS.trends[n.trend]) || COLORS.brand.mint;
      if (n.type === "microtrend") return COLORS.micro[n.microtrend as keyof typeof COLORS.micro] || (n.trend && COLORS.trends[n.trend]) || COLORS.brand.mint;
      const t = n.trend || (n.trends && n.trends[0]);
      return t ? COLORS.trends[t] : COLORS.brand.mint;
    }

    function nodeOpacity(n: GraphNode) {
      if (n.type === "core" || n.type === "mixed") return 1;
      if (n.type === "microtrend") return 0.25;
      // ideas/components translucent
      if (n.type === "component" || (n.type === "idea" && (n.size || 0) < 90)) return 0.10; // micro ideas ≈10%
      const s = Math.max(60, Math.min(120, n.size ?? 100));
      const scaled = 0.2 + ((s - 60) / 60) * 0.15; // 0.20 → 0.35
      return Math.min(0.35, scaled);
    }

    function fontSizeFor(n: GraphNode) {
      if (n.type === "core") return 15;
      if (n.type === "mixed") return 15;
      if (n.type === "microtrend") return 12;
      if (n.type === "component") return 10;
      return (n.size || 0) < 90 ? 9.5 : 12.5; // small ideas much smaller
    }

    function wrapLines(label: string, maxChars: number) {
      if (!label) return [""];
      if (label.includes("\n")) return label.split("\n");
      const words = label.split(/\s+/);
      const lines: string[] = [];
      let line = "";
      for (const w of words) {
        const test = (line ? line + " " : "") + w;
        if (test.length <= maxChars) line = test; else { if (line) lines.push(line); line = w; }
      }
      if (line) lines.push(line);
      return lines;
    }

    function pillDims(n: GraphNode) {
      const f = fontSizeFor(n);
      const charW = f * 0.62;
      const targetW = n.type === "mixed" ? 320 : n.type === "microtrend" ? 220 : n.type === "idea" ? ((n.size || 0) < 90 ? 180 : 250) : 240;
      const maxChars = Math.max(8, Math.floor((targetW - 24) / charW));
      const lines = wrapLines(n.label, maxChars);
      const longest = Math.max(...lines.map((l) => l.length), 1);
      const w = Math.max(68, Math.min(targetW, longest * charW + 24));
      const lineH = f * 1.18;
      const h = Math.max(24, lines.length * lineH + 8);
      return { w, h, f, lines, lineH };
    }

    function coreCircleDims(n: GraphNode) {
      const f = 14; // smaller to accommodate wraps
      const charW = f * 0.62;
      const lines = wrapLines(n.label, 22);
      const longest = Math.max(...lines.map((l) => l.length), 1);
      const textW = longest * charW + 24;
      const lineH = f * 1.2;
      const textH = lines.length * lineH + 14;
      const r = Math.max(110, Math.max(textW / 2 + 28, textH / 2 + 28));
      return { r, f, lines, lineH };
    }

    function linkPath(s: { x: number; y: number; a?: number }, t: { x: number; y: number; a?: number }) {
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
      .data(links, (d: any) => `${d.source}-${d.target}`)
      .join((enter) => enter.append("path").attr("class", "link").attr("fill", "none").attr("stroke-width", 2).attr("stroke-linecap", "round"));

    linkSel
      .attr("d", (d: any) => linkPath(positions.get(d.source)!, positions.get(d.target)!))
      .attr("stroke", (d: any) => {
        const p1 = positions.get(d.source)!; const p2 = positions.get(d.target)!;
        const lg = svg.select(`linearGradient#${(d as any).__grad}`);
        lg.attr("x1", p1.x).attr("y1", p1.y).attr("x2", p2.x).attr("y2", p2.y);
        return `url(#${(d as any).__grad})`;
      })
      .attr("opacity", 0.7);

    // NODES
    const nodeSel = gNodes
      .selectAll("g.node")
      .data(nodes, (d: any) => d.id)
      .join((enter) => {
        const gN = enter.append("g").attr("class", "node cursor-pointer");
        gN.append("rect").attr("rx", 14).attr("ry", 14).attr("stroke-width", 1.1);
        gN.append("circle").attr("class", "core-circle").attr("r", 0);
        gN.append("text").attr("class", "label select-none").attr("text-anchor", "middle");
        return gN;
      })
      .on("click", (_evt: any, d: any) => {
        setSelectedId((prev) => (prev === d.id ? null : d.id));
        const t = transformRef.current.k; const p = positions.get(d.id)!; const z = Math.max(1.1, t);
        const newT = d3.zoomIdentity.translate(dims.w / 2 - z * p.x, dims.h / 2 - z * p.y).scale(z);
        d3.select(svgRef.current).transition().duration(600).call(zoomRef.current!.transform as any, newT);
      });

    nodeSel.each(function (d: GraphNode) {
      const gN = d3.select(this); const p = positions.get(d.id)!;

      if (d.type === "core") {
        const { r, f, lines, lineH } = coreCircleDims(d);
        gN.select("rect").attr("display", "none");
        gN.select("circle.core-circle").attr("display", "block").attr("r", r).attr("fill", COLORS.brand.deep).attr("stroke", d3.color(COLORS.brand.deep)!.darker(0.6).toString());
        const txt = gN.select("text"); txt.selectAll("tspan").remove();
        txt.attr("font-family", "'Montserrat', ui-sans-serif").attr("font-weight", 700).attr("font-size", f).attr("fill", "#ffffff");
        lines.forEach((ln, i) => txt.append("tspan").attr("x", 0).attr("dy", i === 0 ? -((lines.length - 1) * lineH) / 2 : lineH).text(ln));
        gN.attr("transform", `translate(${p.x},${p.y})`);
        return;
      }

      const { w, h, f, lines, lineH } = pillDims(d);
      const fill = colorOn ? baseColor(d) : COLORS.gray.nodeFill;
      const stroke = colorOn ? d3.color(fill)?.darker(0.7)?.toString() || "#2c2c2c" : COLORS.gray.nodeStroke;
      const op = nodeOpacity(d);

      gN.select("circle.core-circle").attr("display", "none");
      gN.select("rect").attr("display", "block").attr("x", -w / 2).attr("y", -h / 2).attr("width", w).attr("height", h).attr("fill", fill).attr("stroke", stroke).attr("opacity", op);

      const txt = gN.select("text"); txt.selectAll("tspan").remove();
      txt.attr("font-family", d.type === "mixed" ? "'Roboto Mono', ui-monospace" : "'Montserrat', ui-sans-serif").attr("font-weight", d.type === "mixed" ? 700 : 600).attr("font-size", f).attr("fill", colorOn ? "#00302a" : COLORS.gray.text);
      lines.forEach((ln, i) => txt.append("tspan").attr("x", 0).attr("dy", i === 0 ? -((lines.length - 1) * lineH) / 2 : lineH).text(ln));

      gN.attr("transform", `translate(${p.x},${p.y})`);
    });

    if (!zoomRef.current) {
      zoomRef.current = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.6, 2.8]).on("zoom", (event) => {
        transformRef.current = event.transform; g.attr("transform", transformRef.current.toString());
      });
      d3.select(svgRef.current).call(zoomRef.current as any);
    }
  }, [positions, visibleNodeIds, visibleEdges, colorOn, dims]);

  /** ====== RESIZE ====== */
  useEffect(() => {
    const ro = new ResizeObserver((entries) => { for (const e of entries) { const cr = e.contentRect; setDims({ w: cr.width, h: cr.height }); } });
    if (containerRef.current) ro.observe(containerRef.current); return () => ro.disconnect();
  }, []);

  /** ====== SEARCH ====== */
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault(); const q = search.trim().toLowerCase(); if (!q) return;
    const target = allNodes.find((n) => n.label.toLowerCase().includes(q)); if (!target) return;
    setSelectedId(target.id); const t = transformRef.current.k; const p = (positions as Map<string, { x: number; y: number }>).get(target.id)!; const z = Math.max(1.1, t);
    const newT = d3.zoomIdentity.translate(dims.w / 2 - z * p.x, dims.h / 2 - z * p.y).scale(z);
    d3.select(svgRef.current).transition().duration(650).call(zoomRef.current!.transform as any, newT);
  }

  /** ====== UI HELPERS ====== */
  function trendChip(t: TrendKey) {
    const label = t === "SSC" ? "Self‑Sustaining Communities" : t === "RA" ? "Regenerative Agriculture" : "Resource Looping";
    const color = COLORS.trends[t];
    return (
      <button key={t} onClick={() => setActiveTrends((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))} className={`rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2 border transition-colors ${activeTrends.includes(t) ? "text-slate-900" : "opacity-40 hover:opacity-60"}`} style={{ background: color, borderColor: d3.color(color)?.darker(0.6)?.toString() }} title={label}>
        {label}
      </button>
    );
  }

  const selected = selectedId ? allNodes.find((n) => n.id === selectedId) : null;

  return (
    <div ref={containerRef} className="relative w-full h-[88vh] bg-white">
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Roboto+Mono:wght@500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="pointer-events-auto">
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'Montserrat', ui-sans-serif", color: COLORS.brand.deep }}>
                Dream — Opportunities in Regenerative Economies
              </h1>
              <p className="text-sm text-slate-500 mt-1" style={{ fontFamily: "'Roboto Mono', ui-monospace" }}>
                Structured radial map • Zoom, filter, and click nodes for details.
              </p>
            </div>
            <div className="pointer-events-auto flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={colorOn} onChange={(e) => setColorOn(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                <span>Color coding</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showOriginal} onChange={(e) => setShowOriginal(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                <span>Original (A2)</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showIdeas} onChange={(e) => setShowIdeas(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                <span>Additional ideas</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showMicro} onChange={(e) => setShowMicro(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                <span>Microtrends</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Dock */}
      <div className="absolute left-4 top-24 z-20 w-[320px] pointer-events-auto">
        <div className="rounded-2xl shadow-lg border border-slate-200 bg-white/95 backdrop-blur p-4">
          <div className="mb-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2" style={{ fontFamily: "'Roboto Mono', ui-monospace" }}>Filters</div>
            <div className="flex flex-wrap">{(["SSC", "RA", "RL"] as TrendKey[]).map((t) => trendChip(t))}</div>
          </div>
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="flex items-center gap-2">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ideas, microtrends…" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" style={{ fontFamily: "'Montserrat', ui-sans-serif" }} list="node-suggestions" />
              <button type="submit" className="rounded-xl px-3 py-2 text-sm font-semibold text-white" style={{ background: COLORS.brand.primary }}>Go</button>
            </div>
            <datalist id="node-suggestions">{allNodes.map((n) => (<option key={n.id} value={n.label.replace(/\n/g, ' ')} />))}</datalist>
          </form>
          <div className="text-[11px] text-slate-500 leading-relaxed">
            <p><span className="font-semibold">Tip:</span> Wavy links show influence and connection. Toggle color off for grayscale; selecting a node refocuses the view.</p>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg ref={svgRef} className="absolute inset-0 w-full h-full" role="graphics-document">
        <g ref={gRef} />
      </svg>

      {/* Right Sidebar */}
      <div className={`absolute top-20 right-4 z-30 w-[360px] transition-all duration-300 pointer-events-auto ${selected ? "translate-x-0 opacity-100" : "translate-x-[380px] opacity-0 pointer-events-none"}`}>
        <div className="rounded-2xl shadow-xl border border-slate-200 bg-white/95 backdrop-blur p-5">
          {selected ? (
            <div>
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-bold" style={{ fontFamily: "'Montserrat', ui-sans-serif", color: COLORS.brand.deep }}>{selected.label.split('\n').join(' ')}</h2>
                <button onClick={() => setSelectedId(null)} title="Close" className="text-slate-500 hover:text-slate-700">✕</button>
              </div>
              {(selected.trends || selected.trend) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(selected.trends || (selected.trend ? [selected.trend] : []))!.map((t) => (
                    <span key={t} className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium border" style={{ background: COLORS.trends[t as TrendKey], borderColor: d3.color(COLORS.trends[t as TrendKey])?.darker(0.6)?.toString() }}>
                      {t === "SSC" ? "Self‑Sustaining Communities" : t === "RA" ? "Regenerative Agriculture" : "Resource Looping"}
                    </span>
                  ))}
                </div>
              )}
              {selected.tags && selected.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">{selected.tags.map((tag) => (<span key={tag} className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium border border-slate-200">{tag}</span>))}</div>
              )}
              {selected.microtrend && (
                <div className="mt-2"><span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium border" style={{ background: COLORS.micro[selected.microtrend as keyof typeof COLORS.micro] ?? COLORS.brand.mint, borderColor: d3.color(COLORS.micro[selected.microtrend as keyof typeof COLORS.micro] ?? COLORS.brand.mint)?.darker(0.6)?.toString() }}>Microtrend: {selected.microtrend}</span></div>
              )}
              <p className="mt-3 text-sm text-slate-700 leading-relaxed" style={{ fontFamily: "'Montserrat', ui-sans-serif" }}>{selected.desc || "Explore connections and related microtrends by following the curved links in the map."}</p>
              {selected.id === "des" && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700" style={{ fontFamily: "'Roboto Mono', ui-monospace" }}>DES Components</div>
                  <ul className="mt-1 text-sm list-disc pl-5 text-emerald-900">
                    <li>Critical‑load batteries sized for essential services + market revenue</li>
                    <li>Smart Energy Centres as local control rooms for thermal + electrical</li>
                    <li>EV mobility service integrated with V2X</li>
                    <li>Waste‑heat capture tied to district loops</li>
                    <li>Digital dashboard with portfolio‑level DERMS + resident app</li>
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer watermark */}
      <div className="absolute bottom-3 right-4 text-[11px] text-slate-400" style={{ fontFamily: "'Roboto Mono', ui-monospace" }}>
        © Dream — Conceptual & Foresight Methods • Interactive map v4
      </div>
    </div>
  );
}
