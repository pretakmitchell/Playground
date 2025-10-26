// Color system & helpers
window.COLORS = {
  brand: { primary:"#5cce93", deep:"#014621", mint:"#b9f6d8" },
  trends: {
    SSC:"#84e4db",
    RA:"#b9f6d8",
    RL:d3.interpolateRgb("#8fb3f0","#2871dc")(0.25)
  },
  micro: {
    "Microgrids":"#68d0f0","15-Minute Cities":"#a1eecb","VPPs":"#6ec8f5","DERMS":"#6edcd2",
    "District Energy":"#74dcd2","Resilience Hubs":"#88dfd0","EV V2G":"#5fc4e0","Smart-City Infrastructure":"#9fd4d8",
    "Precision Agriculture":"#bdf4c8","Carbon Farming":"#c8f5d8","Soil Regeneration":"#baf3d1","MRV":"#c4f2df",
    "Biofertilizers / Microbial Inputs":"#caf5e5","Synthetic Biology":"#b18ae8","Ag-Data Platforms":"#c8f7e6",
    "Circular Economy":"#a9c5f5","Waste-Heat Recovery":"#9bbdf3","Food-Waste Upcycling":"#a7c8f0",
    "Enzymatic / Chemical Recycling":"#a2b7f2","Bio-based Materials":"#b7cbf3","Reverse Logistics":"#9dc0ee",
  },
  gray: { nodeFill:"#eef1f4", nodeStroke:"#9ca3af", edge:"#d1d5db", text:"#6b7280" }
};

window.baseColor = function(n){
  if(n.type==="core") return COLORS.brand.deep;
  if(n.type==="mixed") return COLORS.trends[n.trend] || COLORS.brand.mint;
  if(n.type==="microtrend"){
    return COLORS.micro[n.microtrend] || (n.trend ? COLORS.trends[n.trend] : COLORS.brand.mint);
  }
  const t = n.trend || (n.trends && n.trends[0]);
  return t ? COLORS.trends[t] : COLORS.brand.mint;
};

window.nodeOpacity = function(n){
  if(n.type==="core"||n.type==="mixed") return 1;
  if(n.type==="microtrend") return 0.10; // micro ~10%
  if(n.type==="component" || (n.type==="idea" && (n.tier||3)===3)) return 0.10; // tier 3 light
  // tier 1–2 darker (cap at 35%)
  const s = (n.tier===1? 110 : n.tier===2? 95 : 80);
  return Math.min(0.35, 0.2 + ((s-60)/60)*0.15);
};

// Unified sizes by tier for ideas; keep other types sensible
window.fontSizeFor = function(n){
  if(n.type==="core"||n.type==="mixed") return 14;
  if(n.type==="microtrend") return 12;
  if(n.type==="idea"){
    if(n.tier===1) return 13.5;
    if(n.tier===2) return 12;
    return 10.5;
  }
  if(n.type==="component") return 10.5; // treat like tier 3
  return 12;
};

window.wrapLines = function(label, maxChars){
  if(!label) return [""];
  if(label.includes("\n")) return label.split("\n");
  const words = label.split(/\s+/); const lines=[]; let line="";
  for(const w of words){
    const t=(line?line+" ":"")+w;
    if(t.length<=maxChars) line=t; else { if(line) lines.push(line); line=w; }
  }
  if(line) lines.push(line);
  return lines;
};

window.pillDims = function(n){
  const f=fontSizeFor(n), charW=f*0.62;
  const targetW = n.type==="mixed"? 320 : n.type==="microtrend"? 220 : n.type==="idea"? (n.tier===1? 280 : n.tier===2? 240 : 200) : 220;
  const maxChars = Math.max(8, Math.floor((targetW-24)/charW));
  const lines = wrapLines(n.label, maxChars);
  const longest = Math.max(...lines.map(l=>l.length),1);
  const w = Math.max(68, Math.min(targetW, longest*charW + 24));
  const lh = f*1.18;
  const h = Math.max(24, lines.length*lh + 8);
  return { w, h, f, lines, lh };
};

window.coreDims = function(n){
  const f=14, charW=f*0.62;
  const lines = wrapLines(n.label, 22);
  const longest = Math.max(...lines.map(l=>l.length),1);
  const textW = longest*charW + 28, lh=f*1.2, textH=lines.length*lh + 14;
  const r = Math.max(110, Math.max(textW/2+28, textH/2+28));
  return { r, f, lines, lh };
};

window.sectorAngles = function(t){
  const centers = { SSC:-Math.PI/2, RA:Math.PI/6, RL:(5*Math.PI)/6 };
  const center = centers[t], half = (Math.PI*2)/6;
  return { center, start:center-half, end:center+half };
};

window.polar = (cx,cy,r,a)=> ({ x: cx+r*Math.cos(a), y: cy+r*Math.sin(a) });
window.avgAngles = arr => {
  const sx=d3.mean(arr.map(Math.cos))||0, sy=d3.mean(arr.map(Math.sin))||0;
  return Math.atan2(sy,sx);
};
