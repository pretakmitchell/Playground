// File Location: Playground/ComSci-Projects/A6-Final/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');

    // --- Configuration ---
    const PX_PER_DAY = 1.5; // Pixels vertical space per day difference (TWEAK THIS!)
    const BASE_ITEM_OFFSET = 50; // Initial top offset for the first item
    const CARD_HEIGHT_ESTIMATE = 200; // Approx height for total height calc
    const CARD_VERTICAL_GAP = 30; // ** INCREASED GAP ** Min vertical pixels between cards AFTER adjustment

    // --- State Variables ---
    let progressBarElement, progressBarTextElement, progressBarIndicatorElement, progressBarPercentageElement;
    let timelineItems = []; // DOM element references
    let sortedProjects = []; // Data + date objects
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
                // Decide if you want to render invalid date items even without a range
                // renderTimelineItems(true); // Pass a flag indicating no time-based positioning
                return;
            }

            renderTimelineItems(); // Initial render based on time

            requestAnimationFrame(() => {
                // Adjustments need calculated layout, hence rAF
                adjustForOverlaps();
                updateConnectorLines();
                updateContainerHeight(); // Final height based on adjusted positions
                setupProgressBar();
                addScrollListener();
                requestAnimationFrame(updateProgressBarOnScroll);
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
        // ... (same logic as before: validate, sort valid, set bounds) ...
         const projectsWithDates = projects
            .map(p => ({ ...p, dateObj: p.date ? new Date(p.date) : null }))
            .map(p => ({ ...p, isValidDate: p.dateObj && !isNaN(p.dateObj.getTime()) }));
        const validDateProjects = projectsWithDates.filter(p => p.isValidDate);
        if (validDateProjects.length === 0) { /* ... handle no valid dates ... */ return; }
        validDateProjects.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
        timelineStartDate = validDateProjects[0].dateObj;
        timelineEndDate = validDateProjects[validDateProjects.length - 1].dateObj;
        const durationMs = timelineEndDate.getTime() - timelineStartDate.getTime();
        timelineDurationDays = Math.max(1, durationMs / MS_PER_DAY);
        calculatedTimelineHeight = BASE_ITEM_OFFSET + (timelineDurationDays * PX_PER_DAY) + CARD_HEIGHT_ESTIMATE * 1.5;
        sortedProjects = [...validDateProjects, ...projectsWithDates.filter(p => !p.isValidDate)];
    }

    // --- Helper: Render Items (Initial Time-Based Placement) ---
    function renderTimelineItems() {
        timelineItems = [];
        timelineContainer.style.position = 'relative';
        timelineContainer.style.minHeight = `${calculatedTimelineHeight}px`; // Initial estimate

        let lastCalculatedBottom = 0; // Track bottom edge for invalid items

        sortedProjects.forEach((project, index) => {
            const isLeft = index % 2 === 0;
            const timelineItem = document.createElement('div');
            timelineItem.classList.add('timeline-item', isLeft ? 'timeline-item-left' : 'timeline-item-right');
            timelineItem.dataset.identifier = project.isValidDate ? project.dateObj.toISOString() : `item-invalid-${index}`;

            // --- Calculate Initial Vertical Position Based on Time ---
            let verticalPosition = 0;
            if (project.isValidDate) {
                const timeDiffMs = project.dateObj.getTime() - timelineStartDate.getTime();
                const timeDiffDays = Math.max(0, timeDiffMs / MS_PER_DAY);
                verticalPosition = BASE_ITEM_OFFSET + (timeDiffDays * PX_PER_DAY);
            } else {
                 // Place invalid items below the theoretical position of the last *rendered* item
                 // Note: Overlap check will fix this if it collides
                 verticalPosition = lastCalculatedBottom + CARD_VERTICAL_GAP; // Place below last known bottom + gap
            }

            // --- Apply Initial Styles ---
            timelineItem.style.position = 'absolute';
            timelineItem.style.top = `${verticalPosition}px`;
            timelineItem.style.left = isLeft ? '0' : '50%';
            timelineItem.style.width = '50%';

            // --- Generate HTML ---
            // ... (Same HTML generation as before, using project data) ...
             let displayDate = 'Date N/A';
            if (project.isValidDate) { /* ... format date ... */ }
            const firstImage = project.images?.[0];
            const imagePath = firstImage ? `assets/${firstImage}` : '';
            const category = project.tags?.[0]?.toUpperCase() ?? '';
            timelineItem.innerHTML = `...`; // Same innerHTML structure

            timelineContainer.appendChild(timelineItem);
            timelineItems.push(timelineItem); // Store for overlap check

            // Update tracker for next invalid item placement (use estimate for now)
            lastCalculatedBottom = verticalPosition + CARD_HEIGHT_ESTIMATE;
        });
    }

    // --- Helper: Adjust for Overlaps (Refined Logic) ---
    function adjustForOverlaps() {
        if (timelineItems.length < 2) return;

        // Single pass adjustment - might need multiple passes for complex overlaps
        for (let i = 0; i < timelineItems.length - 1; i++) {
            const item1 = timelineItems[i];
            const item2 = timelineItems[i + 1];

            // Only check adjacent items on opposite sides
            if (item1.classList.contains('timeline-item-left') === item2.classList.contains('timeline-item-left')) {
                continue;
            }

            // Get current vertical positions AFTER initial render/potential previous adjustments
            const item1Top = item1.offsetTop;
            const item1Height = item1.offsetHeight;
            const item1Bottom = item1Top + item1Height;
            const item2Top = item2.offsetTop; // Current top position of item 2

            // Calculate the MINIMUM allowed top position for item 2 based on item 1
            const minimumItem2Top = item1Bottom + CARD_VERTICAL_GAP;

            // If item 2's current position is higher than the minimum allowed, push it down
            if (item2Top < minimumItem2Top) {
                item2.style.top = `${minimumItem2Top}px`;
                // console.log(`Overlap Adjust: Pushed item ${i + 1} down to ${minimumItem2Top.toFixed(0)}px`);
            }
        }
    }


    // --- Helper: Draw Connector Lines (SVG Paths) ---
    function updateConnectorLines() { /* ... (Same as previous version) ... */ }

    // --- Helper: Update Container Height After Adjustments ---
    function updateContainerHeight() { /* ... (Same as previous version - finds max bottom edge) ... */ }

    // --- Helper: Progress Bar Setup ---
    function setupProgressBar() { /* ... (Same as previous version) ... */ }

    // --- Scroll Handler: Update Progress Bar ---
    function updateProgressBarOnScroll() { /* ... (Same as previous version - uses calculatedTimelineHeight) ... */ }

    // --- Throttled Scroll Listener ---
    let isThrottled = false;
    function throttledScrollHandler() { /* ... */ }
    function addScrollListener() { /* ... */ }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
