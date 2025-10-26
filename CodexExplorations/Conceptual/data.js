window.NODES = [
  // Center (solid circle)
  { id:"core", label:"Dream — Opportunities\nin Regenerative\nEconomies", type:"core", size:200, tags:["Center","Vision"],
    desc:"Center of the map. A strategy lens connecting Dream’s developments to regenerative, circular, and self-sustaining opportunity spaces."
  },

  // Mixed trends (solid)
  { id:"ssc", label:"Self-Sustaining / Regenerative\nCommunities", type:"mixed", trend:"SSC", size:120, tags:["Mixed Trend"],
    desc:"Decentralized, resilient, data-driven civic infrastructure: microgrids, VPPs, DERMS, district energy, V2G, resilience hubs, smart-city fabric." },
  { id:"ra",  label:"Regenerative Agriculture /\nResource-Positive Food Systems", type:"mixed", trend:"RA", size:120, tags:["Mixed Trend"],
    desc:"Precision ag, soil health, MRV, carbon farming, biofertilizers, synbio for ag, ag-data platforms, urban & peri-urban food webs." },
  { id:"rl",  label:"Resource Looping /\nCircular Systems", type:"mixed", trend:"RL", size:120, tags:["Mixed Trend"],
    desc:"Circular economy, reverse logistics, waste-heat upcycling, chemical/enzymatic recycling, circular materials & construction." },

  // Original A2 concept — DES + components
  { id:"des", label:"Dream Energy System\n(DES)", type:"idea", trend:"SSC", size:120, tier:1, tags:["Original","Platform"],
    desc:"Community energy platform integrating storage, mobility, heat recovery, and a digital operating layer." },
  { id:"des_storage", label:"Critical-Load\nEnergy Storage", type:"component", trend:"SSC", size:64, tags:["Original","Storage"],
    desc:"Resilience-first batteries sized for essential loads and grid services revenue." },
  { id:"des_smart_centres", label:"Smart Energy\nCentres", type:"component", trend:"SSC", size:62, tags:["Original","Operations"],
    desc:"On-site hubs integrating thermal, PV, controls, and communications — the DES brain." },
  { id:"des_ev_mobility", label:"Electric Vehicle\nMobility Service", type:"component", trend:"SSC", size:66, tags:["Original","Mobility"],
    desc:"Shared EVs + charging as a service, integrated with V2X for flexibility markets." },
  { id:"des_waste_heat", label:"Waste-Heat\nRecovery Units", type:"component", trend:"SSC", size:60, tags:["Original","Thermal"],
    desc:"Capture low-grade heat from data rooms, retail, and wastewater for district loops." },
  { id:"des_dashboard", label:"Digital Energy\nSystems Dashboard", type:"component", trend:"SSC", size:60, tags:["Original","Digital"],
    desc:"Portfolio-level command, DERMS control, carbon & comfort KPIs, and resident apps." },

  // Ideas — add tier
  { id:"district_thermal", label:"District Thermal\nMicrogrid", type:"idea", trend:"SSC", size:96, tier:1, tags:["Heat","Grid"], desc:"Ambient loops + geoexchange pods stitched into DES load management." },
  { id:"vpp_derms", label:"VPP + DERMS\nOrchestration", type:"idea", trend:"SSC", size:92, tier:1, tags:["Flexibility","Revenue"], desc:"Portfolio-level aggregation for market participation and peak shaving." },
  { id:"resilience_hubs", label:"Community\nResilience Hubs", type:"idea", trend:"SSC", size:86, tier:2, tags:["Resilience","Community"], desc:"Multi-use spaces with critical power, comms, cooling/heat, supplies, and Wi-Fi." },
  { id:"smart_home_kits", label:"Smart Home\nEnergy Kit Program", type:"idea", trend:"SSC", size:82, tier:2, tags:["Demand-side","Engagement"], desc:"Resident kits (sub-metering, TOU nudges, smart plugs) linked to the DES app." },
  { id:"ev_v2g", label:"EV V2G Fleet\nContracting", type:"idea", trend:"SSC", size:88, tier:2, tags:["Mobility","Flexibility"], desc:"Leased EV fleets provide grid services; credits returned to subscribers." },

  { id:"agrovoltaics", label:"Agrovoltaics at\nEdges of Sites", type:"idea", trend:"RA", size:92, tier:2, tags:["Food","Energy"], desc:"Dual-use PV with shade-tolerant crops on parking canopies and berms." },
  { id:"soil_mrv", label:"Soil Health\nMRV Platform", type:"idea", trend:"RA", size:98, tier:1, tags:["MRV","Data"], desc:"Open MRV for urban farms & partners; unlocks nature credits and co-benefits." },
  { id:"biofertilizer_coop", label:"Biofertilizer /\nMicrobial Inputs Co-op", type:"idea", trend:"RA", size:86, tier:2, tags:["Inputs","Co-op"], desc:"Member purchasing + trials with local growers; links to compost digestate." },

  { id:"synbio_food", label:"SynBio Upcycled\nIngredients Lab", type:"idea", trends:["RA","RL"], microtrend:"Synthetic Biology", size:92, tier:1, tags:["Pilot","R&D"], desc:"Fermentation + precision enzymes to valorize local side streams into food." },
  { id:"food_waste_biogas", label:"Food-Waste →\nBiogas + Heat", type:"idea", trends:["RL","SSC"], size:96, tier:1, tags:["Waste","Heat"], desc:"Anaerobic digestion tied to district thermal; credits looped to residents." },
  { id:"reverse_logistics", label:"Reverse Logistics\n& Materials Recovery", type:"idea", trend:"RL", size:94, tier:1, tags:["Logistics","Jobs"], desc:"Parcel lockers + returns → sorting micro-hub; feed local reuse markets." },
  { id:"circular_construction", label:"Circular Construction\nMaterials Exchange", type:"idea", trends:["RL","SSC"], size:90, tier:2, tags:["Construction","Marketplace"], desc:"Deconstruction marketplace for lumber, fixtures, facade elements, fill." },
  { id:"water_circularity", label:"Community Water\nCircularity Hub", type:"idea", trends:["RL","SSC"], size:86, tier:2, tags:["Water","Resilience"], desc:"Greywater capture, rain gardens, storm retention + IoT leak analytics." },
  { id:"repair_reuse", label:"Repair & Reuse\nCommons", type:"idea", trend:"RL", size:90, tier:2, tags:["Community","Jobs"], desc:"Makerspace + tool library; appliance, bike, textile repair events." },
  { id:"plastics_recycling", label:"Enzymatic / Chemical\nPlastics Recycling", type:"idea", trend:"RL", size:86, tier:3, tags:["Pilot","R&D"], desc:"Small-footprint pilot converting PET/PLA streams into new feedstock." },
  { id:"urban_farm_network", label:"Urban Farm &\nCompost Network", type:"idea", trends:["RA","RL"], size:92, tier:2, tags:["Food","Soil"], desc:"Neighbourhood plots + compost collection; soil loops back to plantings." },

  // Microtrends
  { id:"micro_microgrids", label:"Microgrids", type:"microtrend", trend:"SSC", microtrend:"Microgrids", size:56 },
  { id:"micro_15min", label:"15-Minute Cities", type:"microtrend", trend:"SSC", microtrend:"15-Minute Cities", size:56 },
  { id:"micro_vpps", label:"VPPs", type:"microtrend", trend:"SSC", microtrend:"VPPs", size:52 },
  { id:"micro_derms", label:"DERMS", type:"microtrend", trend:"SSC", microtrend:"DERMS", size:52 },
  { id:"micro_district", label:"District Energy", type:"microtrend", trend:"SSC", microtrend:"District Energy", size:52 },
  { id:"micro_resilience", label:"Resilience Hubs", type:"microtrend", trend:"SSC", microtrend:"Resilience Hubs", size:52 },
  { id:"micro_v2g", label:"EV V2G", type:"microtrend", trend:"SSC", microtrend:"EV V2G", size:50 },
  { id:"micro_smartcity", label:"Smart-City Infrastructure", type:"microtrend", trend:"SSC", microtrend:"Smart-City Infrastructure", size:52 },

  { id:"micro_precision", label:"Precision Agriculture", type:"microtrend", trend:"RA", microtrend:"Precision Agriculture", size:52 },
  { id:"micro_carbon", label:"Carbon Farming", type:"microtrend", trend:"RA", microtrend:"Carbon Farming", size:52 },
  { id:"micro_soil", label:"Soil Regeneration", type:"microtrend", trend:"RA", microtrend:"Soil Regeneration", size:52 },
  { id:"micro_mrv", label:"MRV", type:"microtrend", trend:"RA", microtrend:"MRV", size:48 },
  { id:"micro_biofert", label:"Biofertilizers / Microbial Inputs", type:"microtrend", trend:"RA", microtrend:"Biofertilizers / Microbial Inputs", size:52 },
  { id:"micro_synbio", label:"Synthetic Biology", type:"microtrend", trend:"RA", microtrend:"Synthetic Biology", size:56 },
  { id:"micro_agdata", label:"Ag-Data Platforms", type:"microtrend", trend:"RA", microtrend:"Ag-Data Platforms", size:48 },

  { id:"micro_circular", label:"Circular Economy", type:"microtrend", trend:"RL", microtrend:"Circular Economy", size:52 },
  { id:"micro_wasteheat", label:"Waste-Heat Recovery", type:"microtrend", trend:"RL", microtrend:"Waste-Heat Recovery", size:52 },
  { id:"micro_upcycling", label:"Food-Waste Upcycling", type:"microtrend", trend:"RL", microtrend:"Food-Waste Upcycling", size:52 },
  { id:"micro_recycling", label:"Enzymatic / Chemical Recycling", type:"microtrend", trend:"RL", microtrend:"Enzymatic / Chemical Recycling", size:52 },
  { id:"micro_biobased", label:"Bio-based Materials", type:"microtrend", trend:"RL", microtrend:"Bio-based Materials", size:52 },
  { id:"micro_reverse", label:"Reverse Logistics", type:"microtrend", trend:"RL", microtrend:"Reverse Logistics", size:52 },
];

window.EDGES = [
  { source:"core", target:"ssc" }, { source:"core", target:"ra" }, { source:"core", target:"rl" },
  { source:"ssc", target:"des" }, 
  { source:"des", target:"des_storage" }, { source:"des", target:"des_smart_centres" }, { source:"des", target:"des_ev_mobility" }, { source:"des", target:"des_waste_heat" }, { source:"des", target:"des_dashboard" },

  { source:"ssc", target:"district_thermal" }, { source:"ssc", target:"vpp_derms" }, { source:"ssc", target:"resilience_hubs" }, { source:"ssc", target:"smart_home_kits" }, { source:"ssc", target:"ev_v2g" },
  { source:"ra", target:"agrovoltaics" }, { source:"ra", target:"soil_mrv" }, { source:"ra", target:"biofertilizer_coop" },
  { source:"rl", target:"reverse_logistics" }, { source:"rl", target:"repair_reuse" }, { source:"rl", target:"plastics_recycling" },
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
