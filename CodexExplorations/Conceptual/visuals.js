window.COLORS = {
  brand: { primary:"#5cce93", deep:"#014621", mint:"#b9f6d8" },
  trends: { SSC:"#84e4db", RA:"#b9f6d8", RL:"#2871dc" },
  micro: { "Synthetic Biology":"#b18ae8" }
};

window.nodeOpacity = n => {
  if(n.type==="core"||n.type==="mixed") return 1;
  if(n.type==="microtrend") return 0.1;
  const s=n.size||90;
  return Math.min(0.35,0.2+((s-60)/60)*0.15);
};

window.baseColor = n => COLORS.trends[n.trend] || COLORS.brand.mint;
