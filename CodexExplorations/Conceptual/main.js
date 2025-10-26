(function(){
  // ===== State =====
  let activeTrends = new Set(["SSC","RA","RL"]);
  let showOriginal = true, showIdeas = true, showMicro = true;
  let colorOn = true;
  let selectedId = null;

  // DOM refs
  const svg = d3.select("#svg");
  const gRoot = d3.select("#gRoot");
  const stage = document.getElementById("stage");
  const sidebar = document.getElementById("sidebar");
  const sbTitle = document.getElementById("sbTitle");
  const sbDesc  = document.getElementById("sbDesc");
  const sbChips = document.getElementById("sbChips");
  const btnClose = document.getElementById("btnClose");

  // Controls
  const chkColor = document.getElementById("chkColor");
  const chkOriginal = document.getElementById("chkOriginal");
  const chkIdeas = document.getElementById("chkIdeas");
  const chkMicro = document.getElementById("chkMicro");
  const trendChips = document.getElementById("trendChips");
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const suggestions = document.getElementById("suggestions");

  // Size and zoom
  const dims = { w: stage.clientWidth, h: stage.clientHeight };
  svg.attr("width", "100%").attr("height", "100%");
  const zoom = d3.zoom().scaleExtent([0.6, 3]).on("zoom", (evt)=>{
    gRoot.attr("transform", evt.transform);
    updateLabelDensity(evt.transform.k);
  });
  svg.call(zoom);

  function updateLabelDensity(k){
    // Hide tiny labels when zoomed way out (only show mixed/core)
    gRoot.selectAll("text.node-label")
      .attr("display", function(d){
        if(!d) return null;
        if(d.type==="core"||d.type==="mixed") return null;
        if(k >= 0.85) return null;
        if(d.type==="microtrend") return "none";
        if(d.type==="component" || (d.type==="idea" && (d.size||0)<90)) return "none";
        return null;
      });
  }

  // Build trend chips + search suggestions
  ["SSC","RA","RL"].forEach(t=>{
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.style.background = COLORS.trends[t];
    btn.style.borderColor = d3.color(COLORS.trends[t]).darker(0.6);
    btn.textContent = t==="SSC" ? "Self-Sustaining Communities" : t==="RA" ? "Regenerative Agriculture" : "Resource Looping";
    btn.onclick = ()=> { 
      activeTrends.has(t) ? activeTrends.delete(t) : activeTrends.add(t);
      render();
    };
    trendChips.appendChild(btn);
  });
  NODES.forEach(n=>{
    const opt = document.createElement("option");
    opt.value = n.label.replace(/\n/g," ");
    suggestions.appendChild(opt);
  });

  // Events
  chkColor.onchange = ()=> { colorOn = chkColor.checked; render(); };
  chkOriginal.onchange = ()=> { showOriginal = chkOriginal.checked; render(); };
  chkIdeas.onchange = ()=> { showIdeas = chkIdeas.checked; render(); };
  chkMicro.onchange = ()=> { showMicro = chkMicro.checked; render(); };
  btnClose.onclick = ()=> selectNode(null);
  searchForm.onsubmit = (e)=>{
    e.preventDefault();
    const q = (searchInput.value||"").trim().toLowerCase();
    if(!q) return;
    const hit = NODES.find(n=> n.label.toLowerCase().includes(q));
    if(hit){ focusAndSelect(hit.id); }
  };

  // ===== Filtering =====
  function visibleNode(n){
    const inTrend = n.trend ? activeTrends.has(n.trend) :
      (n.trends ? n.trends.some(t=> activeTrends.has(t)) : true);
    if(!inTrend) return false;

    const isOriginal = (n.tags||[]).includes("Original");
    const isMicro = n.type==="microtrend";
    const isIdeaLike = (n.type==="idea"||n.type==="component");
    if(isOriginal && !showOriginal) return false;
    if(isMicro && !showMicro) return false;
    if(isIdeaLike && !showIdeas && !isOriginal) return false;
    return true;
  }

  // ===== Geometry helpers (for links that do NOT cross through nodes) =====
  function rectEdgePoint(cx, cy, w, h, tx, ty){
    // Ray from (cx,cy) to (tx,ty); intersect with axis-aligned rect half-sizes (w/2,h/2)
    const dx = tx - cx, dy = ty - cy;
    if (dx === 0 && dy === 0) return {x:cx, y:cy};
    const hw = w/2, hh = h/2;
    const absDx = Math.abs(dx), absDy = Math.abs(dy);
    const sx = absDx > 1e-6 ? hw/absDx : Infinity;
    const sy = absDy > 1e-6 ? hh/absDy : Infinity;
    const t = Math.min(sx, sy);
    return { x: cx + dx*t, y: cy + dy*t };
  }
  function circleEdgePoint(cx, cy, r, tx, ty){
    const dx=tx-cx, dy=ty-cy, L=Math.hypot(dx,dy)||1;
    return { x: cx + dx*(r/L), y: cy + dy*(r/L) };
  }

  // ===== Layout =====
  function computePositions(){
    const W = stage.clientWidth, H = stage.clientHeight;
    const cx = W/2, cy = H/2, M = Math.min(W,H);

    // Core circle radius (from text) so we can keep a healthy gap
    const coreNode = NODES.find(n=> n.id==="core");
    const cd = coreDims(coreNode);
    const coreRadius = cd.r;

    // Spread mixed trends further out; enforce min gap from core
    const R1 = Math.max(M*0.30, coreRadius + 120); // mixed (further; not touching)
    const R2 = M*0.48;                               // micro + DES
    const R3 = M*0.66;                               // big ideas
    const R4 = M*0.84;                               // small ideas (furthest)

    const pos = new Map();
    pos.set("core",{x:cx,y:cy, r:coreRadius});

    // mixed — centered in thirds
    ["SSC","RA","RL"].forEach(t=>{
      const a = sectorAngles(t).center;
      const p = polar(cx,cy,R1,a);
      pos.set(t.toLowerCase(), {x:p.x,y:p.y,a, ring:"mixed"});
    });

    // micro by trend along R2 with width-aware spacing
    const micro = NODES.filter(n=> n.type==="microtrend" && visibleNode(n));
    const byTrend = {SSC:[],RA:[],RL:[]};
    micro.forEach(m=> byTrend[m.trend].push(m));
    Object.keys(byTrend).forEach(k=>{
      placeRingWidthAware(byTrend[k], k, R2, pos);
    });

    // DES on micro ring, SSC sector
    const aDes = sectorAngles("SSC").center + 18*Math.PI/180;
    const pDes = polar(cx,cy,R2,aDes);
    if(visibleNode({id:"des",type:"idea",trend:"SSC"})) pos.set("des",{x:pDes.x,y:pDes.y,a:aDes, ring:"micro"});

    // DES components orbit, width-aware around DES
    const comps = NODES.filter(n=> n.type==="component" && visibleNode(n));
    if(pos.get("des")){
      placeLocalOrbit(comps, pos.get("des"), 130, pos);
    }

    // ideas
    const ideas = NODES.filter(n=> n.type==="idea" && n.id!=="des" && visibleNode(n));
    const big = ideas.filter(n=> (n.size||0)>=90);
    const small = ideas.filter(n=> (n.size||0)<90);
    ["SSC","RA","RL"].forEach(t=> placeRingWidthAware(big.filter(n=> (n.trends||[]).length<2), t, R3, pos));
    ["SSC","RA","RL"].forEach(t=> placeRingWidthAware(small.filter(n=> (n.trends||[]).length<2), t, R4, pos));

    // Multi-trend ideas: average sector centers, mid between R3 and R4 (stagger)
    ideas.filter(n=> (n.trends||[]).length>1).forEach((n,idx)=>{
      const a = avgAngles((n.trends||[]).map(t=> sectorAngles(t).center));
      const r = (R3+R4)/2 + (idx%2)*14;
      const p = polar(cx,cy,r,a);
      pos.set(n.id,{x:p.x,y:p.y,a, ring:"bridge"});
    });

    pos.__rings = {R1,R2,R3,R4,cx,cy};
    return pos;

    // ---- helpers:
    function placeRingWidthAware(arr, trendKey, R, outMap){
      if(!arr.length) return;
      const {start,end} = sectorAngles(trendKey);
      const pad = 18*Math.PI/180;
      // initial uniform angles
      const raw = d3.range(arr.length).map(i=> d3.interpolateNumber(start+pad, end-pad)(arr.length===1?0.5: i/(arr.length-1)));
      // min angular spacing from pill widths
      const minA = arr.map(n=> {
        const {w} = pillDims(n);
        return (w + 18) / R; // radians needed (node width + padding)
      });
      const A = [];
      let cur = raw[0];
      for(let i=0;i<arr.length;i++){
        const a = i===0 ? raw[0] : Math.max(raw[i], cur + minA[i-1]);
        A[i] = Math.min(a, end - minA[i]*0.5);
        cur = A[i];
      }
      arr.forEach((n,i)=> {
        const a = A[i];
        const p = polar(cx,cy,R,a);
        outMap.set(n.id, {x:p.x, y:p.y, a, ring:"ring"});
      });
    }

    function placeLocalOrbit(nodes, centerP, radius, outMap){
      if(!nodes.length) return;
      // sort for consistency
      const sorted = [...nodes].sort((a,b)=> (a.size||0)-(b.size||0));
      // compute per-node angular width from pill width
      const widths = sorted.map(n=> pillDims(n).w);
      const totalArcNeeded = widths.reduce((s,w)=> s + (w+16)/radius, 0);
      const arc = Math.max(Math.PI*0.9, totalArcNeeded); // ensure enough room
      const start = (centerP.a||0) - arc/2;
      let theta = start;
      sorted.forEach((n,i)=>{
        const need = (widths[i]+16)/radius;
        const a = theta + need/2;
        const p = { x: centerP.x + radius*Math.cos(a), y: centerP.y + radius*Math.sin(a) };
        outMap.set(n.id, {x:p.x,y:p.y,a, ring:"orbit"});
        theta += need;
      });
    }
  }

  // ===== Render =====
  function render(){
    const positions = computePositions();
    const nodes = NODES.filter(visibleNode);
    const nodeById = new Map(NODES.map(n=>[n.id,n]));
    const edges = EDGES.filter(e=> nodes.find(n=>n.id===e.source) && nodes.find(n=>n.id===e.target));

    // neighbors for focus
    const neighbors = new Map(nodes.map(n=> [n.id,new Set()]));
    edges.forEach(e=>{ neighbors.get(e.source)?.add(e.target); neighbors.get(e.target)?.add(e.source); });
    const focus = new Set();
    if(selectedId){ focus.add(selectedId); neighbors.get(selectedId)?.forEach(id=> focus.add(id)); }

    // defs (gradients + glow)
    svg.selectAll("defs").remove();
    const defs = svg.append("defs");
    const glow = defs.append("filter").attr("id","selShadow").attr("x","-50%").attr("y","-50%").attr("width","200%").attr("height","200%");
    glow.append("feDropShadow").attr("dx",0).attr("dy",2).attr("stdDeviation",4).attr("flood-color",COLORS.brand.primary).attr("flood-opacity",0.55);

    edges.forEach((l,i)=>{
      const a=nodeById.get(l.source), b=nodeById.get(l.target);
      const id=`grad_${i}`;
      const c1 = (!colorOn && (!selectedId || !(focus.has(l.source)))) ? COLORS.gray.edge : baseColor(a);
      const c2 = (!colorOn && (!selectedId || !(focus.has(l.target)))) ? COLORS.gray.edge : baseColor(b);
      const grad = defs.append("linearGradient").attr("id",id).attr("gradientUnits","userSpaceOnUse");
      grad.append("stop").attr("offset","0%").attr("stop-color",c1);
      grad.append("stop").attr("offset","100%").attr("stop-color",c2);
      l.__grad = id;
    });

    // layers
    const gLinks = gRoot.selectAll("g.edge-layer").data([0]).join("g").attr("class","edge-layer");
    const gNodes = gRoot.selectAll("g.node-layer").data([0]).join("g").attr("class","node-layer");

    // Node dims cache (for routing & non-overlap)
    const dims = new Map(nodes.map(n=>{
      if(n.id==="core"){
        const d = coreDims(n); return [n.id, {type:"circle", r:d.r, f:d.f, lines:d.lines, lh:d.lh}];
      }
      const p = pillDims(n);
      return [n.id, {type:"pill", w:p.w, h:p.h, f:p.f, lines:p.lines, lh:p.lh}];
    }));

    // Route links from the EDGE of nodes (not the centers) to avoid crossing through nodes
    function linkEndpoints(srcId, tgtId){
      const sP = positions.get(srcId), tP = positions.get(tgtId);
      const sD = dims.get(srcId), tD = dims.get(tgtId);
      let s = {x:sP.x, y:sP.y}, t = {x:tP.x, y:tP.y};
      if(sD.type==="circle") s = circleEdgePoint(sP.x, sP.y, sD.r, tP.x, tP.y);
      else s = rectEdgePoint(sP.x, sP.y, sD.w, sD.h, tP.x, tP.y);
      if(tD.type==="circle") t = circleEdgePoint(tP.x, tP.y, tD.r, sP.x, sP.y);
      else t = rectEdgePoint(tP.x, tP.y, tD.w, tD.h, sP.x, sP.y);
      return {s,t};
    }

    // path helper (curvy; control points orthogonal to the line)
    function linkPath(s,t){
      const dx=t.x-s.x, dy=t.y-s.y, L=Math.hypot(dx,dy);
      const nx=-dy/(L||1), ny=dx/(L||1), c=Math.min(80, L*0.25);
      const c1={x:s.x+dx*0.33+nx*c, y:s.y+dy*0.33+ny*c}, c2={x:s.x+dx*0.66-nx*c, y:s.y+dy*0.66-ny*c};
      return `M ${s.x},${s.y} C ${c1.x},${c1.y} ${c2.x},${c2.y} ${t.x},${t.y}`;
    }

    // LINKS (behind nodes)
    const linkSel = gLinks.selectAll("path.link")
      .data(edges, d=> `${d.source}-${d.target}`)
      .join(enter=> enter.append("path").attr("class","link").attr("fill","none").attr("stroke-width",2.2).attr("stroke-linecap","round"));

    linkSel
      .attr("d", d=> {
        const {s,t} = linkEndpoints(d.source, d.target);
        return linkPath(s,t);
      })
      .attr("stroke", d=>{
        const {s,t} = linkEndpoints(d.source, d.target);
        svg.select(`linearGradient#${d.__grad}`).attr("x1",s.x).attr("y1",s.y).attr("x2",t.x).attr("y2",t.y);
        return `url(#${d.__grad})`;
      })
      .attr("opacity", d=>{
        if(!selectedId) return 0.7;
        const inFocus = focus.has(d.source) && focus.has(d.target);
        return inFocus ? 0.95 : 0.15;
      });

    // NODES
    const nodeSel = gNodes.selectAll("g.node")
      .data(nodes, d=> d.id)
      .join(enter=>{
        const g = enter.append("g").attr("class","node").style("cursor","pointer");
        g.append("rect").attr("rx",14).attr("ry",14).attr("stroke-width",1.1);
        g.append("circle").attr("class","core").attr("r",0);
        g.append("text").attr("class","node-label").attr("text-anchor","middle");
        g.on("click", (evt,d)=>{ evt.stopPropagation(); focusAndSelect(d.id); });
        return g;
      });

    svg.on("click", ()=> selectNode(null));

    nodeSel.each(function(d){
      const g = d3.select(this);
      const P = positions.get(d.id);
      const D = dims.get(d.id);

      const inFocus = !selectedId || selectedId===d.id || focus.has(d.id);

      if(d.type==="core"){
        const {r,f,lines,lh} = D;
        g.select("rect").attr("display","none");
        g.select("circle.core").attr("display","block").attr("r",r).attr("fill",COLORS.brand.deep).attr("stroke", d3.color(COLORS.brand.deep).darker(0.6));
        const txt=g.select("text"); txt.selectAll("tspan").remove();
        txt.attr("font-weight",700).attr("font-size",f).attr("fill","#fff");
        lines.forEach((ln,i)=> txt.append("tspan").attr("x",0).attr("dy", i===0? -((lines.length-1)*lh)/2 : lh).text(ln));
        g.attr("transform",`translate(${P.x},${P.y})`).attr("filter", selectedId==="core" ? "url(#selShadow)" : null);
        return;
      }

      const {w,h,f,lines,lh} = D;
      // Taller nodes automatically for long labels: height already derives from lines
      // fill color logic (greyscale unless in-focus OR colorOn)
      let fill = baseColor(d), stroke = d3.color(fill).darker(0.7);
      if(!colorOn && !inFocus){ fill = COLORS.gray.nodeFill; stroke = COLORS.gray.nodeStroke; }
      const op = inFocus ? nodeOpacity(d) : Math.min(0.18, nodeOpacity(d)*0.6);

      g.select("circle.core").attr("display","none");
      g.select("rect")
        .attr("display","block")
        .attr("x",-w/2).attr("y",-h/2).attr("width",w).attr("height",h)
        .attr("fill",fill).attr("stroke",stroke).attr("opacity",op)
        .attr("filter", selectedId===d.id ? "url(#selShadow)" : null);

      const txt=g.select("text"); txt.selectAll("tspan").remove();
      txt.attr("font-weight", d.type==="mixed" ? 700 : 600).attr("font-size",f).attr("fill", inFocus? "#00302a" : COLORS.gray.text);
      lines.forEach((ln,i)=> txt.append("tspan").attr("x",0).attr("dy", i===0? -((lines.length-1)*lh)/2 : lh).text(ln));

      g.attr("transform",`translate(${P.x},${P.y})`);
    });

    // initial label density update
    svg.transition().duration(0).call(zoom.transform, d3.zoomIdentity);
    updateLabelDensity(1);
  }

  function selectNode(id){
    selectedId = id;
    if(!id){
      sidebar.classList.add("hidden");
      render();
      return;
    }
    const node = NODES.find(n=> n.id===id);
    sbTitle.textContent = node.label.replace(/\n/g," ");
    sbDesc.textContent = node.desc || "Explore connections and related microtrends by following the curved links in the map.";
    sbChips.innerHTML = "";
    const trends = node.trends || (node.trend ? [node.trend] : []);
    trends.forEach(t=>{
      const span = document.createElement("span");
      span.className="tag";
      span.style.background = COLORS.trends[t];
      span.style.borderColor = d3.color(COLORS.trends[t]).darker(0.6);
      span.textContent = t==="SSC"?"Self-Sustaining Communities":t==="RA"?"Regenerative Agriculture":"Resource Looping";
      sbChips.appendChild(span);
    });
    (node.tags||[]).forEach(tag=>{
      const span = document.createElement("span");
      span.className="tag";
      span.textContent = tag;
      sbChips.appendChild(span);
    });

    sidebar.classList.remove("hidden");
    render();
  }

  function focusAndSelect(id){
    const positions = computePositions();
    const P = positions.get(id);
    const current = d3.zoomTransform(svg.node());
    const k = Math.max(1.1, current.k);
    const translate = d3.zoomIdentity.translate(dims.w/2 - k*P.x, dims.h/2 - k*P.y).scale(k);
    svg.transition().duration(600).call(zoom.transform, translate).on("end", ()=> selectNode(id));
  }

  // Kickoff
  render();
})();
