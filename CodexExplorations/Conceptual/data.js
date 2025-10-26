window.NODES = [
  {id:"core",label:"Dream — Opportunities\nin Regenerative\nEconomies",type:"core",trend:null,size:200},
  {id:"ssc",label:"Self-Sustaining / Regenerative\nCommunities",type:"mixed",trend:"SSC"},
  {id:"ra",label:"Regenerative Agriculture",type:"mixed",trend:"RA"},
  {id:"rl",label:"Resource Looping",type:"mixed",trend:"RL"},
  {id:"des",label:"Dream Energy System (DES)",type:"idea",trend:"SSC",size:120},
  {id:"synbio_food",label:"SynBio Upcycled\nIngredients Lab",type:"idea",trend:"RA",microtrend:"Synthetic Biology"}
];

window.EDGES = [
  {source:"core",target:"ssc"},
  {source:"core",target:"ra"},
  {source:"core",target:"rl"},
  {source:"ssc",target:"des"},
  {source:"ra",target:"synbio_food"}
];
