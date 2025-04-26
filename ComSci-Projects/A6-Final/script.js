// File Location: Playground/ComSci-Projects/A6-Final/script.js
// V8: Refining Overlap Check, Re-enabling Connectors

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements, Config, State Variables ---
    // (Keep all these the same as V7)
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');
    const PX_PER_DAY = 1.8; const BASE_ITEM_OFFSET = 60; const CARD_HEIGHT_ESTIMATE = 200;
    const MIN_SPACING_PX = 60; const MAX_SPACING_PX = 450; const CARD_VERTICAL_GAP = 30; // Keep gap for actual overlaps
    let progressBarElement, progressBarTextElement, progressBarIndicatorElement, progressBarPercentageElement;
    let timelineItems = []; let sortedProjects = [];
    let timelineStartDate, timelineEndDate, timelineDurationDays;
    let calculatedTimelineHeight = 0; const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // --- Main Function ---
    async function fetchProjects() {
        console.log("Fetching projects...");
        try {
            // ... (fetch + initial error checks remain the same) ...
            const response = await fetch('/api/a6-timeline-projects');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const projects = await response.json();
            if (initialLoadingMessage) initialLoadingMessage.remove();
            timelineContainer.innerHTML = '';
            if (!projects || !Array.isArray(projects) || projects.length === 0) { /* ... error ... */ return; }

            processAndSortProjects(projects);
            if (!timelineStartDate || !timelineEndDate) { /* ... error ... */ return; }

            calculateInitialPositions();
            renderTimelineItems(); // Initial render with time-based 'top'

            requestAnimationFrame(() => { // Defer adjustments
                console.log("Deferred: Adjusting for overlaps...");
                adjustForOverlaps(); // Refined overlap check
                console.log("Deferred: Drawing connector lines..."); // Re-enabled
                updateConnectorLines(); // Draw lines AFTER final positioning
                console.log("Deferred: Updating container height...");
                updateContainerHeight();
                console.log("Deferred: Setting up progress bar...");
                setupProgressBar();
                addScrollListener();
                requestAnimationFrame(updateProgressBarOnScroll);
                console.log("Deferred: Post-render setup complete.");
            });

        } catch (error) { /* ... error handling ... */ }
    }

    // --- Helper: Display Error ---
    function displayErrorMessage(message) { /* ... (same) ... */ }

    // --- Helper: Process & Sort Data ---
    function processAndSortProjects(projects) { /* ... (same) ... */ }

    // --- Helper: Calculate Initial Positions ---
    function calculateInitialPositions() { /* ... (same) ... */ }

    // --- Helper: Render Items Using Calculated Positions ---
    function renderTimelineItems() {
        timelineItems = [];
        timelineContainer.style.position = 'relative';
        timelineContainer.style.minHeight = `${calculatedTimelineHeight}px`;

        let lastCalculatedBottom = BASE_ITEM_OFFSET;

        console.log(`Rendering ${sortedProjects.length} items...`);
        sortedProjects.forEach((project, index) => {
            const isLeft = index % 2 === 0;
            const timelineItem = document.createElement('div');
            timelineItem.classList.add('timeline-item', isLeft ? 'timeline-item-left' : 'timeline-item-right');
            timelineItem.dataset.identifier = project.isValidDate ? project.dateObj.toISOString() : `item-invalid-${index}`;

            // Find corresponding itemInfo object based on index (safer than assuming order)
            let itemInfo = timelineItems.find((item, idx) => idx === index); // This assumes timelineItems is populated by calculateInitialPositions in the correct order
            if (!itemInfo) { // Fallback just in case
                 const timeDiffMs = project.isValidDate ? project.dateObj.getTime() - timelineStartDate.getTime() : 0;
                 const timeDiffDays = project.isValidDate ? Math.max(0, timeDiffMs / MS_PER_DAY) : 0;
                 itemInfo = {
                     projectData: project,
                     targetTop: project.isValidDate ? (BASE_ITEM_OFFSET + (timeDiffDays * PX_PER_DAY)) : (lastCalculatedBottom + MIN_SPACING_PX),
                     isLeft: isLeft,
                     element: timelineItem // Assign element here
                 };
                // This part is problematic if calculateInitialPositions didn't run or failed
                console.warn("Item info not found from pre-calculation, creating fallback.");
            } else {
                itemInfo.element = timelineItem; // Assign element to pre-calculated info
            }


            // --- Apply Initial Position ---
            timelineItem.style.position = 'absolute';
            timelineItem.style.top = `${itemInfo.targetTop}px`; // Apply pre-calculated top
            timelineItem.style.left = isLeft ? '0' : '50%';
            timelineItem.style.width = '50%';

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
            const linkHTML = projectLink ? `<p class="card-link"><a href="${projectLink}" target="_blank" rel="noopener noreferrer">View</a></p>`:'';

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
            } catch (htmlError) { /* ... error handling ... */ }

            timelineContainer.appendChild(timelineItem);
            // Don't push here, timelineItems is populated by calculateInitialPositions
            // timelineItems.push(itemInfo);

            // Update tracker for placing next *invalid* item
            lastCalculatedBottom = itemInfo.targetTop + CARD_HEIGHT_ESTIMATE;
        });
        console.log("Finished appending items to DOM.");
    }


    // --- Helper: Adjust for Overlaps (Refined Check) ---
     function adjustForOverlaps() {
         console.log("Adjusting for overlaps...");
         if (timelineItems.length < 2) { console.log("Not enough items for overlap check."); return; }

         let adjustmentsMade = false; // Flag to see if anything changed

         // Iterate through adjacent pairs
         for (let i = 0; i < timelineItems.length - 1; i++) {
             const itemInfo1 = timelineItems[i];
             const itemInfo2 = timelineItems[i + 1];

             // Ensure elements are rendered and they are on OPPOSITE sides
             if (!itemInfo1.element || !itemInfo2.element || itemInfo1.isLeft === itemInfo2.isLeft) {
                 continue; // Skip if same side or element missing
             }

             // Get current vertical bounds based on rendered position and height
             const item1Top = itemInfo1.element.offsetTop;
             const item1Height = itemInfo1.element.offsetHeight;
             const item1Bottom = item1Top + item1Height;
             const item2Top = itemInfo2.element.offsetTop; // Current actual top

             // Calculate the minimum allowed top for item2 to avoid overlap with item1
             const minimumRequiredTopForItem2 = item1Bottom + CARD_VERTICAL_GAP;

             // If item2's CURRENT position violates the minimum gap needed below item1, push it down
             if (item2Top < minimumRequiredTopForItem2) {
                 const newTop = minimumRequiredTopForItem2;
                 itemInfo2.element.style.top = `${newTop}px`; // Adjust style.top directly
                 // Optionally update the stored value if needed elsewhere, but reading offsetTop is better
                 // itemInfo2.targetTop = newTop;
                 console.log(`Overlap Adjust: Pushed item index ${i + 1} (${itemInfo2.projectData.title}) down to ${newTop.toFixed(0)}px`);
                 adjustmentsMade = true;
             }
         }
         if (!adjustmentsMade) { console.log("No overlaps needed adjustment."); }
     }


    // --- Helper: Draw Connector Lines ---
    function updateConnectorLines() {
        console.log("Updating connector lines..."); // Log: Start drawing
        if(timelineItems.length === 0 || !timelineItems[0].element) {
            console.log("Skipping connector lines - no items rendered.");
            return;
        }

         const markerSize = 10; // Should match CSS approx

         timelineItems.forEach((itemInfo, index) => {
            const item = itemInfo.element;
            if (!item) { console.warn(`Skipping connector for item ${index} - element not found.`); return; }

            const svg = item.querySelector('.connector-line');
            const path = svg?.querySelector('path');
            const marker = item.querySelector('.timeline-marker');
            const card = item.querySelector('.timeline-card');
            if (!path || !marker || !card) {
                console.warn(`Skipping connector for item ${index} - inner elements not found.`);
                return;
            }

            const isLeft = itemInfo.isLeft;

            // Get positions relative to the item element's coordinate space
            // offsetLeft/Top are relative to the offsetParent (timelineContainer)
            // These should reflect the FINAL positions after overlap adjustments
            const markerOffsetX = marker.offsetLeft + marker.offsetWidth / 2;
            const markerOffsetY = marker.offsetTop + marker.offsetHeight / 2;

            const cardOffsetX = card.offsetLeft;
            const cardOffsetY = card.offsetTop;
            const cardWidth = card.offsetWidth;
            const cardHeight = card.offsetHeight;

            // Connect to the middle of the card's inner edge (edge closest to center axis)
            const cardConnectX = isLeft ? cardOffsetX : cardOffsetX + cardWidth;
            const cardConnectY = cardOffsetY + cardHeight / 2;

            // --- SVG Positioning and ViewBox ---
            // Position SVG absolutely within the timeline-item
            const svgTop = Math.min(markerOffsetY, cardConnectY) - 10; // Add buffer
            const svgLeft = Math.min(markerOffsetX, cardConnectX) - 10; // Add buffer
            const svgWidth = Math.abs(cardConnectX - markerOffsetX) + 20; // Add buffer
            const svgHeight = Math.abs(cardConnectY - markerOffsetY) + 20; // Add buffer

            svg.style.position = 'absolute';
            svg.style.top = `${svgTop}px`;
            svg.style.left = `${svgLeft}px`;
            svg.style.width = `${svgWidth}px`;
            svg.style.height = `${svgHeight}px`;
            svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

            // --- Path Coordinates (relative to SVG's top-left 0,0) ---
            const startX = markerOffsetX - svgLeft;
            const startY = markerOffsetY - svgTop;
            const endX = cardConnectX - svgLeft;
            const endY = cardConnectY - svgTop;

            // --- S-Curve Calculation ---
            const midX = (startX + endX) / 2;
            // Adjust curveFactor for more/less horizontal deviation in the curve
            const curveFactor = 0.6; // 0 = straight line, 1 = max deviation towards midpoint
            const cp1OffsetX = (midX - startX) * curveFactor;
            const cp2OffsetX = (endX - midX) * curveFactor;
            const cp1X = startX + cp1OffsetX;
            const cp1Y = startY; // Control point vertically aligned with start
            const cp2X = endX - cp2OffsetX;
            const cp2Y = endY; // Control point vertically aligned with end

            const pathData = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

            path.setAttribute('d', pathData);
        });
         console.log("Finished updating connector lines.");
    }


    // --- Helper: Update Container Height ---
    function updateContainerHeight() { /* ... (Same as before) ... */ }
    // --- Helper: Progress Bar Setup ---
    function setupProgressBar() { /* ... (Same as before) ... */ }
    // --- Scroll Handler: Update Progress Bar ---
    function updateProgressBarOnScroll() { /* ... (Same as before) ... */ }
    // --- Throttled Scroll Listener ---
    let isThrottled = false; function throttledScrollHandler() { /* ... */ }
    // --- Add Scroll/Resize Listeners ---
    function addScrollListener() { /* ... (Same as before) ... */ }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
