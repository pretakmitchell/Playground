/*  DIGITAL ETCH A SKETCH
   - took a couple of iterations with gpt to fix a dial issue where it would reset to 0 every 
     time the dial was released; which reset the cursor location to the center. 

    - also had issues setting up the arrows within the dials and getting them to 
      be clickable, stay upright, and not itnerfere with the dial being clicked and dragged.


*/

    let penX, penY, path = [];
    let sizeSlider, lineWidth = 6;
    const SPEED = 2.2;
    
    /* -------- Dial class -------- */
    class Dial {
      constructor(el, axis) {
        this.el   = el;                       // rotating ring
        this.face = el.querySelector('.knob-face'); // static layer
        this.axis = axis;                     // 'x' or 'y'
        this.total = 0;                       // accumulated angle
        this.prev  = 0;
        this.updateVisual();
    
        /* drag handlers */
        this.move = e => this.drag(e);
        this.up   = () => this.stopDrag();
        el.addEventListener('pointerdown', e => this.startDrag(e));
    
        /* arrow buttons */
        el.querySelectorAll('.arrow').forEach(btn =>{
          btn.addEventListener('mousedown', ev=>{ev.stopPropagation();this.hold(btn);});
          btn.addEventListener('mouseup',   ()=>clearInterval(this.holdInt));
          btn.addEventListener('mouseleave',()=>clearInterval(this.holdInt));
        });
      }
    
      startDrag(e){
        this.el.setPointerCapture(e.pointerId);
        this.el.classList.add('dragging');
        const r=this.el.getBoundingClientRect();
        this.center={x:r.left+r.width/2, y:r.top+r.height/2};
        this.prev=this.pointerAngle(e);
        this.el.addEventListener('pointermove',this.move);
        this.el.addEventListener('pointerup',  this.up);
      }
    
      drag(e){
        const a=this.pointerAngle(e);
        let d=a-this.prev;
        d=((d+180)%360)-180;                 // shortest signed delta
        this.prev=a;
    
        /* ignore wild spikes (>45°) to stop jump glitch */
        if(Math.abs(d)>45) return;
    
        this.total+=d;
        this.updateVisual();
        movePen(this.axis,d*0.035);
      }
    
      stopDrag(){
        this.el.removeEventListener('pointermove',this.move);
        this.el.removeEventListener('pointerup',  this.up);
        this.el.classList.remove('dragging');
      }
    
      pointerAngle(e){
        return degrees(Math.atan2(e.clientY-this.center.y,
                                  e.clientX-this.center.x));
      }
    
      updateVisual(){
        const show=((this.total%360)+360)%360;
        this.el.style.transform=`rotate(${show}deg)`;
        this.face.style.transform=`rotate(${-show}deg)`;    // keep arrows upright
      }
    
      hold(btn){
        const dir = btn.classList.contains('up')   ? {axis:'y',v:-1} :
                    btn.classList.contains('down') ? {axis:'y',v: 1} :
                    btn.classList.contains('left') ? {axis:'x',v:-1} :
                                                     {axis:'x',v: 1};
        this.holdInt=setInterval(()=>movePen(dir.axis,dir.v),16);
      }
    }
    

    
    /* -------- p5 setup -------- */
    function setup(){
      createResponsiveCanvas();
      penX=width/2; penY=height/2; path.push({x:penX,y:penY});
    
      new Dial(document.getElementById('knob-left'), 'y');
      new Dial(document.getElementById('knob-right'),'x');
    
      sizeSlider=createSlider(2,20,lineWidth,1);
      sizeSlider.parent('slider-holder');
      sizeSlider.style('width','100%');
      sizeSlider.input(()=>lineWidth=sizeSlider.value());
    }
    


    /* responsive canvas */
    function windowResized(){ createResponsiveCanvas(true); }
    
    function createResponsiveCanvas(resize=false){
      const holder=document.getElementById('canvas-holder');
      const r=holder.getBoundingClientRect();
      if(resize){ resizeCanvas(r.width,r.height); clearScreen(); }
      else      { createCanvas(r.width,r.height).parent(holder); }
    }
    
    /* -------- drawing -------- */
    function draw(){
      background(220);
      if(keyIsDown(LEFT_ARROW))  movePen('x',-SPEED);
      if(keyIsDown(RIGHT_ARROW)) movePen('x', SPEED);
      if(keyIsDown(UP_ARROW))    movePen('y',-SPEED);
      if(keyIsDown(DOWN_ARROW))  movePen('y', SPEED);
    
      stroke(0); strokeWeight(lineWidth); noFill();
      beginShape(); for(const p of path) vertex(p.x,p.y); endShape();
    
      fill(0); noStroke(); circle(penX,penY,lineWidth+2);
    }
    
    /* -------- helpers -------- */
    function movePen(axis,delta){
      if(!delta) return;
      if(axis==='x') penX=constrain(penX+delta,0,width);
      else           penY=constrain(penY+delta,0,height);
      path.push({x:penX,y:penY});
    }
    
    function keyPressed(){ if(key==='s'||key==='S') shake(); }
    
    function shake(){
      const mag=14,dur=600,start=millis();
      const canvas=document.querySelector('canvas');
      const id=setInterval(()=>{
        canvas.style.transform=`translate(${random(-mag,mag)}px,0)`;
        if(millis()-start>dur){
          clearInterval(id);
          canvas.style.transform='translate(0,0)';
          clearScreen();
        }
      },30);
    }
    
    function clearScreen(){
      path=[]; penX=width/2; penY=height/2; path.push({x:penX,y:penY});
    }


    function hidePopup() {
        const popup = document.getElementById('welcome-popup');
        popup.style.display = 'none';
      }
      