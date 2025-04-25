/* -------------------------------------------------------------
   Mitchell Pretak  •  Portfolio Timeline
   -------------------------------------------------------------
   WHAT’S NEW?
   1.   pixel-per-day spacing between cards      →   space = time
   2.   scroll-driven Month + Year in progress-bar (no-project
        months are now shown too)
----------------------------------------------------------------*/

/* -------- 1. PROJECT DATA  (import, fetch or paste inline) --- */
import projects from './projects.json'  // or however you bring them in
// Each project ➜  { id, title, date, description, images, tags, link, … }

/* -------- 2. CONFIG CONSTANTS -------------------------------- */
const PIXELS_PER_DAY   = 4;                 // 14 days ≈ 56 px on canvas
const CARD_SIDE_OFFSET = 1;                 // 0 = start left, 1 = start right

/* -------- 3. BUILD THE TIMELINE ------------------------------ */
const container = document.getElementById('timeline-container');
const frag      = document.createDocumentFragment();

// sort chronologically
projects.sort((a, b) => new Date(a.date) - new Date(b.date));

let prevDate = null;
projects.forEach((proj, idx) => {

  // --- A. VERTICAL GAP based on days since previous project ----
  let marginTop = 0;
  if (prevDate) {
    const daysGap  = (new Date(proj.date) - prevDate) / 8.64e7; // ms→days
    marginTop      = Math.round(daysGap * PIXELS_PER_DAY);
  }
  prevDate = new Date(proj.date);

  // --- B. Create DOM for this card + marker -------------------
  const item   = document.createElement('article');
  item.className = `timeline-item ${((idx + CARD_SIDE_OFFSET) % 2 ? 'timeline-item-left'
                                                                      : 'timeline-item-right')}`;
  item.style.marginTop = `${marginTop}px`;

  /* marker */
  const marker = document.createElement('span');
  marker.className = 'timeline-marker';
  item.appendChild(marker);

  /* card */
  item.appendChild(buildCard(proj));

  frag.appendChild(item);
});

container.innerHTML = '';          // wipe “Loading…” message
container.appendChild(frag);

/* helper: buildCard() */
function buildCard(p){
  const card        = document.createElement('div');
  card.className    = 'timeline-card';

  // thumbnail
  const thumbWrap   = document.createElement('div');
  thumbWrap.className = 'card-image-container';
  const img         = document.createElement('img');
  img.loading = 'lazy';
  img.src    = `assets/images/${p.images?.[0] ?? 'placeholder.jpg'}`;
  img.alt    = p.title;
  thumbWrap.appendChild(img);
  card.appendChild(thumbWrap);

  // content
  const content     = document.createElement('div');
  content.className = 'card-content';

  const header      = document.createElement('div');
  header.className  = 'card-header';
  const dateSpan    = document.createElement('span');
  dateSpan.className = 'card-date';
  dateSpan.textContent = new Date(p.date).toLocaleDateString(undefined,
                             { day:'numeric', month:'short', year:'numeric' });
  const catSpan     = document.createElement('span');
  catSpan.className = 'card-category';
  catSpan.textContent = (p.tags?.[0] ?? 'project').replace(/[-_]/g,' ');
  header.append(dateSpan, catSpan);
  content.appendChild(header);

  const titleEl     = document.createElement('h3');
  titleEl.className = 'card-title';
  titleEl.textContent = p.title;
  content.appendChild(titleEl);

  const descEl      = document.createElement('p');
  descEl.className  = 'card-description';
  descEl.textContent = p.description;
  content.appendChild(descEl);

  if (p.link){
    const linkWrap  = document.createElement('div');
    linkWrap.className = 'card-link';
    linkWrap.innerHTML = `<a href="${p.link}" target="_blank" rel="noreferrer">View Project ↗︎</a>`;
    content.appendChild(linkWrap);
  }

  card.appendChild(content);
  return card;
}

/* -------- 4. PROGRESS BAR  ----------------------------------- */
buildProgressBar();                      // once
window.addEventListener('scroll', updateProgressBar, { passive:true });
updateProgressBar();                     // and initialise

function buildProgressBar(){
  const bar          = document.createElement('footer');
  bar.id             = 'progress-bar';

  const text         = document.createElement('div');
  text.id            = 'progress-bar-text';           // ⇠ Month Year goes here
  bar.appendChild(text);

  const visualWrap   = document.createElement('div');
  visualWrap.className = 'progress-bar-visual';

  const track        = document.createElement('div');
  track.className    = 'progress-bar-track';
  const indicator    = document.createElement('div');
  indicator.id       = 'progress-bar-indicator';
  track.appendChild(indicator);
  visualWrap.appendChild(track);

  const pct          = document.createElement('span');
  pct.id             = 'progress-bar-percentage';
  visualWrap.appendChild(pct);

  bar.appendChild(visualWrap);
  document.body.appendChild(bar);
}

const firstDate = new Date(projects[0].date);
const lastDate  = new Date(projects.at(-1).date);
const totalDays = (lastDate - firstDate) / 8.64e7;     // ms→days

function updateProgressBar(){
  const barText   = document.getElementById('progress-bar-text');
  const indicator = document.getElementById('progress-bar-indicator');
  const pctText   = document.getElementById('progress-bar-percentage');

  const scrolled  = window.scrollY + window.innerHeight * 0.5; // mid-viewport
  const top       = container.offsetTop;
  const height    = container.scrollHeight;
  const rel       = Math.min(Math.max((scrolled - top) / height, 0), 1); // 0→1

  /* A. percentage line */
  indicator.style.width = (rel * 100).toFixed(2) + '%';
  pctText.textContent   = Math.round(rel * 100) + '%';

  /* B. Month + Year label */
  const currentDays     = totalDays * rel;
  const currentDate     = new Date(firstDate.getTime() + currentDays * 8.64e7);
  barText.textContent   = currentDate.toLocaleDateString(undefined,
                           { month:'long', year:'numeric' });
}
