// File Location: Playground/ComSci-Projects/A6-Final/script.js
// Attempt V5: Reintegrating Connectors, Refining Overlap Check

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');

    // --- Configuration ---
    const PX_PER_DAY = 1.8; // Pixels/day - TUNE THIS!
    const BASE_ITEM_OFFSET = 60; // Top padding
    const CARD_HEIGHT_ESTIMATE = 200; // Approx height for initial container estimate
    const CARD_VERTICAL_GAP = 35; // Min vertical gap between overlapping cards

    // --- State Variables ---
    let progressBarElement, progressBarTextElement, progressBarIndicatorElement, progressBarPercentageElement;
    let timelineItems = []; // Stores { element: DOMNode, targetTop: number, isLeft: boolean, projectData: object }
    let sortedProjects = [];
    let timelineStartDate, timelineEndDate, timelineDurationDays;
    let calculatedTimelineHeight = 0;
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // --- Main Function ---
    async function fetchProjects() {
        try {
            const response = await fetch('/api/a6-timeline-projects');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const projects = await response.json();

            if (initialLoadingMessage) initialLoadingMessage.remove();
            timelineContainer.innerHTML = '';

            if (!projects || !Array.isArray(projects) || projects.length === 0) {
                displayErrorMessage('No projects found.'); return;
            }

            processAndSortProjects(projects);

            if (!timelineStartDate || !timelineEndDate) {
                displayErrorMessage('Could not determine timeline range (missing/invalid dates).');
                return;
            }

            calculateInitialPositions(); // Calculate targetTop values first
            renderTimelineItems(); // Render items using targetTop

            requestAnimationFrame(() => { // Defer adjustments until after render
                adjustForOverlaps();      // Adjust 'top' style ONLY IF needed
                updateConnectorLines();   // ** CALL CONNECTOR DRAWING HERE **
                updateContainerHeight();  // Set final container height AFTER adjustments
                setupProgressBar();
                addScrollListener();
                requestAnimationFrame(updateProgressBarOnScroll); // Initial update
            });

        } catch (error) {
            console.error('Error fetching or displaying projects:', error);
            displayErrorMessage(`Error loading projects: ${error.message}.`);
        }
    }

    // --- Helper: Display Error ---
    function displayErrorMessage(message) { /* ... (same) ... */ }

    // --- Helper: Process & Sort Data ---
    function processAndSortProjects(projects) { /* ... (same) ... */ }

    // --- Helper: Calculate Initial Positions ---
    function calculateInitialPositions() {
        timelineItems = []; // Reset
        let lastValidTopPosition = BASE_ITEM_OFFSET;

        sortedProjects.forEach((project, index) => {
            const isLeft = index % 2 === 0;
            let targetTop = 0;

            if (project.isValidDate) {
                const timeDiffMs = project.dateObj.getTime() - timelineStartDate.getTime();
                const timeDiffDays = Math.max(0, timeDiffMs / MS_PER_DAY);
                targetTop = BASE_ITEM_OFFSET + (timeDiffDays * PX_PER_DAY);
                lastValidTopPosition = targetTop;
            } else {
                 targetTop = lastValidTopPosition + MIN_SPACING_PX; // Use MIN_SPACING_PX, not CARD_VERTICAL_GAP
                 lastValidTopPosition = targetTop;
            }

            timelineItems.push({ projectData: project, targetTop: targetTop, isLeft: isLeft, element: null });
        });
    }

    // --- Helper: Render Items Using Calculated Positions ---
    function renderTimelineItems() {
        timelineContainer.style.position = 'relative';
        timelineContainer.style.minHeight = `${calculatedTimelineHeight}px`; // Initial estimate

        timelineItems.forEach((itemInfo, index) => {
            const project = itemInfo.projectData;
            const isLeft = itemInfo.isLeft;

            const timelineItem = document.createElement('div');
            timelineItem.classList.add('timeline-item', isLeft ? 'timeline-item-left' : 'timeline-item-right');
            timelineItem.dataset.identifier = project.isValidDate ? project.dateObj.toISOString() : `item-invalid-${index}`;

            timelineItem.style.position = 'absolute';
            timelineItem.style.top = `${itemInfo.targetTop}px`; // Apply pre-calculated top
            timelineItem.style.left = isLeft ? '0' : '50%';
            timelineItem.style.width = '50%';

            itemInfo.element = timelineItem; // Store DOM element

            // --- Format Date, Get Image/Category/Link (same as before) ---
            let displayDate = 'Date N/A';
            if (project.isValidDate) { /* ... format ... */ }
            const firstImage = project.images?.[0] ?? null;
            const imagePath = firstImage ? `assets/${firstImage}` : '';
            const category = project.tags?.[0]?.toUpperCase() ?? '';
            const projectLink = project.link ?? null;
            const imageHTML = imagePath ? `<div class="card-image-container"><img src="${imagePath}" alt="${project.title || 'Project'}" loading="lazy"></div>`:'<div class="card-image-container"></div>';
            const categoryHTML = category ? `<span class="separator">-</span><span class="card-category">${category}</span>`:'';
            const linkHTML = projectLink ? `<p class="card-link"><a href="${projectLink}" target="_blank" rel="noopener noreferrer">View</a></p>`:'';

            // --- Generate HTML ---
            timelineItem.innerHTML = `
                <div class="timeline-marker"></div>
                <svg class="connector-line" preserveAspectRatio="none"><path d="" fill="none" /></svg>
                <div class="timeline-card">
                    ${imageHTML}
                    <div class="card-content">
                        <div class="card-header"><span class="card-date">${displayDate}</span>${categoryHTML}</div>
                        <h3 class="card-title">${project.title || 'Untitled'}</h3>
                        <p class="card-description">${project.description || '...'}</p>
                        ${linkHTML}
                    </div>
                </div>`;
            timelineContainer.appendChild(timelineItem);
        });
    }

    // --- Helper: Adjust for Overlaps (Only checks adjacent, opposite-side items) ---
     function adjustForOverlaps() {
         if (timelineItems.length < 2) return;

         for (let i = 0; i < timelineItems.length - 1; i++) {
             const itemInfo1 = timelineItems[i];
             const itemInfo2 = timelineItems[i + 1];

             // Check if elements exist and if they are on OPPOSITE sides
             if (!itemInfo1.element || !itemInfo2.element || itemInfo1.isLeft === itemInfo2.isLeft) {
                 continue; // Skip if same side or element missing
             }

             // Read current positions/sizes AFTER rendering
             const item1Top = itemInfo1.element.offsetTop;
             const item1Height = itemInfo1.element.offsetHeight;
             const item1Bottom = item1Top + item1Height;
             const item2Top = itemInfo2.element.offsetTop; // Current top of the next item

             const minimumItem2Top = item1Bottom + CARD_VERTICAL_GAP;

             // If item 2 is currently higher than it should be to avoid overlap, push it down
             if (item2Top < minimumItem2Top) {
                 itemInfo2.element.style.top = `${minimumItem2Top}px`;
                 // Update internal state if needed (optional, offsetTop read is usually sufficient)
                 // itemInfo2.targetTop = minimumItem2Top;
                 // console.log(`Overlap Adjust: Pushed item ${i + 1} down to ${minimumItem2Top.toFixed(0)}px`);
             }
         }
     }

    // --- Helper: Draw Connector Lines (SVG Paths) ---
    function updateConnectorLines() {
         // Ensure elements exist before trying to draw
         if(timelineItems.length === 0 || !timelineItems[0].element) return;

         const markerSize = 10; // Should match CSS approx
         timelineItems.forEach(itemInfo => {
            const item = itemInfo.element; // Get the DOM element
            if (!item) return; // Skip if element is missing

            const svg = item.querySelector('.connector-line');
            const path = svg?.querySelector('path');
            const marker = item.querySelector('.timeline-marker');
            const card = item.querySelector('.timeline-card');
            if (!path || !marker || !card) return; // Skip if inner elements missing

            const isLeft = itemInfo.isLeft; // Use stored isLeft flag

            // Get positions relative to the item itself for SVG path calculation
            // These need to be accurate AFTER overlap adjustments
            const markerOffsetX = marker.offsetLeft + marker.offsetWidth / 2;
            const markerOffsetY = marker.offsetTop + marker.offsetHeight / 2;
            const cardOffsetX = card.offsetLeft;
            const cardOffsetY = card.offsetTop;
            const cardWidth = card.offsetWidth;
            const cardHeight = card.offsetHeight;

            // Connect to the middle of the card's inner edge
            const cardConnectX = isLeft ? cardOffsetX : cardOffsetX + cardWidth;
            const cardConnectY = cardOffsetY + cardHeight / 2;

            // Calculate SVG positioning and viewBox relative to the item's coordinate space
            const svgTop = Math.min(markerOffsetY, cardConnectY) - 10;
            const svgLeft = Math.min(markerOffsetX, cardConnectX) - 10;
            const svgWidth = Math.abs(cardConnectX - markerOffsetX) + 20;
            const svgHeight = Math.abs(cardConnectY - markerOffsetY) + 20;

            svg.style.position = 'absolute';
            svg.style.top = `${svgTop}px`; svg.style.left = `${svgLeft}px`;
            svg.style.width = `${svgWidth}px`; svg.style.height = `${svgHeight}px`;
            svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

            // Path coordinates relative to SVG's top-left (0,0)
            const startX = markerOffsetX - svgLeft; const startY = markerOffsetY - svgTop;
            const endX = cardConnectX - svgLeft; const endY = cardConnectY - svgTop;

            // Simple S-Curve Calculation
            const midX = (startX + endX) / 2;
            const cp1OffsetX = (midX - startX) * 0.7; const cp2OffsetX = (endX - midX) * 0.7;
            const cp1X = startX + cp1OffsetX; const cp1Y = startY;
            const cp2X = endX - cp2OffsetX; const cp2Y = endY;
            const pathData = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

            path.setAttribute('d', pathData);
        });
    }

    // --- Helper: Update Container Height After Adjustments ---
    function updateContainerHeight() { /* ... (Same as before) ... */ }

    // --- Helper: Progress Bar Setup ---
    function setupProgressBar() { /* ... (Same as before) ... */ }

    // --- Scroll Handler: Update Progress Bar ---
    function updateProgressBarOnScroll() { /* ... (Same as before) ... */ }

    // --- Throttled Scroll Listener ---
    let isThrottled = false;
    function throttledScrollHandler() { /* ... */ }
    function addScrollListener() { /* ... */ }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
