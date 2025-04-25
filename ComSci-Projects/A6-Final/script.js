/* ====================================================================
   Mitchell Pretak – Portfolio Timeline  (A6‑Final)
   Refined functionality only – NO path / name changes
   --------------------------------------------------------------------
   • Keeps the exact JSON‑fetch mechanism you used before (projects.json)
   • Adds time‑driven spacing (PIXELS_PER_DAY)
   • Progress bar Month + Year now scroll smoothly, even through months
     without projects
   • Everything stays in vanilla JS – no ES‑module / import syntax
   ====================================================================*/

/* ---------------------- 1. CONFIGURABLE CONSTANTS ------------------ */
const DATA_URL        = 'projects.json';  // <‑‑ identical to original
const PIXELS_PER_DAY  = 4;                // 14 days ≈ 56 px gap
const START_ON_LEFT   = true;             // first card on left side?

/* ---------------------- 2. GLOBAL REFERENCES ----------------------- */
const container = document.getElementById('timeline-container');
let   projects  = [];                    // filled after fetch

/* ---------------------- 3. INITIALISE ------------------------------ */
loadProjects()
  .then(buildTimeline)
  .then(buildProgressBar)
  .then(updateProgressBar)
  .catch(handleError);

window.addEventListener('scroll', updateProgressBar, { passive: true });

/* ---------------------- 4. FETCH JSON DATA ------------------------- */
async function loadProjects(){
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error('Failed to load project data');
  projects = await res.json();
  // sort chronologically (oldest → newest)
  projects.sort((a,b)=> new Date(a.date) - new Date(b.date));
}

/* ---------------------- 5. BUILD TIMELINE -------------------------- */
function buildTimeline(){
  const frag = document.createDocumentFragment();
  container.innerHTML = '';               // clear "Loading…"

  let lastDate = null;
  projects.forEach((p, idx)=>{
    // ----- A. time‑based vertical gap ------------------------------
    let marginTop = 0;
    if (lastDate){
      const daysGap = (new Date(p.date) - lastDate) / 8.64e7; // ms → days
      marginTop     = Math.round(daysGap * PIXELS_PER_DAY);
    }
    lastDate = new Date(p.date);

    // ----- B. create item (marker + card) --------------------------
    const sideClass = ((idx + (START_ON_LEFT?0:1)) % 2 === 0)
                      ? 'timeline-item-left'
                      : 'timeline-item-right';

    const item  = document.createElement('article');
    item.className = `timeline-item ${sideClass}`;
    item.style.marginTop = `${marginTop}px`;

    // marker
    const marker = document.createElement('span');
    marker.className = 'timeline-marker';
    item.appendChild(marker);

    // card
    item.appendChild(makeCard(p));
    frag.appendChild(item);
  });

  container.appendChild(frag);
}

function makeCard(p){
  const card = document.createElement('div');
  card.className = 'timeline-card';

  /* thumbnail */
  const imgWrap = document.createElement('div');
  imgWrap.className = 'card-image-container';
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.alt     = p.title;
  img.src     = `assets/images/${(p.images && p.images[0]) || 'placeholder.jpg'}`;
  imgWrap.appendChild(img);
  card.appendChild(imgWrap);

  /* content */
  const content = document.createElement('div');
  content.className = 'card-content';

  const header  = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `<span class="card-date">${formatDate(p.date)}</span>` +
                     `<span class="card-category">${(p.tags && p.tags[0]) || ''}</span>`;
  content.appendChild(header);

  const h   = document.createElement('h3');
  h.className = 'card-title';
  h.textContent = p.title;
  content.appendChild(h);

  const desc = document.createElement('p');
  desc.className = 'card-description';
  desc.textContent = p.description;
  content.appendChild(desc);

  if (p.link){
    const link = document.createElement('div');
    link.className = 'card-link';
    link.innerHTML = `<a href="${p.link}" target="_blank" rel="noreferrer">View Project ↗︎</a>`;
    content.appendChild(link);
  }

  card.appendChild(content);
  return card;
}

function formatDate(str){
  return new Date(str).toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' });
}

/* ---------------------- 6. PROGRESS BAR --------------------------- */
let progressBar, indicator, pct, txt;
let firstDate, lastDate, totalDays;

function buildProgressBar(){
  firstDate = new Date(projects[0].date);
  lastDate  = new Date(projects[projects.length-1].date);
  totalDays = (lastDate - firstDate)/8.64e7; // ms→days

  progressBar = document.createElement('footer');
  progressBar.id = 'progress-bar';

  txt = document.createElement('div');
  txt.id = 'progress-bar-text';
  progressBar.appendChild(txt);

  const vis = document.createElement('div');
  vis.className = 'progress-bar-visual';

  const track = document.createElement('div');
  track.className = 'progress-bar-track';
  indicator = document.createElement('div');
  indicator.id = 'progress-bar-indicator';
  track.appendChild(indicator);
  vis.appendChild(track);

  pct = document.createElement('span');
  pct.id = 'progress-bar-percentage';
  vis.appendChild(pct);

  progressBar.appendChild(vis);
  document.body.appendChild(progressBar);
}

function updateProgressBar(){
  if (!progressBar) return;           // guard during initial fetch
  const midViewport = window.scrollY + window.innerHeight * 0.5;
  const startY      = container.offsetTop;
  const contentH    = container.scrollHeight;
  const rel         = Math.min(Math.max((midViewport - startY)/contentH, 0), 1);

  // A. bar width + %
  indicator.style.width = (rel*100).toFixed(2) + '%';
  pct.textContent       = Math.round(rel*100) + '%';

  // B. Month Year label (continuous)
  const curDays  = totalDays * rel;
  const curDate  = new Date(firstDate.getTime() + curDays * 8.64e7);
  txt.textContent = curDate.toLocaleDateString(undefined, { month:'long', year:'numeric' });
}

/* ---------------------- 7. ERROR HANDLER -------------------------- */
function handleError(err){
  console.error(err);
  container.innerHTML = `<p class="error-message">${err.message}</p>`;
}
