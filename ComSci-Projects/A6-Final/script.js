/* =====================================================================
   Mitchell Pretak – Portfolio Timeline  (A6‑Final)
   script.js  ·  v3  (fix: use original data endpoint)
   ---------------------------------------------------------------------
   • Tries the SAME endpoint you were using before:  /api/a6-timeline-projects
   • If that fails, falls back to  package.json  (old class demo)  → and
     finally to local  projects.json  so dev still works offline.
   • Nothing else changed – spacing + smooth progress‑bar remain.
   =====================================================================*/

/* ------------------- 1.  DATA ENDPOINTS IN PREFERRED ORDER --------- */
const DATA_URLS = [
  '/api/a6-timeline-projects',   // ← your original Vercel / Netlify / GH‑API route
  'package.json',                // class demo JSON you mentioned
  'projects.json'                // local dev fallback
];

const PIXELS_PER_DAY = 4;
const START_ON_LEFT  = true;

/* ------------------- 2.  GLOBAL HANDLES ---------------------------- */
const container = document.getElementById('timeline-container');
let   projects  = [];

init();
window.addEventListener('scroll', updateProgressBar, { passive:true });

async function init(){
  try {
    await loadProjects();
    buildTimeline();
    buildProgressBar();
    updateProgressBar();
  } catch(err){ handleError(err); }
}

/* -------------- 3. FETCH JSON FROM FIRST WORKING ENDPOINT --------- */
async function loadProjects(){
  let lastErr;
  for (const url of DATA_URLS){
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      projects = await res.json();
      // ensure chronological order (oldest → newest)
      projects.sort((a,b)=> new Date(a.date) - new Date(b.date));
      console.info('Loaded project data from', url);
      return; // success ➜ exit
    } catch(err){ lastErr = err; }
  }
  throw new Error('Could not load any project data ('+ lastErr +')');
}

/* ------------------- 4.  BUILD TIMELINE ---------------------------- */
function buildTimeline(){
  const frag = document.createDocumentFragment();
  container.innerHTML = '';

  let lastDate = null;
  projects.forEach((p, idx)=>{
    const gapPx = lastDate ? Math.round(((new Date(p.date) - lastDate)/8.64e7) * PIXELS_PER_DAY) : 0;
    lastDate = new Date(p.date);

    const side = ((idx + (START_ON_LEFT?0:1)) % 2 === 0) ? 'timeline-item-left' : 'timeline-item-right';
    const item = document.createElement('article');
    item.className = `timeline-item ${side}`;
    item.style.marginTop = gapPx+'px';

    const marker = document.createElement('span');
    marker.className = 'timeline-marker';
    item.appendChild(marker);

    item.appendChild(makeCard(p));
    frag.appendChild(item);
  });
  container.appendChild(frag);
}

function makeCard(p){
  const card = document.createElement('div');
  card.className = 'timeline-card';

  const wrap = document.createElement('div');
  wrap.className = 'card-image-container';
  const img = document.createElement('img');
  img.loading='lazy';
  img.alt = p.title;
  img.src = `assets/images/${(p.images && p.images[0]) || 'placeholder.jpg'}`;
  wrap.appendChild(img); card.appendChild(wrap);

  const c = document.createElement('div'); c.className='card-content';
  const hdr = document.createElement('div'); hdr.className='card-header';
  hdr.innerHTML = `<span class="card-date">${formatDate(p.date)}</span><span class="card-category">${(p.tags && p.tags[0])||''}</span>`;
  c.appendChild(hdr);
  const h3 = document.createElement('h3'); h3.className='card-title'; h3.textContent=p.title; c.appendChild(h3);
  const d = document.createElement('p'); d.className='card-description'; d.textContent=p.description; c.appendChild(d);
  if (p.link){ const l=document.createElement('div'); l.className='card-link'; l.innerHTML=`<a href="${p.link}" target="_blank" rel="noreferrer">View Project ↗︎</a>`; c.appendChild(l); }
  card.appendChild(c);
  return card;
}
function formatDate(s){return new Date(s).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}

/* ------------------- 5.  PROGRESS BAR ----------------------------- */
let progressBar, indicator, percent, label, firstDate, lastDate, totalDays;

function buildProgressBar(){
  firstDate = new Date(projects[0].date);
  lastDate  = new Date(projects.at(-1).date);
  totalDays = (lastDate-firstDate)/8.64e7;

  progressBar = document.createElement('footer'); progressBar.id='progress-bar';
  label = document.createElement('div'); label.id='progress-bar-text'; progressBar.appendChild(label);
  const vis = document.createElement('div'); vis.className='progress-bar-visual';
  const track = document.createElement('div'); track.className='progress-bar-track';
  indicator = document.createElement('div'); indicator.id='progress-bar-indicator'; track.appendChild(indicator); vis.appendChild(track);
  percent = document.createElement('span'); percent.id='progress-bar-percentage'; vis.appendChild(percent);
  progressBar.appendChild(vis);
  document.body.appendChild(progressBar);
}

function updateProgressBar(){
  if(!progressBar) return;
  const mid = window.scrollY + window.innerHeight*0.5;
  const rel = Math.min(Math.max((mid - container.offsetTop)/container.scrollHeight,0),1);
  indicator.style.width = (rel*100).toFixed(2)+'%';
  percent.textContent   = Math.round(rel*100)+'%';
  const cur = new Date(firstDate.getTime() + totalDays*rel*8.64e7);
  label.textContent = cur.toLocaleDateString(undefined,{month:'long',year:'numeric'});
}

/* ------------------- 6.  ERROR DISPLAY ---------------------------- */
function handleError(e){
  console.error(e);
  container.innerHTML = `<p class="error-message">${e.message}</p>`;
}
