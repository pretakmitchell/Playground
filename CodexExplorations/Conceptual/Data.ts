export type NodeType = "core" | "mixed" | "microtrend" | "idea" | "component";
export type TrendKey = "SSC" | "RA" | "RL";

export type GraphNode = {
  id: string;
  label: string;
  type: NodeType;
  trend?: TrendKey;
  trends?: TrendKey[];
  microtrend?: string;
  tags?: string[];
  /** Visual scale: ~60-120. Smaller = farther out & smaller label. */
  size?: number;
  desc?: string;
};

export type GraphEdge = { source: string; target: string; relation?: string };

/** Center & mixed (solid) */
export const CORE: GraphNode = {
  id: "core",
  label: "Dream — Opportunities\nin Regenerative\nEconomies",
  type: "core",
  size: 200,
  tags: ["Center","Vision"]
};

export const MIXED: GraphNode[] = [
  { id: "ssc", label: "Self-Sustaining / Regenerative\nCommunities", type: "mixed", trend: "SSC", size: 120, tags:["Mixed Trend"] },
  { id: "ra", label: "Regenerative Agriculture /\nResource-Positive Food Systems", type: "mixed", trend: "RA", size: 120, tags:["Mixed Trend"] },
  { id: "rl", label: "Resource Looping /\nCircular Systems", type: "mixed", trend: "RL", size: 120, tags:["Mixed Trend"] },
];

/** Original idea (DES) + components */
export const DES: GraphNode = { id: "des", label: "Dream Energy System\n(DES)", type:"idea", trend:"SSC", size:120, tags:["Original","Platform"] };
export const DES_COMPONENTS: GraphNode[] = [
  { id:"des_storage", label:"Critical-Load\nEnergy Storage", type:"component", trend:"SSC", size:64, tags:["Original","Storage"] },
  { id:"des_smart_centres", label:"Smart Energy\nCentres", type:"component", trend:"SSC", size:62, tags:["Original","Operations"] },
  { id:"des_ev_mobility", label:"Electric Vehicle\nMobility Service", type:"component", trend:"SSC", size:66, tags:["Original","Mobility"] },
  { id:"des_waste_heat", label:"Waste-Heat\nRecovery Units", type:"component", trend:"SSC", size:60, tags:["Original","Thermal"] },
  { id:"des_dashboard", label:"Digital Energy\nSystems Dashboard", type:"component", trend:"SSC", size:60, tags:["Original","Digital"] },
];

/** Ideas (translucent) */
export const IDEAS: GraphNode[] = [
  { id:"district_thermal", label:"District Thermal\nMicrogrid", type:"idea", trend:"SSC", size:96 },
  { id:"vpp_derms", label:"VPP + DERMS\nOrchestration", type:"idea", trend:"SSC", size:92 },
  { id:"resilience_hubs", label:"Community\nResilience Hubs", type:"idea", trend:"SSC", size:86 },
  { id:"smart_home_kits", label:"Smart Home\nEnergy Kit Program", type:"idea", trend:"SSC", size:82 },
  { id:"ev_v2g", label:"EV V2G Fleet\nContracting", type:"idea", trend:"SSC", size:88 },

  { id:"agrovoltaics", label:"Agrovoltaics at\nEdges of Sites", type:"idea", trend:"RA", size:92 },
  { id:"soil_mrv", label:"Soil Health\nMRV Platform", type:"idea", trend:"RA", size:98 },
  { id:"biofertilizer_coop", label:"Biofertilizer /\nMicrobial Inputs Co-op", type:"idea", trend:"RA", size:86 },

  { id:"synbio_food", label:"SynBio Upcycled\nIngredients Lab", type:"idea", trends:["RA","RL"], microtrend:"Synthetic Biology", size:92 },
  { id:"food_waste_biogas", label:"Food-Waste →\nBiogas + Heat", type:"idea", trends:["RL","SSC"], size:96 },
  { id:"reverse_logistics", label:"Reverse Logistics\n& Materials Recovery", type:"idea", trend:"RL", size:94 },
  { id:"circular_construction", label:"Circular Construction\nMaterials Exchange", type:"idea", trends:["RL","SSC"], size:90 },
  { id:"water_circularity", label:"Community Water\nCircularity Hub", type:"idea", trends:["RL","SSC"], size:86 },
  { id:"repair_reuse", label:"Repair & Reuse\nCommons", type:"idea", trend:"RL", size:90 },
  { id:"plastics_recycling", label:"Enzymatic / Chemical\nPlastics Recycling", type:"idea", trend:"RL", size:86 },
  { id:"urban_farm_network", label:"Urban Farm &\nCompost Network", type:"idea", trends:["RA","RL"], size:92 },
];

/** Microtrends (≈10% opacity) */
export const MICRO: GraphNode[] = [
  // SSC
  { id:"micro_microgrids", label:"Microgrids", type:"microtrend", trend:"SSC", microtrend:"Microgrids", size:56 },
  { id:"micro_15min", label:"15-Minute Cities", type:"microtrend", trend:"SSC", microtrend:"15-Minute Cities", size:56 },
  { id:"micro_vpps", label:"VPPs", type:"microtrend", trend:"SSC", microtrend:"VPPs", size:52 },
  { id:"micro_derms", label:"DERMS", type:"microtrend", trend:"SSC", microtrend:"DERMS", size:52 },
  { id:"micro_district", label:"District Energy", type:"microtrend", trend:"SSC", microtrend:"District Energy", size:52 },
  { id:"micro_resilience", label:"Resilience Hubs", type:"microtrend", trend:"SSC", microtrend:"Resilience Hubs", size:52 },
  { id:"micro_v2g", label:"EV V2G", type:"microtrend", trend:"SSC", microtrend:"EV V2G", size:50 },
  { id:"micro_smartcity", label:"Smart-City Infrastructure", type:"microtrend", trend:"SSC", microtrend:"Smart-City Infrastructure", size:52 },
  // RA
  { id:"micro_precision", label:"Precision Agriculture", type:"microtrend", trend:"RA", microtrend:"Precision Agriculture", size:52 },
  { id:"micro_carbon", label:"Carbon Farming", type:"microtrend", trend:"RA", microtrend:"Carbon Farming", size:52 },
  { id:"micro_soil", label:"Soil Regeneration", type:"microtrend", trend:"RA", microtrend:"Soil Regeneration", size:52 },
  { id:"micro_mrv", label:"MRV", type:"microtrend", trend:"RA", microtrend:"MRV", size:48 },
  { id:"micro_biofert", label:"Biofertilizers / Microbial Inputs", type:"microtrend", trend:"RA", microtrend:"Biofertilizers / Microbial Inputs", size:52 },
  { id:"micro_synbio", label:"Synthetic Biology", type:"microtrend", trend:"RA", microtrend:"Synthetic Biology", size:56 },
  { id:"micro_agdata", label:"Ag-Data Platforms", type:"microtrend", trend:"RA", microtrend:"Ag-Data Platforms", size:48 },
  // RL
  { id:"micro_circular", label:"Circular Economy", type:"microtrend", trend:"RL", microtrend:"Circular Economy", size:52 },
  { id:"micro_wasteheat", label:"Waste-Heat Recovery", type:"microtrend", trend:"RL", microtrend:"Waste-Heat Recovery", size:52 },
  { id:"micro_upcycling", label:"Food-Waste Upcycling", type:"microtrend", trend:"RL", microtrend:"Food-Waste Upcycling", size:52 },
  { id:"micro_recycling", label:"Enzymatic / Chemical Recycling", type:"microtrend", trend:"RL", microtrend:"Enzymatic / Chemical Recycling", size:52 },
  { id:"micro_biobased", label:"Bio-based Materials", type:"microtrend", trend:"RL", microtrend:"Bio-based Materials", size:52 },
  { id:"micro_reverse", label:"Reverse Logistics", type:"microtrend", trend:"RL", microtrend:"Reverse Logistics", size:52 },
];

export const NODES: GraphNode[] = [CORE, ...MIXED, DES, ...DES_COMPONENTS, ...IDEAS, ...MICRO];

export const EDGES: GraphEdge[] = [
  { source:"core", target:"ssc" }, { source:"core", target:"ra" }, { source:"core", target:"rl" },
  { source:"ssc", target:"des" }, ...DES_COMPONENTS.map(c=>({source:"des", target:c.id})),

  { source:"ssc", target:"district_thermal" }, { source:"ssc", target:"vpp_derms" }, { source:"ssc", target:"resilience_hubs" }, { source:"ssc", target:"smart_home_kits" }, { source:"ssc", target:"ev_v2g" },

  { source:"ra", target:"agrovoltaics" }, { source:"ra", target:"soil_mrv" }, { source:"ra", target:"biofertilizer_coop" },

  { source:"rl", target:"reverse_logistics" }, { source:"rl", target:"repair_reuse" }, { source:"rl", target:"plastics_recycling" },

  // bridges
  { source:"rl", target:"food_waste_biogas" }, { source:"ssc", target:"food_waste_biogas" },
  { source:"rl", target:"circular_construction" }, { source:"ssc", target:"circular_construction" },
  { source:"ssc", target:"water_circularity" }, { source:"rl", target:"water_circularity" },
  { source:"ra", target:"urban_farm_network" }, { source:"rl", target:"urban_farm_network" },
  { source:"ra", target:"synbio_food" }, { source:"rl", target:"synbio_food" },

  // micro spokes
  { source:"ssc", target:"micro_microgrids" }, { source:"ssc", target:"micro_15min" }, { source:"ssc", target:"micro_vpps" }, { source:"ssc", target:"micro_derms" },
  { source:"ssc", target:"micro_district" }, { source:"ssc", target:"micro_resilience" }, { source:"ssc", target:"micro_v2g" }, { source:"ssc", target:"micro_smartcity" },

  { source:"ra", target:"micro_precision" }, { source:"ra", target:"micro_carbon" }, { source:"ra", target:"micro_soil" }, { source:"ra", target:"micro_mrv" }, { source:"ra", target:"micro_biofert" }, { source:"ra", target:"micro_synbio" }, { source:"ra", target:"micro_agdata" },

  { source:"rl", target:"micro_circular" }, { source:"rl", target:"micro_wasteheat" }, { source:"rl", target:"micro_upcycling" }, { source:"rl", target:"micro_recycling" }, { source:"rl", target:"micro_biobased" }, { source:"rl", target:"micro_reverse" },

  // affinities
  { source:"district_thermal", target:"micro_district" },
  { source:"des_waste_heat", target:"micro_wasteheat" },
  { source:"reverse_logistics", target:"micro_reverse" },
  { source:"plastics_recycling", target:"micro_recycling" },
  { source:"food_waste_biogas", target:"micro_upcycling" },
  { source:"soil_mrv", target:"micro_mrv" },
  { source:"biofertilizer_coop", target:"micro_biofert" },
  { source:"synbio_food", target:"micro_synbio" },
  { source:"ev_v2g", target:"micro_v2g" },
  { source:"vpp_derms", target:"micro_vpps" },
  { source:"des_dashboard", target:"micro_smartcity" },
  { source:"agrovoltaics", target:"micro_precision" },
];
