function setup() {
    noCanvas();
    const wrap = select('#media-wrapper');
  
    // Video
    const vid = createVideo('assets/project-demo.mp4');
    vid.attribute('controls', 'controls');
    vid.addClass('media-element');
    wrap.child(vid);
  
    // Image sections
    addImageGroup(wrap, 'Sketches', [
      'assets/sketches-01.jpeg',
      'assets/sketches-02.jpeg'
    ]);
  
    addImageGroup(wrap, 'In Context', [
      'assets/incontext-01.jpeg',
      'assets/incontext-02.jpeg'
    ]);
  }
  
  function addImageGroup(container, title, imagePaths) {
    const section = createDiv().addClass('image-group');
    container.child(section);
  
    const heading = createElement('h3', title).addClass('image-subheading');
    section.child(heading);
  
    const grid = createDiv().addClass('image-grid');
    section.child(grid);
  
    imagePaths.forEach(path => {
      const img = createImg(path, title + ' image');
      img.addClass('image-grid-item');
      grid.child(img);
      enableLightbox(img);
    });
  }
  
  function enableLightbox(imgEl) {
    imgEl.mousePressed(() => {
      const overlay = createDiv().addClass('lightbox-overlay');
      overlay.parent(document.body);
  
      const fullImg = createImg(imgEl.elt.src, 'enlarged image');
      fullImg.addClass('lightbox-image');
      overlay.child(fullImg);
  
      // Trigger animation on next frame
      setTimeout(() => fullImg.addClass('active'), 10);
  
      overlay.mousePressed(() => overlay.remove());
    });
  }
  
  