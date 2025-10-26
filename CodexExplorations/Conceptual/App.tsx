import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { EDGES, NODES, GraphEdge, GraphNode, TrendKey } from "./data";

const COLORS = {
  brand: { primary:"#5cce93", deep:"#014621", mint:"#b9f6d8" },
  trends: {
    SSC:"#84e4db",
    RA:"#b9f6d8",
    RL:d3.interpolateRgb("#8fb3f0","#2871dc")(0.25)
  } as Record<TrendKey,string>,
  micro: {
    "Microgrids":"#68d0f0","15-Minute Cities":"#a1eecb","VPPs":"#6ec8f5","DERMS":"#6edcd2",
    "District Energy":"#74dcd2","Resilience Hubs":"#88dfd0","EV V2G":"#5fc4e0","Smart-City Infrastructure":"#9fd4d8",
    "Precision Agriculture":"#bdf4c8","Carbon Farming":"#c8f5d8","Soil Regeneration":"#baf3d1","MRV":"#c4f2df",
    "Biofertilizers / Microbial Inputs":"#caf5e5","Synthetic Biology":"#b18ae8","Ag-Data Platforms":"#c8f7e6",
    "Circular Economy":"#a9c5f5","Waste-Heat Recovery":"#9bbdf3","Food-Waste Upcycling":"#a7c8f0",
    "Enzymatic / Chemical Recycling":"#a2b7f2","Bio-based Materials":"#b7cbf3","Reverse Logistics":"#9dc0ee",
  } as Record<string,string>,
  gray: { nodeFill:"#eef1f4", nodeStroke:"#9ca3af", edge:"#d1d5db", text:"#6b7280" }
};

export default function App(){
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const transformRef = useRef(d3.zoomIdentity);

  // UI state
  const [activeTrends, setActiveTrends] = useState<TrendKey[]>(["SSC","RA","RL"]);
  const [showOriginal, setShowOriginal] = useState(true);
  const [showIdeas, setShowIdeas] = useState(true);
  const [showMicro, setShowMicro] = useState(true);
  const [colorOn, setColorOn] = useState(true);
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [search, setSearch] = useState("");

  const nodesById = useMemo(()=> new Map(NODES.map(n=>[n.id,n])), []);

  // filter
  const visibleNodes = useMemo(()=> {
    const set = new Set<GraphNode>();
    for(const n of NODES){
      const inTrend = n.trend ? activeTrends.includes(n.trend) : n.trends ? n.trends.some(t=>activeTrends.includes(t)) : true;
      if(!inTrend) continue;
      const isOriginal = n.tags?.includes("Original");
      const isMicro = n.type==="microtrend";
      const isIdeaLike = n.type==="idea" || n.type==="component";
      if(isOriginal && !showOriginal) continue;
      if(isMicro && !showMicro) continue;
      if(isIdeaLike && !showIdeas && !isOriginal) continue;
      set.add(n);
    }
    return set;
  }, [activeTrends, showOriginal, showIdeas, showMicro]);

  const visibleEdges = useMemo(
    ()=> EDGES.filter(e=> visibleNodes.has(nodesById.get(e.source)!) && visibleNodes.has(nodesById.get(e.target)!)),
    [visibleNodes]
  );

  // layout
  function sectorAngles(t:TrendKey){
    const centers:Record<TrendKey,number> = { SSC:-Math.PI/2, RA:Math.PI/6, RL:(5*Math.PI)/6 };
    const center = centers[t], half = (Math.PI*2)/6;
    return { center, start:center-half, end:center+half };
  }
  function polar(cx:number,cy:number,r:number,a:number){ return { x: cx+r*Math.cos(a), y: cy+r*Math.sin(a) }; }
  function averageAngles(angles:number[]){ const sx=d3.mean(angles.map(Math.cos))||0, sy=d3.mean(angles.map(Math.sin))||0; return Math.atan2(sy,sx); }

  const positions = useMemo(()=> {
    const el = svgRef.current?.getBoundingClientRect();
    const W = el?.width ?? 1200, H = el?.height ?? 720, cx=W/2, cy=H/2, M=Math.min(W,H);

    const Rmixed = M*0.22;
    const Rmicro = M*0.40;
    const Rbig   = M*0.62;
    const Rsmall = M*0.80;

    const pos = new Map<string, {x:number;y:number;a?:number}>();
    pos.set("core", { x: cx, y: cy });

    (["SSC","RA","RL"] as TrendKey[]).forEach(t=>{
      const p = polar(cx,cy,Rmixed, sectorAngles(t).center);
      pos.set(t.toLowerCase(), { x:p.x, y:p.y, a: sectorAngles(t).center });
    });

    const micro = NODES.filter(n=> n.type==="microtrend");
    const byTrend:Record<TrendKey,GraphNode[]> = { SSC:[], RA:[], RL:[] } as any;
    micro.forEach(m => byTrend[m.trend as TrendKey].push(m));
    (Object.keys(byTrend) as TrendKey[]).forEach(t=>{
      const arr = byTrend[t];
      const {start,end} = sectorAngles(t); const pad = (12*Math.PI)/180;
      const A = d3.range(arr.length).map(i=> d3.interpolateNumber(start+pad, end-pad)(arr.length===1? 0.5 : i/(arr.length-1)));
      arr.forEach((n,i)=> { const a=A[i]; const p = polar(cx,cy,Rmicro,a); pos.set(n.id, { x:p.x, y:p.y, a }); });
    });

    // DES on micro ring within SSC
    const des = nodesById.get("des");
    if(des){ const a = sectorAngles("SSC").center + (18*Math.PI)/180; const p = polar(cx,cy,Rmicro,a); pos.set("des",{x:p.x,y:p.y,a}); }

    // DES components orbit
    const comps = NODES.filter(n=> n.type==="component");
    const pd = pos.get("des"); if(pd){
      const r=130; comps.forEach((c,i)=>{ const ang = (i/comps.length)*Math.PI*1.9 - Math.PI*0.95 + (pd.a||0);
        const p = { x: pd.x + r*Math.cos(ang), y: pd.y + r*Math.sin(ang) };
        pos.set(c.id, { x:p.x, y:p.y, a:ang });
      });
    }

    // Ideas by size
    const ideas = NODES.filter(n=> n.type==="idea");
    const big = ideas.filter(n=> (n.size??0) >= 90);
    const small = ideas.filter(n=> (n.size??0) < 90);

    function placeRing(arr:GraphNode[], trend:TrendKey, R:number){
      const subset = arr.filter(n => (n.trend || n.trends?.[0]) === trend);
      const {start,end} = sectorAngles(trend); const pad=(18*Math.PI)/180;
      const A = d3.range(subset.length).map(i=> d3.interpolateNumber(start+pad, end-pad)(subset.length===1?0.5: i/(subset.length-1)));
      subset.forEach((n,i)=> { const a=A[i]; const p = polar(cx,cy,R,a); pos.set(n.id,{x:p.x,y:p.y,a}); });
    }
    (["SSC","RA","RL"] as TrendKey[]).forEach(t=> placeRing(big,t,Rbig));
    (["SSC","RA","RL"] as TrendKey[]).forEach(t=> placeRing(small,t,Rsmall));

    // multi-trend ideas averaged between big/small
    ideas.filter(n=> (n.trends||[]).length>1).forEach((n,idx)=>{
      const a = averageAngles((n.trends||[]).map(t=> sectorAngles(t as TrendKey).center));
      const r = (Rbig + Rsmall)/2 + (idx%2)*14;
      const p = polar(cx,cy,r,a);
      pos.set(n.id, { x:p.x, y:p.y, a });
    });

    return pos;
  }, [nodesById]);

  // drawing
  useEffect(()=> {
    const svg = d3.select(svgRef.current!);
    const g = d3.select(gRef.current!);
    svg.selectAll("defs").remove();
    const defs = svg.append("defs");

    // glow for selection
    const sel = defs.append("filter").attr("id","selShadow").attr("x","-50%").attr("y","-50%").attr("width","200%").attr("height","200%");
    sel.append("feDropShadow").attr("dx",0).attr("dy",2).attr("stdDeviation",4).attr("flood-color",COLORS.brand.primary).attr("flood-opacity",0.55);

    const nodes = NODES.filter(n=> visibleNodes.has(n));
    const links = visibleEdges.map((e,i)=> ({...e, __id:i}));

    // neighbor set for focus greying
    const neighbors = new Map<string,Set<string>>();
    NODES.forEach(n=> neighbors.set(n.id,new Set()));
    EDGES.forEach(e=> { neighbors.get(e.source)!.add(e.target); neighbors.get(e.target)!.add(e.source); });
    const focus = new Set<string>();
    if(selectedId){ focus.add(selectedId); neighbors.get(selectedId)?.forEach(id=> focus.add(id)); }

    // link gradients
    links.forEach(l=>{
      const a = nodesById.get(l.source)!; const b = nodesById.get(l.target)!;
      const id = `grad_${l.__id}`;
      const c1 = colorOn && (!selectedId || (focus.has(l.source)&&focus.has(l.target))) ? baseColor(a) : COLORS.gray.edge;
      const c2 = colorOn && (!selectedId || (focus.has(l.source)&&focus.has(l.target))) ? baseColor(b) : COLORS.gray.edge;
      const grad = defs.append("linearGradient").attr("id",id).attr("gradientUnits","userSpaceOnUse");
      grad.append("stop").attr("offset","0%").attr("stop-color",c1);
      grad.append("stop").attr("offset","100%").attr("stop-color",c2);
      (l as any).__grad = id;
    });

    // layers
    const gLinks = g.selectAll("g.edge-layer").data([0]).join("g").attr("class","edge-layer");
    const gNodes = g.selectAll("g.node-layer").data([0]).join("g").attr("class","node-layer");

    // helpers
    function baseColor(n:GraphNode){
      if(n.type==="core") return COLORS.brand.deep;
      if(n.type==="mixed") return COLORS.trends[n.trend!];
      if(n.type==="microtrend") return COLORS.micro[n.microtrend!] || COLORS.trends[n.trend!];
      const t = n.trend || n.trends?.[0]; return t ? COLORS.trends[t] : COLORS.brand.mint;
    }
    function nodeOpacity(n:GraphNode){
      if(n.type==="core"||n.type==="mixed") return 1;
      if(n.type==="microtrend") return 0.10;      // micro = ~10%
      if(n.type==="component" || (n.type==="idea" && (n.size??0)<90)) return 0.10;
      const s = Math.max(60, Math.min(120, n.size ?? 100));
      return Math.min(0.35, 0.2 + ((s-60)/60)*0.15); // cap at 35%
    }
    function fontSizeFor(n:GraphNode){
      if(n.type==="core"||n.type==="mixed") return 14;
      if(n.type==="microtrend") return 12;
      if(n.type==="component" || (n.type==="idea"&&(n.size??0)<90)) return 10.5;
      return 12.5;
    }
    function wrap(label:string, maxChars:number){
      if(label.includes("\n")) return label.split("\n");
      const words = label.split(/\s+/); const lines:string[]=[]; let line="";
      for(const w of words){ const t=(line?line+" ":"")+w; if(t.length<=maxChars) line=t; else { if(line) lines.push(line); line=w; } }
      if(line) lines.push(line); return lines;
    }
    function pillDims(n:GraphNode){
      const f=fontSizeFor(n), charW=f*0.62;
      const targetW = n.type==="mixed"? 320 : n.type==="microtrend"? 220 : n.type==="idea"? ((n.size??0)<90? 190:260) : 220;
      const maxChars = Math.max(8, Math.floor((targetW-24)/charW));
      const lines = wrap(n.label, maxChars);
      const longest = Math.max(...lines.map(l=>l.length),1);
      const w = Math.max(68, Math.min(targetW, longest*charW + 24));
      const lh = f*1.18;
      const h = Math.max(24, lines.length*lh + 8);
      return { w, h, f, lines, lh };
    }
    function coreDims(n:GraphNode){
      const f=14, charW=f*0.62;
      const lines = wrap(n.label, 22);
      const longest = Math.max(...lines.map(l=>l.length),1);
      const textW = longest*charW + 28, lh=f*1.2, textH=lines.length*lh + 14;
      const r = Math.max(110, Math.max(textW/2+28, textH/2+28));
      return { r, f, lines, lh };
    }
    function linkPath(s:{x:number;y:number}, t:{x:number;y:number}){
      const dx=t.x-s.x, dy=t.y-s.y, L=Math.hypot(dx,dy), nx=-dy/(L||1), ny=dx/(L||1), c=Math.min(80, L*0.25);
      const c1={x:s.x+dx*0.33+nx*c, y:s.y+dy*0.33+ny*c}, c2={x:s.x+dx*0.66-nx*c, y:s.y+dy*0.66-ny*c};
      return `M ${s.x},${s.y} C ${c1.x},${c1.y} ${c2.x},${c2.y} ${t.x},${t.y}`;
    }

    // DRAW LINKS (behind)
    const linkSel = gLinks.selectAll("path.link")
      .data(links, (d:any)=> `${d.source}-${d.target}`)
      .join(enter => enter.append("path").attr("class","link").attr("fill","none").attr("stroke-width",2).attr("stroke-linecap","round"));

    linkSel
      .attr("d", (d:any)=> linkPath(positions.get(d.source)!, positions.get(d.target)!))
      .attr("stroke", (d:any)=>{
        const p1=positions.get(d.source)!, p2=positions.get(d.target)!;
        const lg = svg.select(`linearGradient#${(d as any).__grad}`);
        lg.attr("x1",p1.x).attr("y1",p1.y).attr("x2",p2.x).attr("y2",p2.y);
        return `url(#${(d as any).__grad})`;
      })
      .attr("opacity", (d:any)=> !selectedId ? 0.7 : (focus.has(d.source)||focus.has(d.target)) ? 0.95 : 0.15);

    // DRAW NODES
    const nodeSel = gRef.current!
      ? d3.select(gRef.current!).selectAll<SVGGElement,GraphNode>("g.node")
          .data(nodes, (d:any)=> d.id)
          .join(enter=>{
            const gN = enter.append("g").attr("class","node").style("cursor","pointer");
            gN.append("rect").attr("rx",14).attr("ry",14).attr("stroke-width",1.1);
            gN.append("circle").attr("class","core").attr("r",0);
            gN.append("text").attr("class","node-label").attr("text-anchor","middle");
            gN.on("click", (evt:any,d:any)=>{
              setSelectedId(prev=> prev===d.id ? null : d.id);
              evt.stopPropagation();
            });
            return gN;
          })
      : d3.selectAll("g"); // noop

    d3.select(svgRef.current!).on("click", ()=> setSelectedId(null));

    nodeSel.each(function(d:GraphNode){
      const gN = d3.select(this); const P = positions.get(d.id)!;

      // focus state
      const inFocus = !selectedId || selectedId===d.id || focus.has(d.id);

      if(d.type==="core"){
        const {r,f,lines,lh} = coreDims(d);
        gN.select("rect").attr("display","none");
        gN.select("circle.core").attr("display","block").attr("r",r).attr("fill",COLORS.brand.deep).attr("stroke", d3.color(COLORS.brand.deep)!.darker(0.6)!.toString());
        const txt = gN.select("text"); txt.selectAll("tspan").remove();
        txt.attr("font-weight",700).attr("font-size",f).attr("fill","#fff");
        lines.forEach((ln,i)=> txt.append("tspan").attr("x",0).attr("dy", i===0? -((lines.length-1)*lh)/2 : lh).text(ln));
        gN.attr("transform",`translate(${P.x},${P.y})`);
        return;
      }

      const {w,h,f,lines,lh} = pillDims(d);
      const fill = inFocus && colorOn ? baseColor(d) : COLORS.gray.nodeFill;
      const stroke = inFocus && colorOn ? d3.color(fill)?.darker(0.7)?.toString() || "#2c2c2c" : COLORS.gray.nodeStroke;
      const op = inFocus ? nodeOpacity(d) : Math.min(0.18, nodeOpacity(d)*0.6);

      gN.select("circle.core").attr("display","none");
      gN.select("rect").attr("display","block")
        .attr("x",-w/2).attr("y",-h/2).attr("width",w).attr("height",h)
        .attr("fill",fill).attr("stroke",stroke).attr("opacity",op)
        .attr("filter", selectedId===d.id ? "url(#selShadow)" : null);

      const txt = gN.select("text"); txt.selectAll("tspan").remove();
      txt.attr("font-weight", d.type==="mixed" ? 700 : 600).attr("font-size",f).attr("fill", inFocus? "#00302a" : COLORS.gray.text);
      lines.forEach((ln,i)=> txt.append("tspan").attr("x",0).attr("dy", i===0? -((lines.length-1)*lh)/2 : lh).text(ln));

      gN.attr("transform",`translate(${P.x},${P.y})`);
    });

    // zoom/pan
    if(!zoomRef.current){
      zoomRef.current = d3.zoom<SVGSVGElement,unknown>().scaleExtent([0.6,3]).on("zoom",(evt)=>{
        transformRef.current = evt.transform;
        d3.select(gRef.current).attr("transform", transformRef.current.toString());
      });
      d3.select(svgRef.current).call(zoomRef.current as any);
    }
  }, [activeTrends, showOriginal, showIdeas, showMicro, colorOn, selectedId, visibleNodes, visibleEdges]);

  // filtering helpers
  function trendChip(t:TrendKey){
    const label = t==="SSC" ? "Self-Sustaining Communities" : t==="RA" ? "Regenerative Agriculture" : "Resource Looping";
    const color = COLORS.trends[t];
    const active = activeTrends.includes(t);
    return (
      <button key={t} className="chip" style={{background:color, opacity:active?1:0.4, borderColor:d3.color(color)?.darker(0.6)?.toString()}}
        onClick={()=> setActiveTrends(active ? activeTrends.filter(x=>x!==t) : [...activeTrends, t])}>
        {label}
      </button>
    );
  }

  function onSearch(e:React.FormEvent){ e.preventDefault();
    const q = search.trim().toLowerCase(); if(!q) return;
    const hit = NODES.find(n=> n.label.toLowerCase().includes(q)); if(!hit) return;
    setSelectedId(hit.id);
  }

  const selected = selectedId ? nodesById.get(selectedId) ?? null : null;

  return (
    <div style={{position:"relative", width:"100%", height:"100%"}}>
      <div className="header">
        <div className="inner" style={{pointerEvents:"none"}}>
          <div style={{pointerEvents:"auto"}}>
            <h1 style={{margin:0, fontWeight:700, color:COLORS.brand.deep}}>Dream — Opportunities in Regenerative Economies</h1>
            <div className="sub">Zoom, filter, click nodes for details. Toggle color for greyscale view.</div>
          </div>
          <div style={{pointerEvents:"auto", display:"flex", gap:10}}>
            <label><input type="checkbox" checked={colorOn} onChange={e=>setColorOn(e.target.checked)} /> Color</label>
            <label><input type="checkbox" checked={showOriginal} onChange={e=>setShowOriginal(e.target.checked)} /> Original (A2)</label>
            <label><input type="checkbox" checked={showIdeas} onChange={e=>setShowIdeas(e.target.checked)} /> Ideas</label>
            <label><input type="checkbox" checked={showMicro} onChange={e=>setShowMicro(e.target.checked)} /> Microtrends</label>
          </div>
        </div>
      </div>

      <div className="panel">
        <div style={{fontFamily:"'Roboto Mono',ui-monospace", fontSize:12, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8}}>Filters</div>
        <div style={{marginBottom:8}}>{(["SSC","RA","RL"] as TrendKey[]).map(t=> trendChip(t))}</div>
        <form onSubmit={onSearch} style={{display:"flex", gap:8}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search ideas, microtrends…" style={{flex:1, border:"1px solid #cbd5e1", borderRadius:12, padding:"8px 10px", fontSize:12}} />
          <button className="btn primary" type="submit">Go</button>
        </form>
      </div>

      <svg ref={svgRef} style={{position:"absolute", inset:0, width:"100%", height:"100%"}}>
        <g ref={gRef} />
      </svg>

      {/* Right sidebar */}
      <div style={{
        position:"absolute", right:16, top:84, width:360, zIndex:12,
        transition:"all 280ms ease",
        transform: selected ? "translateX(0)" : "translateX(380px)",
        opacity: selected ? 1 : 0,
        pointerEvents: selected ? "auto" : "none",
        background:"#fff", border:"1px solid #e5e7eb", borderRadius:16, boxShadow:"0 10px 30px rgba(0,0,0,.08)", padding:16
      }}>
        {selected && (
          <>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12}}>
              <h2 style={{margin:0, fontSize:18, fontWeight:700, color:COLORS.brand.deep}}>{selected.label.replace(/\n/g," ")}</h2>
              <button className="btn" onClick={()=>setSelectedId(null)}>✕</button>
            </div>
            {(selected.trends || selected.trend) && (
              <div style={{marginTop:8, display:"flex", flexWrap:"wrap", gap:8}}>
                {(selected.trends || (selected.trend ? [selected.trend] : []))!.map(t=>{
                  const c = COLORS.trends[t as TrendKey];
                  return <span key={t} className="chip" style={{background:c, borderColor:"#00000022"}}>{t==="SSC"?"Self-Sustaining Communities":t==="RA"?"Regenerative Agriculture":"Resource Looping"}</span>;
                })}
              </div>
            )}
            {selected.microtrend && (
              <div style={{marginTop:8}}>
                <span className="chip" style={{ background:"#f8fafc" }}>Microtrend: {selected.microtrend}</span>
              </div>
            )}
            {selected.tags && selected.tags.length>0 && (
              <div style={{marginTop:8, display:"flex", flexWrap:"wrap", gap:8}}>
                {selected.tags.map(tag=> <span key={tag} className="chip" style={{ background:"#f1f5f9" }}>{tag}</span>)}
              </div>
            )}
            <p style={{marginTop:12, fontSize:14, lineHeight:1.5}}>
              {selected.desc || "Explore connections and related microtrends by following the curved links in the map."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
