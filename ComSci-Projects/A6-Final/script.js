// File Location: Playground/ComSci-Projects/A6-Final/script.js
// V14: Reverting processAndSortProjects to V12 logic (proven working), keeping V13 fixes elsewhere.

document.addEventListener('DOMContentLoaded', () => {
    console.log("--- V14 START --- DOM Loaded. Script starting.");

    // --- DOM Elements ---
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');
    if (!timelineContainer) { console.error("FATAL: Timeline container not found!"); return; }
    // ... (rest of config, state variables same as V13) ...
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
            const response = await fetch('/api/a6-timeline-projects');
            console.log("FETCH: Response received:", response.status);
            if (!response.ok) { const txt = await response.text(); throw new Error(`HTTP ${response.status}: ${txt}`); }
            const projects = await response.json();
            console.log(`FETCH: ${projects?.length ?? 0} projects received.`);
            if (initialLoadingMessage) initialLoadingMessage.remove();
            timelineContainer.innerHTML = '';
            if (!projects || !Array.isArray(projects)) { throw new Error('Invalid project data received.'); }
            if (projects.length === 0) { displayErrorMessage('No projects found.'); return; }

            console.log("PROCESS: Starting project processing...");
            processAndSortProjects(projects); // ** Using V12 Date Logic **
            // ** Log dates immediately after processing **
            console.log(`PROCESS: Done Check. Start=${timelineStartDate?.toISOString()}, End=${timelineEndDate?.toISOString()}`);

            if (!timelineStartDate || !timelineEndDate) {
                // Use error message from log if range couldn't be determined
                displayErrorMessage('Could not determine timeline range (Check PROCESS logs for date errors).');
                // Optionally render invalid items
                // if (sortedProjects.length > 0) { renderTimelineItems(true); }
                return; // Stop
            }

            // If date range is valid, proceed
            console.log("RENDER: Calculating initial positions...");
            calculateInitialPositions();
            console.log(`CALC_POS: Exiting calculateInitialPositions. timelineItems length: ${timelineItems.length}`); // Log after calc
            if(timelineItems.length === 0 && sortedProjects.length > 0) { // Added check
                 console.error("CRITICAL: Position calculation resulted in zero items.");
                 displayErrorMessage("Internal error calculating positions.");
                 return;
            }

            console.log("RENDER: Rendering items to DOM...");
            renderTimelineItems();
            console.log(`RENDER: Finished rendering. ${timelineItems.length} items theoretically in DOM.`);

            requestAnimationFrame(() => {
                 console.log("POST-RENDER: Starting adjustments...");
                 try {
                     adjustForOverlaps();
                     updateConnectorLines(); // ** Keep Connectors Enabled **
                     updateContainerHeight();
                     setupProgressBar();
                     addScrollListener();
                     requestAnimationFrame(updateProgressBarOnScroll);
                     console.log("POST-RENDER: Adjustments and setup complete.");
                 } catch (postRenderError) { console.error("POST-RENDER ERROR:", postRenderError); /* ... error ... */ }
            });

        } catch (error) { console.error('Error in fetchProjects:', error); /* ... error handling ... */ }
    }

    // --- Helper: Display Error ---
    function displayErrorMessage(message) { /* ... (same as V13) ... */ }

    // --- Helper: Process & Sort Data (REVERTED to V12 successful logic + logs) ---
    function processAndSortProjects(projects) {
         console.log(`PROCESS (V12 Logic): Starting detailed date validation for ${projects.length} projects...`);
         let foundValid = false; // Flag
         const projectsWithDates = projects.map((p, index) => {
             const originalDateString = p.date;
             let dateObj = null; let isValid = false; let parseError = null;
             if (originalDateString && typeof originalDateString === 'string') {
                 try {
                     dateObj = new Date(originalDateString);
                     isValid = !isNaN(dateObj.getTime());
                     if(isValid) foundValid = true;
                     // Keep detailed log per item
                     console.log(`PROCESS Check: Item ${index} (ID: ${p.id || 'N/A'}) | Input: "${originalDateString}" | Parsed: ${dateObj} | Valid: ${isValid}`);
                 } catch (e) { isValid = false; console.error(`PROCESS Parse Error: Item ${index}, Input: "${originalDateString}"`, e); }
             } else { console.warn(`PROCESS Check: Item ${index} (ID: ${p.id || 'N/A'}) | Date field missing/not string:`, originalDateString); }
             if (!isValid && originalDateString) { console.warn(`---> PROCESS INVALID: Item ${index} (ID: ${p.id || 'N/A'}) | Input: "${originalDateString}" resulted in invalid date.`); }
             return { ...p, dateObj: dateObj, isValidDate: isValid };
         });

        const validDateProjects = projectsWithDates.filter(p => p.isValidDate);
        const invalidDateProjects = projectsWithDates.filter(p => !p.isValidDate);
        console.log(`PROCESS: Validation Complete. Valid Count: ${validDateProjects.length}`);

        if (validDateProjects.length === 0) {
            timelineStartDate = null; timelineEndDate = null; timelineDurationDays = 0; // Set explicitly to null
            sortedProjects = [...invalidDateProjects];
            console.error("PROCESS: CRITICAL - No valid dates found in any project!");
            return; // Exit this function
        }

        // Sort valid projects
        validDateProjects.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

        // ** Assign to outer scope variables **
        timelineStartDate = validDateProjects[0].dateObj;
        timelineEndDate = validDateProjects[validDateProjects.length - 1].dateObj;
        // ** Log IMMEDIATELY after assignment **
        console.log(`PROCESS: Assigned Start Date: ${timelineStartDate?.toISOString()}`);
        console.log(`PROCESS: Assigned End Date: ${timelineEndDate?.toISOString()}`);


        const durationMs = timelineEndDate.getTime() - timelineStartDate.getTime();
        timelineDurationDays = Math.max(1, durationMs / MS_PER_DAY);
        calculatedTimelineHeight = BASE_ITEM_OFFSET + (timelineDurationDays * PX_PER_DAY) + CARD_HEIGHT_ESTIMATE * 1.5;
        sortedProjects = [...validDateProjects, ...invalidDateProjects];
        console.log(`PROCESS: Final Calculation. Duration=${timelineDurationDays.toFixed(1)} days. Est Height=${calculatedTimelineHeight.toFixed(0)}px`);
    }


    // --- Helper: Calculate Initial Positions ---
    function calculateInitialPositions() {
        console.log(`CALC_POS: Calculating positions for ${sortedProjects.length} projects...`);
        timelineItems = []; // Reset
        let lastValidTopPosition = BASE_ITEM_OFFSET;
        let itemCountProcessed = 0;
        try {
            sortedProjects.forEach((project, index) => {
                itemCountProcessed++;
                const isLeft = index % 2 === 0;
                let targetTop = 0;
                if (project.isValidDate) { // Use pre-calculated validity
                    const timeDiffMs = project.dateObj.getTime() - timelineStartDate.getTime();
                    const timeDiffDays = Math.max(0, timeDiffMs / MS_PER_DAY);
                    targetTop = BASE_ITEM_OFFSET + (timeDiffDays * PX_PER_DAY);
                    lastValidTopPosition = targetTop;
                } else {
                     targetTop = lastValidTopPosition + MIN_SPACING_PX;
                     lastValidTopPosition = targetTop;
                }
                timelineItems.push({ projectData: project, targetTop: targetTop, isLeft: isLeft, element: null });
            });
        } catch (calcError) { console.error("CALC_POS: Error during calculation loop:", calcError); }
        console.log(`CALC_POS: Finished loop. Processed ${itemCountProcessed} items. timelineItems array has ${timelineItems.length} entries.`);
    }


    // --- Helper: Render Items Using Calculated Positions ---
    function renderTimelineItems(forceSimpleLayout = false) {
        if (!timelineItems || timelineItems.length === 0) { /* ... error ... */ return; }
        timelineContainer.style.position = 'relative';
        timelineContainer.style.minHeight = `${calculatedTimelineHeight}px`;
        timelineContainer.innerHTML = ''; // Clear before render

        console.log(`RENDER: Starting render loop for ${timelineItems.length} items...`);
        timelineItems.forEach((itemInfo, index) => {
            if (!itemInfo || !itemInfo.projectData) { /* ... skip item ... */ return; }
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

            try {
                 timelineItem.innerHTML = `
                    <div class="timeline-marker"></div>
                    <svg class="connector-line" preserveAspectRatio="none"><path d="" fill="none" /></svg> <!-- SVG Included -->
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
    function adjustForOverlaps() { /* ... (Keep V11 logic) ... */ }
    // --- Helper: Draw Connector Lines ---
    function updateConnectorLines() { /* ... (Keep V11 logic) ... */ }
    // --- Helper: Update Container Height ---
    function updateContainerHeight() { /* ... (Keep V11 logic) ... */ }
    // --- Helper: Progress Bar Setup ---
    function setupProgressBar() { /* ... (Keep V11 logic) ... */ }
    // --- Scroll Handler: Update Progress Bar ---
    function updateProgressBarOnScroll() { /* ... (Keep V11 logic) ... */ }
    // --- Throttled Scroll Listener ---
    let isThrottled = false; function throttledScrollHandler() { /* ... */ }
    // --- Add Scroll/Resize Listeners ---
    function addScrollListener() { /* ... (Keep V11 logic) ... */ }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
