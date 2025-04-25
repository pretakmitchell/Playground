// File Location: Playground/ComSci-Projects/A6-Final/script.js
// Attempt V4: Prioritizing Time-Based Positioning

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');

    // --- Configuration ---
    const PX_PER_DAY = 1.8; // Pixels/day - Increased slightly, TUNE THIS!
    const BASE_ITEM_OFFSET = 60; // Top padding inside container
    const CARD_HEIGHT_ESTIMATE = 200; // Approx height for initial container estimate
    const CARD_VERTICAL_GAP = 35; // Min vertical gap after overlap adjustment (Increased)

    // --- State Variables ---
    let progressBarElement, progressBarTextElement, progressBarIndicatorElement, progressBarPercentageElement;
    let timelineItems = []; // Stores { element: DOMNode, targetTop: number, isLeft: boolean }
    let sortedProjects = [];
    let timelineStartDate, timelineEndDate, timelineDurationDays;
    let calculatedTimelineHeight = 0;
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // --- Main Function ---
    async function fetchProjects() {
        try {
            // ... (fetch logic remains the same) ...
            const response = await fetch('/api/a6-timeline-projects');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const projects = await response.json();
            if (initialLoadingMessage) initialLoadingMessage.remove();
            timelineContainer.innerHTML = '';
            if (!projects || !Array.isArray(projects) || projects.length === 0) { /* ... error ... */ return; }

            processAndSortProjects(projects);
            if (!timelineStartDate || !timelineEndDate) { /* ... error ... */ return; }

            calculateInitialPositions(); // Calculate all targetTop values first
            renderTimelineItems(); // Render items using targetTop

            requestAnimationFrame(() => { // Defer adjustments
                adjustForOverlaps();
                updateConnectorLines(); // Connectors use final positions
                updateContainerHeight(); // Set final height
                setupProgressBar();
                addScrollListener();
                requestAnimationFrame(updateProgressBarOnScroll);
            });

        } catch (error) { /* ... error handling ... */ }
    }

    // --- Helper: Display Error ---
    function displayErrorMessage(message) { /* ... (same) ... */ }

    // --- Helper: Process & Sort Data ---
    function processAndSortProjects(projects) {
        // ... (same logic: map, validate, filter, sort valid, set bounds) ...
         const projectsWithDates = projects
            .map(p => ({ ...p, dateObj: p.date ? new Date(p.date) : null }))
            .map(p => ({ ...p, isValidDate: p.dateObj && !isNaN(p.dateObj.getTime()) }));
        const validDateProjects = projectsWithDates.filter(p => p.isValidDate);
        if (validDateProjects.length === 0) { /* ... handle ... */ return; }
        validDateProjects.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
        timelineStartDate = validDateProjects[0].dateObj;
        timelineEndDate = validDateProjects[validDateProjects.length - 1].dateObj;
        const durationMs = timelineEndDate.getTime() - timelineStartDate.getTime();
        timelineDurationDays = Math.max(1, durationMs / MS_PER_DAY);
        calculatedTimelineHeight = BASE_ITEM_OFFSET + (timelineDurationDays * PX_PER_DAY) + CARD_HEIGHT_ESTIMATE * 1.5;
        sortedProjects = [...validDateProjects, ...projectsWithDates.filter(p => !p.isValidDate)];
    }

    // --- NEW Helper: Calculate Initial Positions ---
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
                lastValidTopPosition = targetTop; // Update tracker
            } else {
                 // Place invalid items based on last valid item's position + minimum gap
                 // This initial position might still cause overlaps if previous item was tall
                 targetTop = lastValidTopPosition + MIN_SPACING_PX; // Use MIN_SPACING_PX here
                 lastValidTopPosition = targetTop; // Update approx floor for next invalid
            }

            // Store calculated position along with other info (element created later)
            timelineItems.push({
                projectData: project,
                targetTop: targetTop,
                isLeft: isLeft,
                element: null // DOM element added during render
            });
             // console.log(`Item ${index}: Date ${project.date}, Target Top: ${targetTop.toFixed(1)}`); // DEBUG
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

            // --- Apply Pre-Calculated Position ---
            timelineItem.style.position = 'absolute';
            timelineItem.style.top = `${itemInfo.targetTop}px`; // Use stored targetTop
            timelineItem.style.left = isLeft ? '0' : '50%';
            timelineItem.style.width = '50%';

            // Store DOM element back in our array
            itemInfo.element = timelineItem;

            // --- Format Date, Get Image/Category (same as before) ---
            let displayDate = 'Date N/A';
            if (project.isValidDate) {
                 try { displayDate = project.dateObj.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}).toUpperCase(); }
                 catch(e) { displayDate = "Invalid Date"; }
            }
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

    // --- Helper: Adjust for Overlaps (Checks against current style.top) ---
     function adjustForOverlaps() {
         if (timelineItems.length < 2) return;

         // Iterate multiple times might be needed for complex cascading overlaps
         // but start with one pass.
         for (let i = 0; i < timelineItems.length - 1; i++) {
             const item1 = timelineItems[i];
             const item2 = timelineItems[i + 1];

             // Skip if items don't have elements rendered or are same side
             if (!item1.element || !item2.element || item1.isLeft === item2.isLeft) continue;

             // Use offsetTop/Height AFTER initial render in the previous frame
             const item1Top = item1.element.offsetTop;
             const item1Height = item1.element.offsetHeight;
             const item1Bottom = item1Top + item1Height;
             const item2Top = item2.element.offsetTop; // Current position

             const minimumItem2Top = item1Bottom + CARD_VERTICAL_GAP;

             if (item2Top < minimumItem2Top) {
                 item2.element.style.top = `${minimumItem2Top}px`; // Adjust downward
                 // Update the stored targetTop as well if needed, though offsetTop read next loop is better
                 item2.targetTop = minimumItem2Top; // Keep internal state consistent (optional)
                 // console.log(`Overlap Adjust: Pushed item ${i + 1} down to ${minimumItem2Top.toFixed(0)}px`);
             }
         }
     }


    // --- Helper: Draw Connector Lines ---
    function updateConnectorLines() { /* ... (Same as previous version, reads final positions) ... */ }

    // --- Helper: Update Container Height ---
    function updateContainerHeight() {
        if (timelineItems.length === 0 || !timelineItems[0].element) { // Check if elements exist
            timelineContainer.style.height = '100vh'; return;
        }
        let maxHeight = 0;
        timelineItems.forEach(itemInfo => {
             if (!itemInfo.element) return; // Skip if element somehow not rendered
            // Use final calculated position (offsetTop) + rendered height
            const itemBottom = itemInfo.element.offsetTop + itemInfo.element.offsetHeight;
            if (itemBottom > maxHeight) maxHeight = itemBottom;
        });
        const finalHeight = maxHeight + BASE_ITEM_OFFSET * 1.5; // Add bottom padding
        timelineContainer.style.height = `${finalHeight}px`;
        calculatedTimelineHeight = finalHeight;
         // console.log(`Final container height set to: ${finalHeight}px`);
    }

    // --- Helper: Progress Bar Setup ---
    function setupProgressBar() { /* ... (Same as before) ... */ }

    // --- Scroll Handler: Update Progress Bar ---
    function updateProgressBarOnScroll() { /* ... (Same as before - uses calculatedTimelineHeight) ... */ }

    // --- Throttled Scroll Listener ---
    let isThrottled = false;
    function throttledScrollHandler() { /* ... */ }
    function addScrollListener() { /* ... */ }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
