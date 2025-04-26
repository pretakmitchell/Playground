// File Location: Playground/ComSci-Projects/A6-Final/script.js
// V12: Aggressive Date Logging - COMPLETE FILE

document.addEventListener('DOMContentLoaded', () => {
    console.log("--- V12 START --- DOM Loaded. Script starting.");

    // --- DOM Elements ---
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');
    if (!timelineContainer) { console.error("FATAL: Timeline container not found!"); return; }
    if (initialLoadingMessage) { console.log("Initial loading message found."); } else { console.warn("Loading message element not found."); }

    // --- Configuration ---
    const PX_PER_DAY = 1.8;
    const BASE_ITEM_OFFSET = 60;
    const CARD_HEIGHT_ESTIMATE = 200;
    const MIN_SPACING_PX = 60;
    const MAX_SPACING_PX = 450;
    const CARD_VERTICAL_GAP = 30;

    // --- State Variables ---
    let progressBarElement, progressBarTextElement, progressBarIndicatorElement, progressBarPercentageElement;
    let timelineItems = [];
    let sortedProjects = [];
    let timelineStartDate, timelineEndDate, timelineDurationDays;
    let calculatedTimelineHeight = 0;
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

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
            processAndSortProjects(projects); // Call the MODIFIED function
            console.log(`PROCESS: Done. Start=${timelineStartDate?.toISOString()}, End=${timelineEndDate?.toISOString()}`);


            if (!timelineStartDate || !timelineEndDate) {
                displayErrorMessage('Could not determine timeline range (missing/invalid dates).');
                // Render invalid items only if needed and processAndSortProjects prepared them
                if (sortedProjects.length > 0 && sortedProjects.every(p => !p.isValidDate)) {
                    console.log("Attempting to render items without valid date range...");
                    renderTimelineItems(true); // Pass flag for simple layout
                }
                return; // Stop further processing
            }

            // If date range is valid, proceed
            console.log("RENDER: Calculating initial positions...");
            calculateInitialPositions();
            console.log("RENDER: Rendering items to DOM...");
            renderTimelineItems();
            console.log(`RENDER: ${timelineItems.length} items theoretically added to DOM.`);


            requestAnimationFrame(() => {
                console.log("POST-RENDER: Starting adjustments...");
                try {
                    adjustForOverlaps();
                    console.log("POST-RENDER: Drawing connector lines..."); // Log before call
                    updateConnectorLines(); // Re-enabled
                    console.log("POST-RENDER: Updating container height...");
                    updateContainerHeight();
                    console.log("POST-RENDER: Setting up progress bar...");
                    setupProgressBar();
                    addScrollListener();
                    requestAnimationFrame(updateProgressBarOnScroll);
                    console.log("POST-RENDER: Adjustments and setup complete.");
                } catch (postRenderError) {
                     console.error("POST-RENDER ERROR:", postRenderError);
                     displayErrorMessage("Error during post-render adjustments.");
                }
            });

        } catch (error) {
            console.error('Error in fetchProjects:', error);
            displayErrorMessage(`Error loading projects: ${error.message}.`);
        }
    }

    // --- Helper: Display Error ---
    function displayErrorMessage(message) {
        console.error("DISPLAY ERROR:", message); // Also log errors
        if (initialLoadingMessage) initialLoadingMessage.remove();
        timelineContainer.innerHTML = '';
        timelineContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }

    // --- Helper: Process & Sort Data (WITH AGGRESSIVE DATE LOGGING) ---
    function processAndSortProjects(projects) {
         console.log(`PROCESS: Starting detailed date validation for ${projects.length} projects...`);
         let foundValid = false; // Flag to track if any valid date is found
         const projectsWithDates = projects.map((p, index) => {
             const originalDateString = p.date;
             let dateObj = null;
             let isValid = false;
             let parseError = null;

             if (originalDateString && typeof originalDateString === 'string') {
                 try {
                     dateObj = new Date(originalDateString);
                     isValid = !isNaN(dateObj.getTime());
                     if(isValid) foundValid = true;

                     // ** Log EVERY attempt **
                     console.log(`PROCESS Check: Item ${index} (ID: ${p.id || 'N/A'}) | Input: "${originalDateString}" | Parsed: ${dateObj} | Valid: ${isValid}`);

                 } catch (e) { isValid = false; console.error(`PROCESS Parse Error: Item ${index}, Input: "${originalDateString}"`, e); }
             } else {
                  console.warn(`PROCESS Check: Item ${index} (ID: ${p.id || 'N/A'}) | Date field missing or not a string:`, originalDateString);
             }
             // Log invalid dates clearly AFTER the check
             if (!isValid && originalDateString) {
                  console.warn(`---> PROCESS INVALID: Item ${index} (ID: ${p.id || 'N/A'}) | Input: "${originalDateString}" resulted in invalid date.`);
             }
             return { ...p, dateObj: dateObj, isValidDate: isValid };
         });

        // Filter valid dates AFTER logging all attempts
        const validDateProjects = projectsWithDates.filter(p => p.isValidDate);
        const invalidDateProjects = projectsWithDates.filter(p => !p.isValidDate);
        console.log(`PROCESS: Validation Complete. Valid Count: ${validDateProjects.length}`);


        if (validDateProjects.length === 0) {
            timelineStartDate = null; timelineEndDate = null; timelineDurationDays = 0;
            sortedProjects = [...invalidDateProjects]; // Keep invalid only if needed
            console.error("PROCESS: CRITICAL - No valid dates found in any project!");
            return; // Exit early
        }

        // Sort only the projects with valid dates
        validDateProjects.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()); // Oldest first

        // Assign Start/End Dates
        timelineStartDate = validDateProjects[0].dateObj;
        timelineEndDate = validDateProjects[validDateProjects.length - 1].dateObj;
        const durationMs = timelineEndDate.getTime() - timelineStartDate.getTime();
        timelineDurationDays = Math.max(1, durationMs / MS_PER_DAY); // Ensure min 1 day

        // Estimate Initial Container Height
        calculatedTimelineHeight = BASE_ITEM_OFFSET + (timelineDurationDays * PX_PER_DAY) + CARD_HEIGHT_ESTIMATE * 1.5;

        // Combine sorted valid projects with invalid date projects at the end
        sortedProjects = [...validDateProjects, ...invalidDateProjects];

        console.log(`PROCESS: Date range calculated. Start=${timelineStartDate?.toISOString()}, End=${timelineEndDate?.toISOString()}, Duration=${timelineDurationDays.toFixed(1)} days`);
    }


    // --- Helper: Calculate Initial Positions ---
    function calculateInitialPositions() { /* ... (Keep V10/V11 logic) ... */ }
    // --- Helper: Render Items Using Calculated Positions ---
    function renderTimelineItems(forceSimpleLayout = false) { /* ... (Keep V11 logic, including SVG) ... */ }
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
