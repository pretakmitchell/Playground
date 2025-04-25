/* =======================================================================
   ASSIGNMENT 2 – Citing Code   • Mitchell Pretak, Apr 2025
   -----------------------------------------------------------------------
   Combines & extends two p5.js tutorials:

   • Smoke Particle System
     https://p5js.org/examples/math-and-physics-smoke-particle-system/
   • Flocking (Boids)
     https://p5js.org/examples/classes-and-objects-flocking/

   ───────────────────────────────────────────────────────────────────────
   CREDITS
   MP • Me
   - Generatal parameter tweaks (larger boids, faster speed etc)
   - Visual design (Colours, background, buttons, popups, etc)
   - Texture design (the png used for the particle system)

   MP-GPT  • ChatGPT (o3 or 4o) • https://chat.openai.com/chat

   
  














   


/* ------------------ FIRE PARTICLE - CONNECTED TO CURSOR ------------------ */
// this section was developed by chatGPT o3.

let particleTexture;
let particleSystem;
let flamePos;                  // emitter follows mouse
let prevMouse;                 // for speed calculation

function preload() {
  particleTexture = loadImage('assets/particle_texture.png'); // the texture file; made in photoshop
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);

  flamePos  = createVector(width / 2, height / 2);
  prevMouse = flamePos.copy();
  particleSystem = new ParticleSystem(0, flamePos, particleTexture);

  flock = new Flock();
  for (let i = 0; i < 60; i++) flock.addBoid(new Boid(random(width), random(height)));

  describe('Mouse drags an orange‑to‑red smoke trail; larger boids flee the heat.');
}

function draw() {
  background('#f8f8f8');

  // update emitter & speed
  flamePos.set(mouseX, mouseY);
  const speed = p5.Vector.dist(prevMouse, flamePos);
  prevMouse.set(flamePos);

  // constant upward wind
  const wind = createVector(0, -0.05);
  particleSystem.origin = flamePos;
  particleSystem.applyForce(wind);
  particleSystem.run();

  // spawn particles
  const spawnCount = 2 + floor(speed / 8);
  for (let i = 0; i < spawnCount; i++) particleSystem.addParticle();

  // update flock 
  flock.run();
}



























/* ================ PARTICLES (Section) - all from tutorial 1 ================ */
/* Based on “Smoke Particles” by the p5.js Contributors and the Processing Foundation. 
Licensed under CC BY-NC-SA 4.0. */


/* 
TWEAKS / CHANGES MADE

- modded colour to look like fire rather than rainbow 
- modded minor perameters (smaller size, faster fade, etc)
- replaced partcile texture with a new image

- Removed this.color property — color is now calculated directly inside render()
- Renamed variables for clarity: (lifespan -> life, velocity -> vel, etc.)
- Removed mouse-controlled wind direction — replaced with a constant upward force, 
  that then trails behind cursor path. 

- Slight reformatting for better integration with new content
*/



/*  ------------------ PARTICLE SYSTEM ------------------  */
class ParticleSystem {
  constructor(count, origin, img) {
    this.particles = [];
    this.origin = origin.copy();
    this.img = img;
    for (let i = 0; i < count; i++) this.particles.push(new Particle(this.origin, this.img));
  }
  run() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.run();
      if (p.isDead()) this.particles.splice(i, 1);
    }
  }
  applyForce(f) { for (const p of this.particles) p.applyForce(f); }
  addParticle()  { this.particles.push(new Particle(this.origin, this.img)); }
}



/* ------------------ PARTICLE ------------------ */

class Particle {
  constructor(pos, img) {
    this.loc  = pos.copy();
    this.vel  = createVector(randomGaussian()*0.3, randomGaussian()*0.3 - 1.0);
    this.acc  = createVector();
    this.life = 70;                           // effects time to fade - tail length
    this.img  = img;
  }
  run()   { this.update(); this.render(); }

  // MP orange when born → red as it fades
  render() {
    imageMode(CENTER);
    const hueVal = map(this.life, 0, 60, 0, 38);   //orange (38°) → red (0°)
    const col    = color(hueVal, 255, 255);
    tint(col, this.life);
    image(this.img, this.loc.x, this.loc.y);
  }

  applyForce(f){ this.acc.add(f); }
  isDead()     { return this.life <= 0; }

  update() {
    this.vel.add(this.acc);
    this.loc.add(this.vel);
    this.life -= 3.5;                          // faster fade
    this.acc.mult(0);
  }
}
























/* ================ FLOCKING BOIDS (Section) - tutorial 2 ================ */
/* Based on “Flocking” by the p5.js Contributors and the Processing Foundation. 
Licensed under CC BY-NC-SA 4.0. */


/* 
TWEAKS / CHANGES MADE

- changed boid size from static to a larger & slightly random number
- changed colour palette (narrowed HSB range to greens & blues - contrasts with fire cursor)

- removed boid spawning on mouse drag (all boids generated once in setup)
- removed draw() and mouseDragged() functions from this section (handled externally)

- added repel() method so boids flee from the flame cursor
- integrated flocking system with external flame position variable (flamePos)

- renamed class properties for clarity (e.g., acceleration → acc, velocity → vel)
- reformatted code to match custom structure and layout of assignment
*/


let flock;

class Flock {
  constructor() { this.boids = []; }
  run() { for (const b of this.boids) b.run(this.boids); }
  addBoid(b) { this.boids.push(b); }
}

class Boid {
  constructor(x, y) {
    this.acc  = createVector(0, 0);
    this.vel  = createVector(random(-1, 1), random(-1, 1));
    this.pos  = createVector(x, y);
    this.size = (random(4.5, 6.5));                              // MP - size randomizer
    this.maxSpeed = 3;
    this.maxForce = 0.05;
    colorMode(HSB);
    this.col = color(random(100, 250), 75, 80);
  }

  run(boids){
    this.flock(boids);
    this.update();
    this.borders();
    this.render();
  }

  applyForce(f){ this.acc.add(f); }

  flock(boids){
    const sep  = this.separate(boids);
    const ali  = this.align(boids);
    const coh  = this.cohesion(boids);
    const flee = this.repel(flamePos);       

    sep .mult(1.5);
    ali .mult(1.0);
    coh .mult(1.0);
    flee.mult(2.5);

    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
    this.applyForce(flee);
  }

  /* flee logic (MP‑GPT) */
  repel(target){
    const d = p5.Vector.dist(this.pos, target);
    const safe = 70;
    if (d > safe) return createVector(0, 0);

    const desired = p5.Vector.sub(this.pos, target).setMag(this.maxSpeed);
    return p5.Vector.sub(desired, this.vel).limit(this.maxForce * 3);
  }

  /* boid helpers (tutorial) */
  update(){
    this.vel.add(this.acc).limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  seek(t){
    const desired = p5.Vector.sub(t, this.pos).setMag(this.maxSpeed);
    return p5.Vector.sub(desired, this.vel).limit(this.maxForce);
  }
  render(){
    const theta = this.vel.heading() + radians(90);
    fill(this.col); stroke(255);
    push();
      translate(this.pos.x, this.pos.y);
      rotate(theta);
      beginShape();
        vertex(0, -this.size * 2);
        vertex(-this.size, this.size * 2);
        vertex( this.size, this.size * 2);
      endShape(CLOSE);
    pop();
  }
  borders(){
    if (this.pos.x < -this.size)         this.pos.x = width  + this.size;
    if (this.pos.y < -this.size)         this.pos.y = height + this.size;
    if (this.pos.x > width  + this.size) this.pos.x = -this.size;
    if (this.pos.y > height + this.size) this.pos.y = -this.size;
  }

  /* separation / alignment / cohesion (tutorial) */
  separate(b){ const ds=25,s=createVector(); let c=0;
    for(const o of b){const d=p5.Vector.dist(this.pos,o.pos);
      if(d>0&&d<ds){s.add(p5.Vector.sub(this.pos,o.pos).normalize().div(d)); c++;}}
    if(c>0){s.div(c);} if(s.mag()>0){s.setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);} return s; }
  align(b){ const nd=50,sum=createVector(); let c=0;
    for(const o of b){const d=p5.Vector.dist(this.pos,o.pos); if(d>0&&d<nd){sum.add(o.vel); c++;}}
    if(c>0){sum.div(c).setMag(this.maxSpeed); return p5.Vector.sub(sum,this.vel).limit(this.maxForce);} return createVector(); }
  cohesion(b){ const nd=50,sum=createVector(); let c=0;
    for(const o of b){const d=p5.Vector.dist(this.pos,o.pos); if(d>0&&d<nd){sum.add(o.pos); c++;}}
    if(c>0){return this.seek(sum.div(c));} return createVector(); }
}



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
