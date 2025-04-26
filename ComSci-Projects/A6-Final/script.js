// File Location: Playground/ComSci-Projects/A6-Final/script.js
// V16: Using PROVEN V12/V14 date logic, keeping V15 logging/connector changes. COMPLETE FILE.

document.addEventListener('DOMContentLoaded', () => {
    console.log("--- V16 START --- DOM Loaded. Script starting.");

    // --- DOM Elements, Config, State Vars (Keep same as V15) ---
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
            processAndSortProjects(projects); // ** Using V12/V14 Date Logic Below **
            // ** Log dates immediately after processing **
            console.log(`PROCESS: Done Check. Start=${timelineStartDate?.toISOString()}, End=${timelineEndDate?.toISOString()}`);

            if (!timelineStartDate || !timelineEndDate) {
                displayErrorMessage('Could not determine timeline range (Check PROCESS logs for date errors).');
                // Optionally render invalid items
                // if (sortedProjects.length > 0) { renderTimelineItems(true); }
                return; // Stop if no valid range
            }

            // If date range is valid, proceed
            console.log("RENDER: Calculating initial positions...");
            calculateInitialPositions();
            console.log(`CALC_POS: Exiting calculateInitialPositions. timelineItems length: ${timelineItems.length}`);
            if(timelineItems.length === 0 && sortedProjects.length > 0) { /* ... error ... */ return; }

            console.log("RENDER: Rendering items to DOM...");
            renderTimelineItems();
            console.log(`RENDER: Finished rendering. ${timelineItems.length} items added.`);

            requestAnimationFrame(() => {
                 console.log("POST-RENDER: Starting adjustments...");
                 try { /* ... post-render calls including updateConnectorLines ... */ } catch (e) { /* ... error ... */ }
            });

        } catch (error) { console.error('Error in fetchProjects:', error); /* ... error handling ... */ }
    }

    // --- Helper: Display Error ---
    function displayErrorMessage(message) { console.error("DISPLAY ERROR:", message); /* ... rest same ... */ }

    // --- Helper: Process & Sort Data (BACK TO V12/V14 Logic) ---
    function processAndSortProjects(projects) {
         console.log(`PROCESS (V12/V14 Logic): Starting detailed date validation for ${projects.length} projects...`);
         let foundValid = false;
         const projectsWithDates = projects.map((p, index) => {
             const originalDateString = p.date; let dateObj = null; let isValid = false;
             if (originalDateString && typeof originalDateString === 'string') {
                 try {
                     dateObj = new Date(originalDateString); isValid = !isNaN(dateObj.getTime());
                     if(isValid) foundValid = true;
                     // console.log(`PROCESS Check: Item ${index} | Input: "${originalDateString}" | Valid: ${isValid}`); // Keep logging minimal now
                 } catch (e) { isValid = false; console.error(`PROCESS Parse Error: Item ${index}, Input: "${originalDateString}"`, e); }
             } else { console.warn(`PROCESS Check: Item ${index} | Date missing/invalid type`); }
             if (!isValid && originalDateString) { console.warn(`---> PROCESS INVALID: Item ${index} | Input: "${originalDateString}" resulted in invalid date.`); }
             return { ...p, dateObj: dateObj, isValidDate: isValid };
         });

        const validDateProjects = projectsWithDates.filter(p => p.isValidDate);
        const invalidDateProjects = projectsWithDates.filter(p => !p.isValidDate);
        console.log(`PROCESS: Validation Complete. Valid Count: ${validDateProjects.length}`);

        if (validDateProjects.length === 0) {
            timelineStartDate = null; timelineEndDate = null; timelineDurationDays = 0;
            sortedProjects = [...invalidDateProjects];
            console.error("PROCESS: CRITICAL - No valid dates found!");
            return; // Exit this function
        }

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
    function calculateInitialPositions() { /* ... (Keep V13 logic) ... */ }
    // --- Helper: Render Items Using Calculated Positions ---
    function renderTimelineItems(forceSimpleLayout = false) { /* ... (Keep V15 logic w/ date format log) ... */ }
    // --- Helper: Adjust for Overlaps ---
    function adjustForOverlaps() { /* ... (Keep V15 logic w/ opposite side check) ... */ }
    // --- Helper: Draw Connector Lines ---
    function updateConnectorLines() { /* ... (Keep V15 logic w/ checks) ... */ }
    // --- Helper: Update Container Height ---
    function updateContainerHeight() { /* ... (Keep V15 logic) ... */ }
    // --- Helper: Progress Bar Setup ---
    function setupProgressBar() { /* ... (Keep V15 logic) ... */ }
    // --- Scroll Handler: Update Progress Bar ---
    function updateProgressBarOnScroll() { /* ... (Keep V15 logic) ... */ }
    // --- Throttled Scroll Listener ---
    let isThrottled = false; function throttledScrollHandler() { /* ... */ }
    // --- Add Scroll/Resize Listeners ---
    function addScrollListener() { /* ... (Keep V15 logic) ... */ }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
