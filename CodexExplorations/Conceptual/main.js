(function(){
  const svg = d3.select("#map").append("svg")
      .attr("width","100%").attr("height","100%");

  const g = svg.append("g");
  const W = window.innerWidth, H = window.innerHeight;
  const cx=W/2, cy=H/2;
  const R1=Math.min(W,H)*0.25, R2=R1*1.7;
  let colorOn=true;

  const pos=new Map();
  pos.set("core",{x:cx,y:cy});
  const trends=["SSC","RA","RL"];
  const angleMap={SSC:-Math.PI/2,RA:Math.PI/6,RL:Math.PI*5/6};
  for(const t of trends){
    const a=angleMap[t]; const p={x:cx+R1*Math.cos(a),y:cy+R1*Math.sin(a)};
    pos.set(t.toLowerCase(),p);
  }
  pos.set("des",{x:cx+R2*Math.cos(angleMap.SSC),y:cy+R2*Math.sin(angleMap.SSC)});
  pos.set("synbio_food",{x:cx+R2*Math.cos(angleMap.RA),y:cy+R2*Math.sin(angleMap.RA)});

  // links
  g.selectAll("path.link")
    .data(EDGES)
    .join("path")
    .attr("class","link")
    .attr("fill","none")
    .attr("stroke","#ccc")
    .attr("stroke-width",2)
    .attr("d",d=>{
      const s=pos.get(d.source),t=pos.get(d.target);
      const dx=t.x-s.x,dy=t.y-s.y;
      const c1={x:s.x+dx*0.3-dy*0.15,y:s.y+dy*0.3+dx*0.15};
      const c2={x:s.x+dx*0.7+dy*0.15,y:s.y+dy*0.7-dx*0.15};
      return `M${s.x},${s.y}C${c1.x},${c1.y} ${c2.x},${c2.y} ${t.x},${t.y}`;
    });

  // nodes
  const node=g.selectAll("g.node")
    .data(NODES)
    .join("g")
    .attr("class","node")
    .attr("transform",d=>{
      const p=pos.get(d.id); return `translate(${p.x},${p.y})`;
    });

  node.append("rect")
    .attr("rx",14).attr("ry",14)
    .attr("x",-80).attr("y",-20)
    .attr("width",160).attr("height",40)
    .attr("fill",d=>colorOn?baseColor(d):"#e5e7eb")
    .attr("opacity",d=>nodeOpacity(d));

  node.append("text")
    .attr("text-anchor","middle")
    .attr("dominant-baseline","middle")
    .attr("fill","#012")
    .text(d=>d.label.replace(/\n/g," "));

  window.toggleColor=function(){
    colorOn=!colorOn;
    d3.selectAll("rect")
      .transition().duration(400)
      .attr("fill",d=>colorOn?baseColor(d):"#e5e7eb");
  };
})();
