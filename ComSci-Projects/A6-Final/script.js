// File Location: Playground/ComSci-Projects/A6-Final/script.js
// V10 REVERT: Working Time-Based Spacing, Broken Progress Bar, No Connectors

document.addEventListener('DOMContentLoaded', () => {
    console.log("--- V10 REVERT START --- DOM Loaded. Script starting.");

    // --- DOM Elements ---
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');
    if (!timelineContainer) { console.error("FATAL: Timeline container not found!"); return; }

    // --- Configuration ---
    const PX_PER_DAY = 1.8;
    const BASE_ITEM_OFFSET = 60;
    const CARD_HEIGHT_ESTIMATE = 200;
    const MIN_SPACING_PX = 60;
    const MAX_SPACING_PX = 450;
    const CARD_VERTICAL_GAP = 30; // Defined, but adjustForOverlaps might be simplified/removed

    // --- State Variables ---
    let progressBarElement, progressBarTextElement, progressBarIndicatorElement, progressBarPercentageElement; // Keep refs
    let timelineItems = []; // Stores { element, targetTop, isLeft, projectData }
    let sortedProjects = [];
    let timelineStartDate, timelineEndDate, timelineDurationDays;
    let calculatedTimelineHeight = 0;
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // --- Main Function ---
    async function fetchProjects() {
        console.log("FETCH: Starting fetch...");
        try {
            const response = await fetch('/api/a6-timeline-projects');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const projects = await response.json();
            console.log(`FETCH: ${projects?.length ?? 0} projects received.`);

            if (initialLoadingMessage) initialLoadingMessage.remove();
            timelineContainer.innerHTML = '';
            if (!projects || !Array.isArray(projects) || projects.length === 0) { /* error */ return; }

            console.log("PROCESS: Starting...");
            processAndSortProjects(projects); // Use the version known to work for dates
            console.log(`PROCESS: Done Check. Start=${timelineStartDate?.toISOString()}, End=${timelineEndDate?.toISOString()}`);

            if (!timelineStartDate || !timelineEndDate) { /* error */ return; }

            console.log("RENDER: Calculating positions...");
            calculateInitialPositions(); // Calculate target tops
            console.log(`CALC_POS: Finished. Items to render: ${timelineItems.length}`);

            if(timelineItems.length === 0 && sortedProjects.length > 0) { /* error */ return; }

            console.log("RENDER: Rendering items...");
            renderTimelineItems(); // Render with calculated tops
            console.log(`RENDER: Finished rendering.`);

            requestAnimationFrame(() => {
                 console.log("POST-RENDER: Updating container height..."); // Only update height
                 updateContainerHeight(); // Set final height based on rendered items
                 console.log("POST-RENDER: Setting up progress bar (likely broken state)...");
                 setupProgressBar(); // Setup bar, knowing it might not update
                 addScrollListener(); // Add listener, knowing handler might fail
                 requestAnimationFrame(updateProgressBarOnScroll); // Initial call (might fail)
                 console.log("POST-RENDER: Minimal post-render setup complete.");
            });

        } catch (error) { console.error('Error in fetchProjects:', error); /* error handling */ }
    }

    // --- Helper: Display Error ---
    function displayErrorMessage(message) { console.error("DISPLAY ERROR:", message); /* ... */ }

    // --- Helper: Process & Sort Data (V12/V14 Logic) ---
     function processAndSortProjects(projects) {
         console.log(`PROCESS (V12/V14 Logic): Starting date validation...`);
         let foundValid = false;
         const projectsWithDates = projects.map((p, index) => { /* ... map and validate dates ... */ return { /* ... */}; });
         const validDateProjects = projectsWithDates.filter(p => p.isValidDate);
         if (validDateProjects.length === 0) { /* ... handle no valid dates ... */ return; }
         validDateProjects.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
         timelineStartDate = validDateProjects[0].dateObj; // Assign start
         timelineEndDate = validDateProjects[validDateProjects.length - 1].dateObj; // Assign end
         console.log(`PROCESS: Dates Assigned. Start=${timelineStartDate?.toISOString()}, End=${timelineEndDate?.toISOString()}`);
         const durationMs = timelineEndDate.getTime() - timelineStartDate.getTime();
         timelineDurationDays = Math.max(1, durationMs / MS_PER_DAY);
         calculatedTimelineHeight = BASE_ITEM_OFFSET + (timelineDurationDays * PX_PER_DAY) + CARD_HEIGHT_ESTIMATE * 1.5;
         sortedProjects = [...validDateProjects, ...projectsWithDates.filter(p => !p.isValidDate)];
         console.log(`PROCESS: Final Calculation Done. Duration=${timelineDurationDays.toFixed(1)} days.`);
    }


    // --- Helper: Calculate Initial Positions ---
    function calculateInitialPositions() {
        console.log(`CALC_POS: Calculating positions for ${sortedProjects.length}...`);
        timelineItems = []; let lastValidTopPosition = BASE_ITEM_OFFSET;
        sortedProjects.forEach((project, index) => {
            const isLeft = index % 2 === 0; let targetTop = 0;
            if (project.isValidDate) {
                const timeDiffMs = project.dateObj.getTime() - timelineStartDate.getTime();
                const timeDiffDays = Math.max(0, timeDiffMs / MS_PER_DAY);
                targetTop = BASE_ITEM_OFFSET + (timeDiffDays * PX_PER_DAY);
                lastValidTopPosition = targetTop;
            } else { targetTop = lastValidTopPosition + MIN_SPACING_PX; lastValidTopPosition = targetTop; }
            timelineItems.push({ projectData: project, targetTop: targetTop, isLeft: isLeft, element: null });
        });
        console.log(`CALC_POS: Finished. ${timelineItems.length} items calculated.`);
    }


    // --- Helper: Render Items (No Connectors, Basic Structure) ---
    function renderTimelineItems(forceSimpleLayout = false) {
        if (!timelineItems || timelineItems.length === 0) { console.error("RENDER: timelineItems empty!"); return; }
        timelineContainer.style.position = 'relative';
        timelineContainer.style.minHeight = `${calculatedTimelineHeight}px`;
        timelineContainer.innerHTML = '';

        console.log(`RENDER: Starting loop for ${timelineItems.length} items...`);
        timelineItems.forEach((itemInfo, index) => {
            if (!itemInfo || !itemInfo.projectData) return;
            const project = itemInfo.projectData; const isLeft = itemInfo.isLeft;
            const timelineItem = document.createElement('div');
            timelineItem.classList.add('timeline-item', isLeft ? 'timeline-item-left' : 'timeline-item-right');
            timelineItem.dataset.identifier = project.isValidDate ? project.dateObj.toISOString() : `item-invalid-${index}`;
            timelineItem.style.position = 'absolute';
            timelineItem.style.top = `${itemInfo.targetTop}px`;
            timelineItem.style.left = isLeft ? '0' : '50%';
            timelineItem.style.width = '50%';
            itemInfo.element = timelineItem;

            let displayDate = 'Date N/A'; if (project.isValidDate) { /* format */ }
            const title = project.title ?? 'Untitled'; const description = project.description ?? '...';
            const imagePath = project.images?.[0] ? `assets/${project.images[0]}` : '';
            const category = project.tags?.[0]?.toUpperCase() ?? ''; const link = project.link ?? null;
            const imageHTML = imagePath ? `<div ...><img src="${imagePath}" ...></div>` : `<div></div>`;
            const catHTML = category ? `<span ...>-</span><span ...>${category}</span>` : '';
            const linkHTML = link ? `<p ...><a href="${link}" ...>View</a></p>` : '';

            try { // Basic HTML WITHOUT SVG connector
                timelineItem.innerHTML = `
                    <div class="timeline-marker"></div>
                    <!-- SVG Connector Removed -->
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

    // --- Helper: Adjust for Overlaps (Keep logic, but maybe less critical now) ---
    function adjustForOverlaps() {
        console.log("ADJUST: Starting overlap check (may not be needed if spacing is primary)...");
        // ... (Keep V11/V14 logic, but note it might not be strictly needed if V10 spacing worked) ...
    }

    // --- Helper: Draw Connector Lines (Keep commented out / disabled) ---
    function updateConnectorLines() { console.log("CONNECTORS: Skipping line update (disabled)."); }

    // --- Helper: Update Container Height ---
    function updateContainerHeight() {
        console.log("HEIGHT: Updating container height...");
         // ... (Keep V11/V14 logic) ...
         if (timelineItems.length === 0 || !timelineItems[0].element) { /* ... */ return; }
         let maxHeight = 0;
         timelineItems.forEach(itemInfo => { /* ... find max bottom ... */ });
         const finalHeight = maxHeight + BASE_ITEM_OFFSET * 1.5;
         timelineContainer.style.height = `${finalHeight}px`;
         calculatedTimelineHeight = finalHeight; // Update global
         console.log(`HEIGHT: Container height set to: ${finalHeight.toFixed(0)}px`);
    }

    // --- Helper: Progress Bar Setup (Keep setup, expect failure) ---
    function setupProgressBar() {
        console.log("PROGRESS: Setting up progress bar (expecting limited function)...");
         /* ... (Keep V11/V14 logic) ... */
         try { /* find/create elements */ } catch(e) { /* error */ }
         if(progressBarTextElement) progressBarTextElement.textContent = 'Timeline'; // Set default
         if(progressBarIndicatorElement) progressBarIndicatorElement.style.width = '0%';
         if(progressBarPercentageElement) progressBarPercentageElement.textContent = '0%';
    }

    // --- Scroll Handler: Update Progress Bar (Keep logic, expect failure) ---
    function updateProgressBarOnScroll() {
        // console.log("SCROLL: Update function called (may not work correctly)...");
         /* ... (Keep V11/V14 logic, but accept it might be stuck at 0) ... */
         if (!progressBarIndicatorElement || !timelineStartDate) { return; } // Basic check
         /* ... rest of calc ... */
    }

    // --- Throttled Scroll Listener ---
    let isThrottled = false; function throttledScrollHandler() { /* ... */ }
    // --- Add Scroll/Resize Listeners ---
    function addScrollListener() { console.log("LISTENERS: Adding..."); /* ... */ console.log("LISTENERS: Added."); }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
