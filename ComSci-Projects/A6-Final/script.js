// File Location: Playground/ComSci-Projects/A6-Final/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');

    // --- Configuration ---
    const PX_PER_DAY = 1.5; // Pixels vertical space per day difference (TWEAK THIS!)
    const BASE_ITEM_OFFSET = 50; // Initial top offset for the first item
    const CARD_HEIGHT_ESTIMATE = 200; // ESTIMATE of card height + some buffer for total height calc
    const MIN_SPACING_PX = 40; // Min vertical space between cards when dates invalid/overlapping
    // const CARD_VERTICAL_GAP = 25; // Used by overlap check

    // --- State Variables ---
    let progressBarElement, progressBarTextElement, progressBarIndicatorElement, progressBarPercentageElement;
    let timelineItems = []; // DOM element references
    let sortedProjects = []; // Data + date objects
    let timelineStartDate, timelineEndDate, timelineDurationDays;
    let calculatedTimelineHeight = 0; // Will be set after positioning
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

            renderTimelineItems(); // Renders items and applies initial 'top' style

            // Delay adjustments slightly to ensure browser has calculated initial layout
            requestAnimationFrame(() => {
                adjustForOverlaps();      // Fine-tune vertical positions
                updateConnectorLines();   // Draw connectors based on final positions
                updateContainerHeight();  // Set container height AFTER adjustments
                setupProgressBar();       // Setup bar AFTER container height is known
                addScrollListener();
                requestAnimationFrame(updateProgressBarOnScroll); // Initial update
            });

        } catch (error) {
            console.error('Error fetching or displaying projects:', error);
            displayErrorMessage(`Error loading projects: ${error.message}.`);
        }
    }

    // --- Helper: Display Error ---
    function displayErrorMessage(message) { /* ... (same as before) ... */ }

    // --- Helper: Process & Sort Data ---
    function processAndSortProjects(projects) {
        // --- Date Processing ---
         const projectsWithDates = projects
            .map(p => ({ ...p, dateObj: p.date ? new Date(p.date) : null }))
            .map(p => ({ ...p, isValidDate: p.dateObj && !isNaN(p.dateObj.getTime()) }));

        const validDateProjects = projectsWithDates.filter(p => p.isValidDate);
        if (validDateProjects.length === 0) {
            timelineStartDate = null; timelineEndDate = null; timelineDurationDays = 0;
            sortedProjects = [...projectsWithDates.filter(p => !p.isValidDate)]; // Keep invalid only
            return;
        }
        validDateProjects.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()); // Oldest first

        // --- Calculate Bounds ---
        timelineStartDate = validDateProjects[0].dateObj;
        timelineEndDate = validDateProjects[validDateProjects.length - 1].dateObj;
        const durationMs = timelineEndDate.getTime() - timelineStartDate.getTime();
        timelineDurationDays = Math.max(1, durationMs / MS_PER_DAY); // Ensure min 1 day

        // --- Estimate Initial Container Height ---
        // This is an initial estimate, final height set after overlap adjustments
        calculatedTimelineHeight = BASE_ITEM_OFFSET + (timelineDurationDays * PX_PER_DAY) + CARD_HEIGHT_ESTIMATE * 1.5; // Add more buffer

        sortedProjects = [...validDateProjects, ...projectsWithDates.filter(p => !p.isValidDate)];
    }

    // --- Helper: Render Items (Initial Time-Based Placement) ---
    function renderTimelineItems() {
        timelineItems = [];
        timelineContainer.style.position = 'relative'; // Ensure context
        // Set an initial estimated height, will be updated later
        timelineContainer.style.minHeight = `${calculatedTimelineHeight}px`;

        let lastValidTopPosition = BASE_ITEM_OFFSET; // Track where the last valid item was placed

        sortedProjects.forEach((project, index) => {
            const isLeft = index % 2 === 0;
            const timelineItem = document.createElement('div');
            timelineItem.classList.add('timeline-item', isLeft ? 'timeline-item-left' : 'timeline-item-right');
            timelineItem.dataset.identifier = project.isValidDate ? project.dateObj.toISOString() : `item-invalid-${index}`;

            // --- Calculate Absolute Vertical Position ---
            let verticalPosition = 0; // Initialize

            if (project.isValidDate) {
                const timeDiffMs = project.dateObj.getTime() - timelineStartDate.getTime();
                const timeDiffDays = Math.max(0, timeDiffMs / MS_PER_DAY);
                verticalPosition = BASE_ITEM_OFFSET + (timeDiffDays * PX_PER_DAY);
                lastValidTopPosition = verticalPosition; // Update tracker
            } else {
                 // Place invalid items below the last known valid position + minimum gap
                 verticalPosition = lastValidTopPosition + MIN_SPACING_PX;
                 // Increment lastValidTopPosition APPROXIMATELY for subsequent invalid items
                 lastValidTopPosition = verticalPosition;
            }

            // --- Apply Styles ---
            timelineItem.style.position = 'absolute';
            timelineItem.style.top = `${verticalPosition}px`;
            timelineItem.style.left = isLeft ? '0' : '50%';
             // Width needs to allow content to fit within its half
             timelineItem.style.width = '50%';


            // --- Format Date, Get Image/Category (same as before) ---
            let displayDate = 'Date N/A';
            if (project.isValidDate) { /* ... format date ... */ }
            const firstImage = project.images?.[0];
            const imagePath = firstImage ? `assets/${firstImage}` : '';
            const category = project.tags?.[0]?.toUpperCase() ?? '';

            // --- Generate HTML with SVG Placeholder ---
            timelineItem.innerHTML = `
                <div class="timeline-marker"></div>
                <svg class="connector-line" preserveAspectRatio="none"> <path d="" fill="none" /> </svg>
                <div class="timeline-card">
                    ${imagePath ? `<div class="card-image-container"><img src="${imagePath}" alt="${project.title || 'Project'}" loading="lazy"></div>` : '<div class="card-image-container"></div>'}
                    <div class="card-content">
                         <div class="card-header">
                            <span class="card-date">${displayDate}</span>
                            ${category ? `<span class="separator">-</span><span class="card-category">${category}</span>` : ''}
                        </div>
                        <h3 class="card-title">${project.title || 'Untitled'}</h3>
                        <p class="card-description">${project.description || '...'}</p>
                        ${project.link ? `<p class="card-link"><a href="${project.link}" target="_blank">View</a></p>` : ''}
                    </div>
                </div>`;
            timelineContainer.appendChild(timelineItem);
            timelineItems.push(timelineItem);
        });
    }

     // --- Helper: Adjust for Overlaps ---
     // Add the missing constant declaration here or globally at the top
     const CARD_VERTICAL_GAP = 25; // Ensure this is defined
     function adjustForOverlaps() {
         if (timelineItems.length < 2) return;

         // Use a copy because we modify `top` which affects subsequent offsetTop reads
         const itemData = timelineItems.map(item => ({
             element: item,
             isLeft: item.classList.contains('timeline-item-left'),
             initialTop: item.offsetTop, // Read initial position
             height: item.offsetHeight
         }));

         // Iterate and adjust 'top' style directly
         for (let i = 0; i < itemData.length - 1; i++) {
             const item1 = itemData[i];
             const item2 = itemData[i + 1];

             // Only check adjacent items on opposite sides
             if (item1.isLeft === item2.isLeft) continue;

             const item1Bottom = item1.element.offsetTop + item1.height; // Use current top + height
             const item2Top = item2.element.offsetTop; // Use current top

             if (item1Bottom + CARD_VERTICAL_GAP > item2Top) {
                 const newTop = item1Bottom + CARD_VERTICAL_GAP;
                 item2.element.style.top = `${newTop}px`; // Directly modify the style
                  // console.log(`Adjusted item ${i+1} top to ${newTop}`);
             }
         }
     }


    // --- Helper: Draw Connector Lines (SVG Paths) ---
    function updateConnectorLines() { /* ... (same as previous version, should work with adjusted 'top' values) ... */ }

    // --- Helper: Update Container Height After Adjustments ---
    function updateContainerHeight() {
        if (timelineItems.length === 0) {
            timelineContainer.style.height = '100vh'; return;
        }
        let maxHeight = 0;
        timelineItems.forEach(item => {
            // Use offsetTop (relative to container) + offsetHeight for actual bottom edge
            const itemBottom = item.offsetTop + item.offsetHeight;
            if (itemBottom > maxHeight) maxHeight = itemBottom;
        });
        // Set container height based on the lowest item's bottom edge + padding
        const finalHeight = maxHeight + BASE_ITEM_OFFSET; // Add bottom padding
        timelineContainer.style.height = `${finalHeight}px`;
        calculatedTimelineHeight = finalHeight; // Update for progress bar calc
        // console.log(`Final container height set to: ${finalHeight}px`); // Debugging
    }


    // --- Helper: Progress Bar Setup ---
    function setupProgressBar() { /* ... (same as before) ... */ }

    // --- Scroll Handler: Update Progress Bar ---
    function updateProgressBarOnScroll() { /* ... (same as before - should use updated calculatedTimelineHeight) ... */ }

    // --- Throttled Scroll Listener ---
    let isThrottled = false;
    function throttledScrollHandler() { /* ... */ }
    function addScrollListener() { /* ... */ }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
