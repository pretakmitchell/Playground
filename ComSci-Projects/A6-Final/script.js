// File Location: Playground/ComSci-Projects/A6-Final/script.js
// V11: Re-enabling Connectors

document.addEventListener('DOMContentLoaded', () => {
    console.log("--- V11 START --- DOM Loaded. Script starting.");

    // --- DOM Elements ---
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');
    if (!timelineContainer) { console.error("FATAL: Timeline container not found!"); return; }
    // ... (rest of config, state variables same as V10) ...
    const PX_PER_DAY = 1.8; const BASE_ITEM_OFFSET = 60; const CARD_HEIGHT_ESTIMATE = 200;
    const MIN_SPACING_PX = 60; const MAX_SPACING_PX = 450; const CARD_VERTICAL_GAP = 30;
    let progressBarElement, progressBarTextElement, progressBarIndicatorElement, progressBarPercentageElement;
    let timelineItems = []; let sortedProjects = [];
    let timelineStartDate, timelineEndDate, timelineDurationDays;
    let calculatedTimelineHeight = 0; const MS_PER_DAY = 1000 * 60 * 60 * 24;


    // --- Main Function ---
    async function fetchProjects() {
        console.log("FETCH: Starting fetch...");
        try {
            // ... (fetch + initial error checks remain the same) ...
            const response = await fetch('/api/a6-timeline-projects');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const projects = await response.json();
            console.log(`FETCH: ${projects?.length ?? 0} projects received.`);
            if (initialLoadingMessage) initialLoadingMessage.remove();
            timelineContainer.innerHTML = '';
            if (!projects || !Array.isArray(projects) || projects.length === 0) { /* ... error ... */ return; }

            console.log("PROCESS: Starting project processing...");
            processAndSortProjects(projects); // Process and set date range
            console.log(`PROCESS: Done. Start=${timelineStartDate?.toISOString()}, End=${timelineEndDate?.toISOString()}`);

            if (!timelineStartDate || !timelineEndDate) {
                 displayErrorMessage('Could not determine timeline range (missing/invalid dates).');
                 // Optionally render invalid items if processAndSortProjects populated sortedProjects
                 if (sortedProjects.length > 0) {
                     console.log("Attempting to render items without time range...");
                     renderTimelineItems(true); // Pass flag for simple layout if desired
                 }
                 return; // Stop if no valid range
            }

            // If date range is valid, proceed
            console.log("RENDER: Calculating initial positions...");
            calculateInitialPositions();
            console.log("RENDER: Rendering items to DOM...");
            renderTimelineItems();
            console.log(`RENDER: ${timelineItems.length} items theoretically added to DOM.`);


            requestAnimationFrame(() => {
                console.log("POST-RENDER: Starting adjustments...");
                try {
                    adjustForOverlaps();
                    console.log("POST-RENDER: Drawing connector lines..."); // Log before call
                    updateConnectorLines(); // ** RE-ENABLED CONNECTOR DRAWING **
                    console.log("POST-RENDER: Updating container height...");
                    updateContainerHeight();
                    console.log("POST-RENDER: Setting up progress bar...");
                    setupProgressBar();
                    addScrollListener();
                    requestAnimationFrame(updateProgressBarOnScroll);
                    console.log("POST-RENDER: Adjustments and setup complete.");
                } catch (postRenderError) { /* ... error handling ... */ }
            });

        } catch (error) { /* ... error handling ... */ }
    }

    // --- Helper: Display Error ---
    function displayErrorMessage(message) { /* ... (same) ... */ }

    // --- Helper: Process & Sort Data ---
    function processAndSortProjects(projects) { /* ... (same as V10) ... */ }

    // --- Helper: Calculate Initial Positions ---
    function calculateInitialPositions() { /* ... (same as V10) ... */ }

    // --- Helper: Render Items Using Calculated Positions ---
    function renderTimelineItems(forceSimpleLayout = false) {
        timelineItems = [];
        timelineContainer.style.position = 'relative';
        timelineContainer.style.minHeight = `${calculatedTimelineHeight}px`;
        let lastCalculatedBottom = BASE_ITEM_OFFSET;

        console.log(`RENDER: Starting loop for ${sortedProjects.length} items...`);
        timelineItems.forEach((itemInfo, index) => { // Use itemInfo from pre-calculated array
            const project = itemInfo.projectData;
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

            // --- Generate HTML - RE-ENABLE SVG ---
            try {
                timelineItem.innerHTML = `
                    <div class="timeline-marker"></div>
                    <svg class="connector-line" preserveAspectRatio="none"><path d="" fill="none" /></svg> <!-- SVG is back -->
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
                 timelineContainer.appendChild(timelineItem);
            } catch (htmlError) { /* ... error handling ... */ }
            // Pushing to timelineItems is done in calculateInitialPositions
        });
        console.log("RENDER: Finished item rendering loop.");
    }


    // --- Helper: Adjust for Overlaps ---
     function adjustForOverlaps() { /* ... (Keep V10 logic) ... */ }


    // --- Helper: Draw Connector Lines (SVG Paths) ---
    function updateConnectorLines() {
        console.log("CONNECTORS: Starting line update..."); // Log Start
        if(timelineItems.length === 0 || !timelineItems[0].element) {
            console.log("CONNECTORS: Skipping - no items rendered.");
            return;
        }

         const markerSize = 10; // Match CSS approx

         timelineItems.forEach((itemInfo, index) => {
            const item = itemInfo.element;
            if (!item) { /* ... warn skip ... */ return; }

            const svg = item.querySelector('.connector-line');
            const path = svg?.querySelector('path');
            const marker = item.querySelector('.timeline-marker');
            const card = item.querySelector('.timeline-card');
            if (!path || !marker || !card) { /* ... warn skip ... */ return; }

            const isLeft = itemInfo.isLeft;

            // Get positions relative to the item element's coordinate space (its offsetParent is timelineContainer)
            // These are read *after* adjustForOverlaps has potentially modified style.top
            const markerOffsetX = marker.offsetLeft + marker.offsetWidth / 2;
            const markerOffsetY = marker.offsetTop + marker.offsetHeight / 2;

            const cardOffsetX = card.offsetLeft;
            const cardOffsetY = card.offsetTop;
            const cardWidth = card.offsetWidth;
            const cardHeight = card.offsetHeight;

            // Connect to the middle of the card's inner edge
            const cardConnectX = isLeft ? cardOffsetX : cardOffsetX + cardWidth; // Connect to inner edge
            const cardConnectY = cardOffsetY + cardHeight / 2;

            // --- SVG Positioning and ViewBox ---
            const svgTop = Math.min(markerOffsetY, cardConnectY) - 10;
            const svgLeft = Math.min(markerOffsetX, cardConnectX) - 10;
            const svgWidth = Math.abs(cardConnectX - markerOffsetX) + 20;
            const svgHeight = Math.abs(cardConnectY - markerOffsetY) + 20;

            // Ensure SVG has dimensions before setting path
            if(svgWidth <= 20 || svgHeight <= 20) {
                 console.warn(`CONNECTORS: Skipping item ${index} due to small/zero SVG dimensions.`);
                 path.setAttribute('d',''); // Clear path if dimensions are bad
                 return;
            }


            svg.style.position = 'absolute';
            svg.style.top = `${svgTop}px`; svg.style.left = `${svgLeft}px`;
            svg.style.width = `${svgWidth}px`; svg.style.height = `${svgHeight}px`;
            svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

            // --- Path Coordinates (relative to SVG's top-left 0,0) ---
            const startX = markerOffsetX - svgLeft; const startY = markerOffsetY - svgTop;
            const endX = cardConnectX - svgLeft; const endY = cardConnectY - svgTop;

            // --- S-Curve Calculation ---
            const midX = (startX + endX) / 2; const curveFactor = 0.6;
            const cp1OffsetX = (midX - startX) * curveFactor; const cp2OffsetX = (endX - midX) * curveFactor;
            const cp1X = startX + cp1OffsetX; const cp1Y = startY;
            const cp2X = endX - cp2OffsetX; const cp2Y = endY;
            const pathData = `M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${cp1X.toFixed(1)} ${cp1Y.toFixed(1)}, ${cp2X.toFixed(1)} ${cp2Y.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`; // Use fixed decimals

            path.setAttribute('d', pathData);
             // console.log(`CONNECTORS: Drew line for item ${index}`); // Log Success
        });
         console.log("CONNECTORS: Finished line update."); // Log End
    }


    // --- Helper: Update Container Height ---
    function updateContainerHeight() { /* ... (Keep V10 logic) ... */ }
    // --- Helper: Progress Bar Setup ---
    function setupProgressBar() { /* ... (Keep V10 logic) ... */ }
    // --- Scroll Handler: Update Progress Bar ---
    function updateProgressBarOnScroll() { /* ... (Keep V10 logic) ... */ }
    // --- Throttled Scroll Listener ---
    let isThrottled = false; function throttledScrollHandler() { /* ... */ }
    // --- Add Scroll/Resize Listeners ---
    function addScrollListener() { /* ... (Keep V10 logic) ... */ }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
