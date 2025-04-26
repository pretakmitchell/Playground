// File Location: Playground/ComSci-Projects/A6-Final/script.js
// V15: Debugging Date Format, Ensuring Connector Execution & Logging

document.addEventListener('DOMContentLoaded', () => {
    console.log("--- V15 START --- DOM Loaded. Script starting."); // Log Start

    // --- DOM Elements, Config, State Variables ---
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');
    if (!timelineContainer) { console.error("FATAL: Timeline container not found!"); return; }
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
            processAndSortProjects(projects);
            console.log(`PROCESS: Done. Start=${timelineStartDate?.toISOString()}, End=${timelineEndDate?.toISOString()}`);

            if (!timelineStartDate || !timelineEndDate) { /* ... error handling ... */ return; }

            console.log("RENDER: Calculating initial positions...");
            calculateInitialPositions();
            console.log(`CALC_POS: Exiting. timelineItems length: ${timelineItems.length}`);
            if(timelineItems.length === 0 && sortedProjects.length > 0) { /* ... error ... */ return; }

            console.log("RENDER: Rendering items to DOM...");
            renderTimelineItems(); // Render items
            console.log(`RENDER: Finished rendering loop. ${timelineItems.length} items added.`);

            requestAnimationFrame(() => {
                 console.log("POST-RENDER: Starting adjustments...");
                 try {
                     adjustForOverlaps();
                     console.log("POST-RENDER: Drawing connector lines..."); // Explicit log BEFORE call
                     updateConnectorLines(); // Ensure this runs
                     console.log("POST-RENDER: Updating container height...");
                     updateContainerHeight();
                     console.log("POST-RENDER: Setting up progress bar...");
                     setupProgressBar();
                     addScrollListener();
                     requestAnimationFrame(updateProgressBarOnScroll);
                     console.log("POST-RENDER: Adjustments and setup complete.");
                 } catch (postRenderError) { console.error("POST-RENDER ERROR:", postRenderError); /* ... error ... */ }
            });

        } catch (error) { console.error('Error in fetchProjects:', error); /* ... error handling ... */ }
    }

    // --- Helper: Display Error ---
    function displayErrorMessage(message) { /* ... (same) ... */ }
    // --- Helper: Process & Sort Data ---
    function processAndSortProjects(projects) { /* ... (Keep V14/V12 Logic - which worked) ... */ }
    // --- Helper: Calculate Initial Positions ---
    function calculateInitialPositions() { /* ... (Keep V14 Logic) ... */ }

    // --- Helper: Render Items (Logging Date Format Step) ---
    function renderTimelineItems(forceSimpleLayout = false) {
        if (!timelineItems || timelineItems.length === 0) { console.error("RENDER: timelineItems empty!"); return; }
        timelineContainer.style.position = 'relative';
        timelineContainer.style.minHeight = `${calculatedTimelineHeight}px`;
        timelineContainer.innerHTML = ''; // Clear before fresh render

        console.log(`RENDER: Starting render loop for ${timelineItems.length} items...`);
        timelineItems.forEach((itemInfo, index) => {
            if (!itemInfo || !itemInfo.projectData) { console.warn(`RENDER: Skipping item ${index}, missing data.`); return; }
            const project = itemInfo.projectData; const isLeft = itemInfo.isLeft;
            const timelineItem = document.createElement('div');
            timelineItem.classList.add('timeline-item', isLeft ? 'timeline-item-left' : 'timeline-item-right');
            timelineItem.dataset.identifier = project.isValidDate ? project.dateObj.toISOString() : `item-invalid-${index}`;
            timelineItem.style.position = 'absolute';
            timelineItem.style.top = `${itemInfo.targetTop}px`;
            timelineItem.style.left = isLeft ? '0' : '50%';
            timelineItem.style.width = '50%';
            itemInfo.element = timelineItem;

            // --- Format Date (with logging) ---
            let displayDate = 'Date N/A'; // Default
            if (project.isValidDate && project.dateObj) { // Check validity and object existence
                 try {
                     const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
                     const formatted = project.dateObj.toLocaleDateString('en-US', dateOptions);
                     displayDate = formatted.toUpperCase(); // Assign and uppercase
                     // console.log(`RENDER Date Format: ID ${project.id || index}, DateObj: ${project.dateObj}, Formatted: ${formatted}, Final: ${displayDate}`); // DEBUG LOG
                 } catch(e) {
                     console.error(`RENDER Date Format Error: ID ${project.id || index}`, e, project.dateObj);
                     displayDate = "ERR"; // Error indicator
                 }
            } else {
                // console.log(`RENDER Date Format: ID ${project.id || index}, No valid date object found.`); // DEBUG LOG
            }

            // --- Get Image/Category/Link ---
            const title=project.title ?? 'Untitled'; const description=project.description ?? '...';
            const imagePath=project.images?.[0] ? `assets/${project.images[0]}` : '';
            const category=project.tags?.[0]?.toUpperCase() ?? ''; const link=project.link ?? null;
            const imageHTML=imagePath?`<div class="card-image-container"><img src="${imagePath}" alt="${title}" loading="lazy"></div>`:'<div class="card-image-container"></div>';
            const catHTML=category?`<span class="separator">-</span><span class="card-category">${category}</span>`:'';
            const linkHTML=link?`<p class="card-link"><a href="${link}" target="_blank">View</a></p>`:'';

            // --- Generate HTML ---
            try {
                timelineItem.innerHTML = `
                    <div class="timeline-marker"></div>
                    <svg class="connector-line" preserveAspectRatio="none"><path d="" fill="none" /></svg>
                    <div class="timeline-card">
                        ${imageHTML}
                        <div class="card-content">
                            <div class="card-header"><span class="card-date">${displayDate}</span>${catHTML}</div>
                            <h3 class="card-title">${title}</h3>
                            <p class="card-description">${description}</p>
                            ${linkHTML}
                        </div>
                    </div>`;
                timelineContainer.appendChild(timelineItem);
            } catch (htmlError) { /* ... error handling ... */ }
        });
        console.log("RENDER: Finished item rendering loop.");
    }

    // --- Helper: Adjust for Overlaps ---
    function adjustForOverlaps() { /* ... (Keep V14 logic) ... */ }

    // --- Helper: Draw Connector Lines (Add Logging) ---
    function updateConnectorLines() {
        console.log("CONNECTORS: Starting line update...");
        if(timelineItems.length === 0 || !timelineItems[0].element) { console.log("CONNECTORS: Skipping - no items rendered."); return; }
        let linesDrawn = 0;

        timelineItems.forEach((itemInfo, index) => {
            const item = itemInfo.element;
            if (!item) { console.warn(`CONNECTORS: Skipping item ${index} - element not found.`); return; }
            const svg = item.querySelector('.connector-line'); const path = svg?.querySelector('path');
            const marker = item.querySelector('.timeline-marker'); const card = item.querySelector('.timeline-card');
            if (!path || !marker || !card) { console.warn(`CONNECTORS: Skipping item ${index} - inner elements not found.`); return; }

            const isLeft = itemInfo.isLeft;
            // Read positions AFTER overlap adjustments
            const markerOffsetX = marker.offsetLeft + marker.offsetWidth / 2;
            const markerOffsetY = marker.offsetTop + marker.offsetHeight / 2;
            const cardOffsetX = card.offsetLeft; const cardOffsetY = card.offsetTop;
            const cardWidth = card.offsetWidth; const cardHeight = card.offsetHeight;
            const cardConnectX = isLeft ? cardOffsetX : cardOffsetX + cardWidth;
            const cardConnectY = cardOffsetY + cardHeight / 2;
            const svgTop = Math.min(markerOffsetY, cardConnectY) - 10;
            const svgLeft = Math.min(markerOffsetX, cardConnectX) - 10;
            const svgWidth = Math.abs(cardConnectX - markerOffsetX) + 20;
            const svgHeight = Math.abs(cardConnectY - markerOffsetY) + 20;

            if(svgWidth <= 20 || svgHeight <= 20) {
                 console.warn(`CONNECTORS: Skipping item ${index} due to small/zero SVG dimensions (W:${svgWidth}, H:${svgHeight}).`);
                 path.setAttribute('d',''); return; // Clear path
            }

            svg.style.position = 'absolute'; svg.style.top = `${svgTop}px`; svg.style.left = `${svgLeft}px`;
            svg.style.width = `${svgWidth}px`; svg.style.height = `${svgHeight}px`;
            svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
            const startX = markerOffsetX - svgLeft; const startY = markerOffsetY - svgTop;
            const endX = cardConnectX - svgLeft; const endY = cardConnectY - svgTop;
            const midX = (startX + endX) / 2; const curveFactor = 0.6;
            const cp1OffsetX = (midX - startX) * curveFactor; const cp2OffsetX = (endX - midX) * curveFactor;
            const cp1X = startX + cp1OffsetX; const cp1Y = startY; const cp2X = endX - cp2OffsetX; const cp2Y = endY;
            const pathData = `M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${cp1X.toFixed(1)} ${cp1Y.toFixed(1)}, ${cp2X.toFixed(1)} ${cp2Y.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`;
            path.setAttribute('d', pathData);
            // console.log(`CONNECTORS: Drew line for item ${index}, path: ${pathData}`); // Log path data
            linesDrawn++;
        });
        console.log(`CONNECTORS: Finished line update. Attempted to draw ${linesDrawn} lines.`);
    }

    // --- Helper: Update Container Height ---
    function updateContainerHeight() { /* ... (Keep V14 logic) ... */ }
    // --- Helper: Progress Bar Setup ---
    function setupProgressBar() { /* ... (Keep V14 logic) ... */ }
    // --- Scroll Handler: Update Progress Bar ---
    function updateProgressBarOnScroll() { /* ... (Keep V14 logic) ... */ }
    // --- Throttled Scroll Listener ---
    let isThrottled = false; function throttledScrollHandler() { /* ... */ }
    // --- Add Scroll/Resize Listeners ---
    function addScrollListener() { /* ... (Keep V14 logic) ... */ }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
