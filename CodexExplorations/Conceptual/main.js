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
        // for micro + small ideas, hide when zoomed out
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

  // ===== Layout =====
  function computePositions(){
    const W = stage.clientWidth, H = stage.clientHeight;
    const cx = W/2, cy = H/2, M = Math.min(W,H);
    const R1 = M*0.22; // mixed
    const R2 = M*0.40; // micro + DES
    const R3 = M*0.62; // big ideas
    const R4 = M*0.80; // small ideas

    const pos = new Map();
    pos.set("core",{x:cx,y:cy});

    // mixed
    ["SSC","RA","RL"].forEach(t=>{
      const a = sectorAngles(t).center;
      const p = polar(cx,cy,R1,a);
      pos.set(t.toLowerCase(), {x:p.x,y:p.y,a});
    });

    // micro by trend along R2
    const micro = NODES.filter(n=> n.type==="microtrend" && visibleNode(n));
    const byTrend = {SSC:[],RA:[],RL:[]};
    micro.forEach(m=> byTrend[m.trend].push(m));
    Object.keys(byTrend).forEach(k=>{
      const arr = byTrend[k]; const {start,end} = sectorAngles(k);
      const pad = 12*Math.PI/180;
      const angles = d3.range(arr.length).map(i=> d3.interpolateNumber(start+pad, end-pad)(arr.length===1?0.5: i/(arr.length-1)));
      arr.forEach((n,i)=> { const a=angles[i]; const p=polar(cx,cy,R2,a); pos.set(n.id,{x:p.x,y:p.y,a}); });
    });

    // DES on micro ring, SSC sector
    const aDes = sectorAngles("SSC").center + 18*Math.PI/180;
    const pDes = polar(cx,cy,R2,aDes);
    if(visibleNode({id:"des",type:"idea",trend:"SSC"})) pos.set("des",{x:pDes.x,y:pDes.y,a:aDes});

    // DES components orbit
    const comps = NODES.filter(n=> n.type==="component" && visibleNode(n));
    const pd = pos.get("des");
    if(pd){
      const r=130; comps.forEach((c,i)=>{
        const ang = (i/comps.length)*Math.PI*1.9 - Math.PI*0.95 + (pd.a||0);
        const p = { x: pd.x + r*Math.cos(ang), y: pd.y + r*Math.sin(ang) };
        pos.set(c.id, { x:p.x, y:p.y, a:ang });
      });
    }

    // ideas
    const ideas = NODES.filter(n=> n.type==="idea" && n.id!=="des" && visibleNode(n));
    const big = ideas.filter(n=> (n.size||0)>=90);
    const small = ideas.filter(n=> (n.size||0)<90);

    function placeRing(arr, trend, R){
      const subset = arr.filter(n=> (n.trend|| (n.trends && n.trends[0]))===trend || (n.trends && n.trends.length===1 && n.trends[0]===trend));
      const {start,end} = sectorAngles(trend); const pad = 18*Math.PI/180;
      // collision-aware spacing: minimum angle from pill width
      const aList = [];
      subset.forEach(()=> aList.push(0));
      const raw = d3.range(subset.length).map(i=> d3.interpolateNumber(start+pad, end-pad)(subset.length===1?0.5: i/(subset.length-1)));
      // one pass to avoid overlaps by widening angles a bit
      const minAngles = subset.map(n=>{
        const {w} = pillDims(n); return (w+18) / R; // radians needed
      });
      let cur = raw[0] || (start+end)/2;
      for(let i=0;i<subset.length;i++){
        const a = i===0? raw[0] : Math.max(raw[i], cur + minAngles[i-1]*0.55);
        aList[i] = Math.min(a, end - (minAngles[i]*0.55));
        cur = aList[i];
      }
      subset.forEach((n,i)=> { const a=aList[i]; const p=polar(cx,cy,R,a); pos.set(n.id,{x:p.x,y:p.y,a}); });
    }
    ["SSC","RA","RL"].forEach(t=> placeRing(big,t,R3));
    ["SSC","RA","RL"].forEach(t=> placeRing(small,t,R4));

    // Multi-trend ideas: average sector centers, between R3 and R4
    ideas.filter(n=> (n.trends||[]).length>1).forEach((n,idx)=>{
      const a = avgAngles((n.trends||[]).map(t=> sectorAngles(t).center));
      const r = (R3+R4)/2 + (idx%2)*14;
      const p = polar(cx,cy,r,a); pos.set(n.id,{x:p.x,y:p.y,a});
    });

    pos.__rings = {R1,R2,R3,R4,cx,cy};
    return pos;
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

    // path helper (curvy)
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
      .attr("d", d=> linkPath(positions.get(d.source), positions.get(d.target)))
      .attr("stroke", d=>{
        const p1=positions.get(d.source), p2=positions.get(d.target);
        svg.select(`linearGradient#${d.__grad}`).attr("x1",p1.x).attr("y1",p1.y).attr("x2",p2.x).attr("y2",p2.y);
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

      // determine in-focus
      const inFocus = !selectedId || selectedId===d.id || focus.has(d.id);

      if(d.type==="core"){
        const {r,f,lines,lh} = coreDims(d);
        g.select("rect").attr("display","none");
        g.select("circle.core").attr("display","block").attr("r",r).attr("fill",COLORS.brand.deep).attr("stroke", d3.color(COLORS.brand.deep).darker(0.6));
        const txt=g.select("text"); txt.selectAll("tspan").remove();
        txt.attr("font-weight",700).attr("font-size",f).attr("fill","#fff");
        lines.forEach((ln,i)=> txt.append("tspan").attr("x",0).attr("dy", i===0? -((lines.length-1)*lh)/2 : lh).text(ln));
        g.attr("transform",`translate(${P.x},${P.y})`).attr("filter", selectedId==="core" ? "url(#selShadow)" : null);
        return;
      }

      const {w,h,f,lines,lh} = pillDims(d);
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

    // initial label density update based on current zoom transform
    svg.transition().duration(0).call(zoom.transform, d3.zoomIdentity); // ensure k is defined
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
    // trend chips
    const trends = node.trends || (node.trend ? [node.trend] : []);
    trends.forEach(t=>{
      const span = document.createElement("span");
      span.className="tag";
      span.style.background = COLORS.trends[t];
      span.style.borderColor = d3.color(COLORS.trends[t]).darker(0.6);
      span.textContent = t==="SSC"?"Self-Sustaining Communities":t==="RA"?"Regenerative Agriculture":"Resource Looping";
      sbChips.appendChild(span);
    });
    // tags
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
    // zoom to node and select
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
