// File Location: Playground/ComSci-Projects/A6-Final/script.js
// V9: Debugging empty render - ADDING AGGRESSIVE LOGGING

document.addEventListener('DOMContentLoaded', () => {
    console.log("--- V9 START --- DOM Loaded. Script starting.");

    // --- DOM Elements ---
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');
    if (!timelineContainer) { console.error("FATAL: Timeline container not found!"); return; }
    if (initialLoadingMessage) { console.log("Initial loading message found."); } else { console.warn("Loading message element not found."); }

    // --- Configuration ---
    const PX_PER_DAY = 1.8; const BASE_ITEM_OFFSET = 60; const CARD_HEIGHT_ESTIMATE = 200;
    const MIN_SPACING_PX = 60; const MAX_SPACING_PX = 450; const CARD_VERTICAL_GAP = 30;

    // --- State Variables ---
    let progressBarElement, progressBarTextElement, progressBarIndicatorElement, progressBarPercentageElement;
    let timelineItems = []; let sortedProjects = [];
    let timelineStartDate, timelineEndDate, timelineDurationDays;
    let calculatedTimelineHeight = 0; const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // --- Main Function ---
    async function fetchProjects() {
        console.log("FETCH: Starting fetch...");
        try {
            const response = await fetch('/api/a6-timeline-projects');
            console.log("FETCH: Response received:", response.status);
            if (!response.ok) { const txt = await response.text(); throw new Error(`HTTP ${response.status}: ${txt}`); }
            const projects = await response.json();
            console.log(`FETCH: ${projects?.length ?? 0} projects received.`);

            if (initialLoadingMessage) initialLoadingMessage.remove();
            timelineContainer.innerHTML = ''; // Clear for fresh render

            if (!projects || !Array.isArray(projects)) { throw new Error('Invalid project data received.'); }
            if (projects.length === 0) { displayErrorMessage('No projects found.'); return; }

            console.log("PROCESS: Starting project processing...");
            processAndSortProjects(projects);
            console.log(`PROCESS: Done. Start=${timelineStartDate?.toISOString()}, End=${timelineEndDate?.toISOString()}`);

            if (!timelineStartDate || !timelineEndDate) {
                displayErrorMessage('Could not determine timeline range (missing/invalid dates).'); return;
            }

            console.log("RENDER: Calculating initial positions...");
            calculateInitialPositions();
            console.log("RENDER: Rendering items to DOM...");
            renderTimelineItems();
            console.log(`RENDER: ${timelineItems.length} items theoretically added to DOM.`);


            requestAnimationFrame(() => {
                console.log("POST-RENDER: Starting adjustments...");
                try {
                    adjustForOverlaps();
                    updateConnectorLines(); // Re-enabled connector drawing
                    updateContainerHeight();
                    setupProgressBar();
                    addScrollListener();
                    requestAnimationFrame(updateProgressBarOnScroll);
                    console.log("POST-RENDER: Adjustments and setup complete.");
                } catch (postRenderError) {
                     console.error("POST-RENDER ERROR:", postRenderError);
                     displayErrorMessage("Error during post-render adjustments.");
                }
            });

        } catch (error) {
            console.error('Error in fetchProjects:', error);
            displayErrorMessage(`Error loading projects: ${error.message}.`);
        }
    }

    // --- Helper: Display Error ---
    function displayErrorMessage(message) {
        console.error("DISPLAY ERROR:", message); // Also log errors
        if (initialLoadingMessage) initialLoadingMessage.remove();
        timelineContainer.innerHTML = '';
        timelineContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }

    // --- Helper: Process & Sort Data ---
    function processAndSortProjects(projects) { /* ... (Keep V8 logic) ... */ }

    // --- Helper: Calculate Initial Positions ---
    function calculateInitialPositions() { /* ... (Keep V8 logic) ... */ }

    // --- Helper: Render Items Using Calculated Positions ---
    function renderTimelineItems() {
        timelineItems = []; // Reset DOM refs
        timelineContainer.style.position = 'relative';
        timelineContainer.style.minHeight = `${calculatedTimelineHeight}px`;
        let lastCalculatedBottom = BASE_ITEM_OFFSET;

        console.log(`RENDER: Starting loop for ${sortedProjects.length} items...`);
        sortedProjects.forEach((project, index) => {
            // console.log(`RENDER: Processing item ${index} - ${project.title || 'Untitled'}`);
            const itemInfo = timelineItems.find((item, idx) => idx === index); // Find pre-calculated info
             if (!itemInfo) {
                 console.error(`RENDER ERROR: Could not find pre-calculated info for index ${index}`);
                 return; // Skip rendering this item if info is missing
             }

            const isLeft = itemInfo.isLeft;
            const timelineItem = document.createElement('div');
            timelineItem.classList.add('timeline-item', isLeft ? 'timeline-item-left' : 'timeline-item-right');
            timelineItem.dataset.identifier = project.isValidDate ? project.dateObj.toISOString() : `item-invalid-${index}`;

            timelineItem.style.position = 'absolute';
            timelineItem.style.top = `${itemInfo.targetTop}px`; // Use stored targetTop
            timelineItem.style.left = isLeft ? '0' : '50%';
            timelineItem.style.width = '50%';

            itemInfo.element = timelineItem; // Store DOM element

            // --- Format Date, Get Image/Category/Link ---
            let displayDate = 'Date N/A';
            if (project.isValidDate) { /* ... format ... */ }
            const title = project.title ?? 'Untitled Project';
            const description = project.description ?? 'No description.';
            const firstImage = project.images?.[0] ?? null;
            const imagePath = firstImage ? `assets/${firstImage}` : '';
            const category = project.tags?.[0]?.toUpperCase() ?? '';
            const projectLink = project.link ?? null;
            const imageHTML = imagePath ? `<div class="card-image-container"><img src="${imagePath}" alt="${title}" loading="lazy"></div>`:'<div class="card-image-container"></div>';
            const categoryHTML = category ? `<span class="separator">-</span><span class="card-category">${category}</span>`:'';
            const linkHTML = projectLink ? `<p class="card-link"><a href="${projectLink}" target="_blank">View</a></p>`:'';

            // --- Generate HTML ---
            try {
                timelineItem.innerHTML = `
                    <div class="timeline-marker"></div>
                    <svg class="connector-line" preserveAspectRatio="none"><path d="" fill="none" /></svg> <!-- SVG Included -->
                    <div class="timeline-card">
                        ${imageHTML}
                        <div class="card-content">
                            <div class="card-header"><span class="card-date">${displayDate}</span>${categoryHTML}</div>
                            <h3 class="card-title">${title}</h3>
                            <p class="card-description">${description}</p>
                            ${linkHTML}
                        </div>
                    </div>
                `;
                 // ** Log SUCCESSFUL append **
                 // console.log(`RENDER: Appending item ${index} to container.`);
                 timelineContainer.appendChild(timelineItem);

            } catch (htmlError) {
                 console.error(`RENDER ERROR generating innerHTML for item ${index}:`, htmlError);
                 timelineItem.innerHTML = `<div style="color:red; border:1px solid red; padding: 5px;">Render Error for item ${index}</div>`;
                  timelineContainer.appendChild(timelineItem); // Append error placeholder
            }
            // Note: timelineItems array is already populated in calculateInitialPositions
        });
        console.log("RENDER: Finished item rendering loop.");
    }

    // --- Helper: Adjust for Overlaps ---
     function adjustForOverlaps() {
         console.log("ADJUST: Starting overlap check...");
         // ... (Keep V8 logic, ensure console logs inside trigger if adjustment happens) ...
          if (timelineItems.length < 2) { /* ... log skip ... */ return; }
          let adjustmentsMade = false;
          for (let i = 0; i < timelineItems.length - 1; i++) { /* ... loop ... */
                const itemInfo1 = timelineItems[i]; const itemInfo2 = timelineItems[i + 1];
                if (!itemInfo1.element || !itemInfo2.element || itemInfo1.isLeft === itemInfo2.isLeft) continue;
                const item1Top = itemInfo1.element.offsetTop; const item1Height = itemInfo1.element.offsetHeight;
                const item1Bottom = item1Top + item1Height;
                const item2Top = itemInfo2.element.offsetTop;
                const minimumItem2Top = item1Bottom + CARD_VERTICAL_GAP;
                if (item2Top < minimumItem2Top) {
                    itemInfo2.element.style.top = `${minimumItem2Top}px`;
                    console.log(`Overlap Adjust: Pushed item index ${i + 1} down to ${minimumItem2Top.toFixed(0)}px`);
                    adjustmentsMade = true;
                }
          }
           if (!adjustmentsMade) console.log("ADJUST: No overlap adjustments needed."); else console.log("ADJUST: Overlap adjustments finished.");
     }


    // --- Helper: Draw Connector Lines ---
    function updateConnectorLines() {
        console.log("CONNECTORS: Starting line update...");
        // ... (Keep V8 logic, add console logs inside the loop if needed) ...
        if(timelineItems.length === 0 || !timelineItems[0].element) { /* ... log skip ... */ return; }
        timelineItems.forEach((itemInfo, index) => { /* ... find elements, calculate path, set attribute ... */});
        console.log("CONNECTORS: Finished line update.");
    }

    // --- Helper: Update Container Height ---
    function updateContainerHeight() {
        console.log("HEIGHT: Starting container height update...");
        // ... (Keep V8 logic) ...
         if (timelineItems.length === 0 || !timelineItems[0].element) { /* ... log skip ... */ return; }
         let maxHeight = 0;
         timelineItems.forEach(itemInfo => { /* ... find max bottom ... */ });
         const finalHeight = maxHeight + BASE_ITEM_OFFSET * 1.5;
         timelineContainer.style.height = `${finalHeight}px`;
         calculatedTimelineHeight = finalHeight;
         console.log(`HEIGHT: Container height set to: ${finalHeight.toFixed(0)}px`);
    }

    // --- Helper: Progress Bar Setup ---
    function setupProgressBar() {
        console.log("PROGRESS: Starting progress bar setup...");
        // ... (Keep V8 logic) ...
         try { /* ... find/create elements ... */ console.log("PROGRESS: Setup complete."); }
         catch(e) { console.error("PROGRESS: Error during setup:", e); }
    }

    // --- Scroll Handler: Update Progress Bar ---
    function updateProgressBarOnScroll() {
        // console.log("SCROLL HANDLER: Updating progress..."); // Too noisy, keep commented unless needed
        // ... (Keep V8 logic) ...
         if (!progressBarIndicatorElement || !progressBarTextElement || !progressBarPercentageElement || !timelineStartDate || !timelineEndDate || calculatedTimelineHeight <= 0) return;
         /* ... calculate percentage, interpolate date, update elements ... */
    }

    // --- Throttled Scroll Listener ---
    let isThrottled = false; function throttledScrollHandler() { /* ... Keep V8 logic ... */ }
    // --- Add Scroll/Resize Listeners ---
    function addScrollListener() { console.log("LISTENERS: Adding..."); /* ... Keep V8 logic ... */ console.log("LISTENERS: Added."); }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
