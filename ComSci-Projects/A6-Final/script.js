/* File Location: Playground/ComSci-Projects/A6-Final/style.css */

/* ... (Keep all previous @font-face and :root variables) ... */

/* --- Base Styles --- */
/* ... (Keep body styles etc.) ... */

/* --- Typography --- */
/* ... (Keep h1#main-title styles etc.) ... */


/* --- Timeline Container & Axis --- */
#timeline-container {
    position: relative; /* Crucial for absolutely positioned children */
    max-width: 1050px; margin: 0 auto;
    padding: 0 25px; z-index: 6;
    min-height: 150vh; /* Give it some initial height, JS will effectively determine actual needed height */
    /* Remove height calculation from here if JS sets it */
}
#timeline-container::before { /* The central vertical axis */
    content: ''; position: absolute; top: 0; bottom: 0; /* Let it span the container height */
    left: 50%; transform: translateX(-50%); width: var(--timeline-width);
    background-color: var(--color-timeline-axis); z-index: 0;
}

/* --- Timeline Item (Absolute Positioning) --- */
.timeline-item {
    position: absolute; /* Position based on JS 'top' calculation */
    /* Top is set by JS */
    width: calc(50% - var(--card-gap) / 2);
    display: flex;
    /* Reset margin-top, position is controlled by 'top' */
    margin-top: 0 !important;
    padding-bottom: 1px;
}
.timeline-item-left {
    left: 0;
    padding-right: var(--card-gap); /* Adjust padding to clear axis */
    justify-content: flex-end;
}
.timeline-item-right {
    left: calc(50% + var(--card-gap) / 2);
    padding-left: var(--card-gap); /* Adjust padding to clear axis */
     /* Override left position for right items */
     left: 50%;
     padding-left: calc(var(--card-gap) / 2); /* Start card after the gap */
     width: calc(50% + var(--card-gap) / 2); /* Ensure width is correct */
}
/* Adjust positioning if using absolute positioning */
 .timeline-item-left {
     left: 0;
     width: calc(50% + var(--card-gap) / 2); /* Take up space to the center line */
     padding-right: var(--card-gap); /* Create space */
     justify-content: flex-end;
 }
 .timeline-item-right {
     left: 50%; /* Start at the center line */
     width: calc(50% + var(--card-gap) / 2); /* Take up space from the center line */
     padding-left: var(--card-gap); /* Create space */
 }


/* --- Timeline Marker (Dot) & Horizontal Line --- */
/* ... (Keep marker styles and ::before for horizontal line) ... */
/* Adjust marker top alignment if needed */
.timeline-marker { top: 15px; } /* May need fine-tuning */
/* Adjust horizontal line length if needed */
.timeline-marker::before { width: calc(var(--card-gap) - var(--marker-size)/2 - var(--timeline-width)/2 - 5px); /* Fine tune this */}
/* Marker absolute positioning might need slight tweaks relative to the card/item */
.timeline-item-left .timeline-marker { right: calc(var(--card-gap) - var(--horizontal-line-length) - var(--marker-size)/2 - var(--timeline-width)/2); }
.timeline-item-right .timeline-marker { left: calc(var(--card-gap) - var(--horizontal-line-length) - var(--marker-size)/2 - var(--timeline-width)/2); }



/* --- Timeline Card Styling --- */
/* ... (Keep card styles) ... */
.timeline-card {
    /* Position relative to allow absolute positioning inside if needed */
    position: relative;
    /* Ensure cards don't overlap marker/line due to absolute positioning */
    margin-left: auto; /* For left items */
    margin-right: auto; /* For right items */
    max-width: 450px; /* Control max card width */
}
.timeline-item-left .timeline-card { margin-left: 0; margin-right: auto;}
.timeline-item-right .timeline-card { margin-left: auto; margin-right: 0;}


/* --- Card Image --- */
/* ... (Keep image styles) ... */

/* --- Card Content --- */
/* ... (Keep content styles) ... */

/* --- Progress Bar --- */
/* ... (Keep progress bar styles) ... */

/* --- Responsive Adjustments --- */
@media (max-width: 800px) {
    #timeline-container::before { left: 20px; transform: translateX(0); } /* Adjust axis position */
    .timeline-item {
        position: relative !important; /* Override absolute for stacking */
        top: auto !important; left: 0 !important; /* Reset positioning */
        width: 100%;
        padding-left: calc(20px + var(--card-gap) / 1.5); /* Space from left axis */
        padding-right: 0;
        margin-top: 0 !important; /* Reset margin */
        margin-bottom: var(--min-spacing-mobile, 40px); /* Use standard margin */
    }
     .timeline-item:first-child { margin-top: 0; } /* Still no margin on first */
    .timeline-item-right, .timeline-item-left {
        left: 0; padding-left: calc(20px + var(--card-gap) / 1.5); /* Adjust padding */
    }
    .timeline-marker {
        left: calc(20px - var(--marker-size) / 2 - var(--timeline-width) / 2 + 1px) !important; /* Position on left axis */
        top: 15px;
    }
     /* Hide horizontal connector line on mobile */
     .timeline-marker::before { display: none; }

    .timeline-card { flex-direction: column; gap: 15px; max-width: none;}
    .timeline-item-right .timeline-card { flex-direction: column; }
    .card-image-container { width: 100%; height: 180px; }
}
/* ... (Keep other mobile styles) ... */
