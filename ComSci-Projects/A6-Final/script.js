// File Location: Playground/ComSci-Projects/A6-Final/script.js
// REVISED: Focus on robust time-based positioning and overlap logic

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements & Config (Keep previous) ---
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');
    const PX_PER_DAY = 1.5; // << TUNE THIS VALUE
    const BASE_ITEM_OFFSET = 50;
    const CARD_HEIGHT_ESTIMATE = 200; // For initial height guess
    const CARD_VERTICAL_GAP = 30; // Min gap after overlap adjustment

    // --- State Variables (Keep previous) ---
    let progressBarElement, progressBarTextElement, progressBarIndicatorElement, progressBarPercentageElement;
    let timelineItems = []; // DOM elements + calculated data
    let sortedProjects = []; // Original data + date objects
    let timelineStartDate, timelineEndDate, timelineDurationDays;
    let calculatedTimelineHeight = 0;
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // --- Main Function ---
    async function fetchProjects() {
        try {
            // ... (fetch logic same as before) ...
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

            requestAnimationFrame(() => { // Allow render before adjustments
                adjustForOverlaps();
                updateConnectorLines();
                updateContainerHeight(); // Crucial: Update height AFTER adjustments
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
    function displayErrorMessage(message) { /* ... */ }

    // --- Helper: Process & Sort Data ---
    function processAndSortProjects(projects) {
        // ... (same validation and sorting logic) ...
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
        // Initial height estimate - will be refined
        calculatedTimelineHeight = BASE_ITEM_OFFSET + (timelineDurationDays * PX_PER_DAY) + CARD_HEIGHT_ESTIMATE * 1.5;
        sortedProjects = [...validDateProjects, ...projectsWithDates.filter(p => !p.isValidDate)];
    }

    // --- Helper: Render Items (Initial Time-Based Placement) ---
    function renderTimelineItems() {
        timelineItems = []; // Clear previous item data
        timelineContainer.style.position = 'relative';
        timelineContainer.style.minHeight = `${calculatedTimelineHeight}px`; // Set initial estimated height

        let lastCalculatedValidTop = BASE_ITEM_OFFSET; // Track the 'top' of the last item *with a valid date*

        sortedProjects.forEach((project, index) => {
            const isLeft = index % 2 === 0;
            const timelineItemElement = document.createElement('div'); // Changed variable name for clarity
            timelineItemElement.classList.add('timeline-item', isLeft ? 'timeline-item-left' : 'timeline-item-right');
            const identifier = project.isValidDate ? project.dateObj.toISOString() : `item-invalid-${index}`;
            timelineItemElement.dataset.identifier = identifier;

            // --- Calculate INITIAL Vertical Position ---
            let verticalPosition = 0;
            if (project.isValidDate) {
                const timeDiffMs = project.dateObj.getTime() - timelineStartDate.getTime();
                const timeDiffDays = Math.max(0, timeDiffMs / MS_PER_DAY);
                verticalPosition = BASE_ITEM_OFFSET + (timeDiffDays * PX_PER_DAY);
                lastCalculatedValidTop = verticalPosition; // Update based on valid date calculation
                 console.log(`Item ${index} (${project.date}): Calculated Top = ${verticalPosition.toFixed(1)}px`); // DEBUG
            } else {
                 // Place invalid items below the last calculated valid position + gap
                 verticalPosition = lastCalculatedValidTop + CARD_VERTICAL_GAP + CARD_HEIGHT_ESTIMATE; // Position approx below last valid item
                 console.log(`Item ${index} (Invalid Date): Placing approx at ${verticalPosition.toFixed(1)}px`); // DEBUG
                 lastCalculatedValidTop = verticalPosition; // Update floor for subsequent invalid items
            }

            // --- Apply Styles ---
            timelineItemElement.style.position = 'absolute';
            timelineItemElement.style.top = `${verticalPosition}px`;
            timelineItemElement.style.left = isLeft ? '0' : '50%';
            timelineItemElement.style.width = '50%';

            // --- Generate HTML ---
             let displayDate = 'Date N/A'; if (project.isValidDate) { try { const opts={m:'short',d:'numeric',y:'numeric'}; displayDate = project.dateObj.toLocaleDateString('en-US', opts).toUpperCase();}catch(e){} }
             const imagePath = project.images?.[0] ? `assets/${project.images[0]}` : '';
             const category = project.tags?.[0]?.toUpperCase() ?? '';
             const linkHTML = project.link ? `<p class="card-link"><a href="${project.link}" target="_blank">View</a></p>` : '';
             const imageHTML = imagePath ? `<div class="card-image-container"><img src="${imagePath}" alt="${project.title||'Project'}" loading="lazy"></div>` : '<div class="card-image-container"></div>';
             const categoryHTML = category ? `<span class="separator">-</span><span class="card-category">${category}</span>` : '';
             timelineItemElement.innerHTML = `
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
             timelineContainer.appendChild(timelineItemElement);

             // Store element and its calculated position for overlap check
             timelineItems.push({
                 element: timelineItemElement,
                 isLeft: isLeft,
                 calculatedTop: verticalPosition, // Store the initial calculated position
                 identifier: identifier
             });
        });
    }

    // --- Helper: Adjust for Overlaps (More Careful Adjustment) ---
    function adjustForOverlaps() {
        if (timelineItems.length < 2) return;

        console.log("Starting overlap check..."); // DEBUG

        // Keep track of the bottom edge of the previous item ON THE OPPOSITE SIDE
        let lastLeftBottom = -Infinity;
        let lastRightBottom = -Infinity;

        timelineItems.forEach((currentItemData, index) => {
            const currentElement = currentItemData.element;
            const currentTop = parseFloat(currentElement.style.top); // Read the current 'top' style
            const currentHeight = currentElement.offsetHeight; // Get actual height AFTER render
             if (currentHeight === 0) {
                 console.warn(`Item ${index} has zero height, overlap check might be inaccurate.`);
             }
            const currentBottom = currentTop + currentHeight;

            let requiredMinTop = currentItemData.calculatedTop; // Start with the time-based position

            // Check against the last item on the OPPOSITE side
            if (currentItemData.isLeft) { // Current is Left, check against last Right
                requiredMinTop = Math.max(requiredMinTop, lastRightBottom + CARD_VERTICAL_GAP);
            } else { // Current is Right, check against last Left
                requiredMinTop = Math.max(requiredMinTop, lastLeftBottom + CARD_VERTICAL_GAP);
            }

            // If the required minimum position is greater than the current position, adjust
            if (requiredMinTop > currentTop + 0.1) { // Add tolerance for float precision
                // console.log(`Overlap Adjust: Item ${index} (${currentItemData.identifier}) moved from ${currentTop.toFixed(1)} to ${requiredMinTop.toFixed(1)}`); // DEBUG
                currentElement.style.top = `${requiredMinTop}px`;
                // Update the actual bottom edge based on the new position
                currentItemData.currentBottom = requiredMinTop + currentHeight;
            } else {
                 currentItemData.currentBottom = currentBottom; // Store the bottom edge
                 // console.log(`Overlap Adjust: Item ${index} (${currentItemData.identifier}) stayed at ${currentTop.toFixed(1)}`); // DEBUG
            }


            // Update the tracker for the current side
            if (currentItemData.isLeft) {
                lastLeftBottom = currentItemData.currentBottom;
            } else {
                lastRightBottom = currentItemData.currentBottom;
            }
        });
         console.log("Overlap check finished."); // DEBUG
    }


    // --- Helper: Draw Connector Lines ---
    function updateConnectorLines() { /* ... (same logic, uses final positions) ... */ }

    // --- Helper: Update Container Height ---
    function updateContainerHeight() {
        if (timelineItems.length === 0) { /* ... */ return; }
        let maxHeight = 0;
        timelineItems.forEach(itemData => { // Iterate through stored data
            const itemBottom = itemData.element.offsetTop + itemData.element.offsetHeight; // Read FINAL position
            if (itemBottom > maxHeight) maxHeight = itemBottom;
        });
        const finalHeight = maxHeight + BASE_ITEM_OFFSET * 1.5; // Add bottom padding
        timelineContainer.style.height = `${finalHeight}px`;
        calculatedTimelineHeight = finalHeight; // Update for progress calc
        console.log(`Final container height set to: ${finalHeight.toFixed(0)}px`); // DEBUG
    }

    // --- Helper: Progress Bar Setup ---
    function setupProgressBar() { /* ... (same setup logic) ... */ }

    // --- Scroll Handler: Update Progress Bar ---
    function updateProgressBarOnScroll() { /* ... (same interpolation logic, uses calculatedTimelineHeight) ... */ }

    // --- Throttled Scroll Listener ---
    let isThrottled = false;
    function throttledScrollHandler() { /* ... */ }
    function addScrollListener() { /* ... */ }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
