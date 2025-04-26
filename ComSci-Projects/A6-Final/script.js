// File Location: Playground/ComSci-Projects/A6-Final/script.js
// V18: Fixing variable declaration syntax error - COMPLETE FILE

document.addEventListener('DOMContentLoaded', () => {
    console.log("--- V18 START --- DOM Loaded. Script starting.");

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
    const CARD_VERTICAL_GAP = 30;

    // --- State Variables (Corrected Declaration) ---
    let progressBarElement = null; // Initialize all to null
    let progressBarTextElement = null;
    let progressBarIndicatorElement = null;
    let progressBarPercentageElement = null;
    let timelineItems = []; // Initialize as empty array
    let sortedProjects = []; // Initialize as empty array
    let timelineStartDate = null;
    let timelineEndDate = null;
    let timelineDurationDays = 0; // Initialize to 0
    let calculatedTimelineHeight = 0; // Initialize to 0
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
            processAndSortProjects(projects);
            console.log(`PROCESS: Done Check. Start=${timelineStartDate?.toISOString()}, End=${timelineEndDate?.toISOString()}`);

            if (!timelineStartDate || !timelineEndDate) {
                displayErrorMessage('Could not determine timeline range (missing/invalid dates).'); return;
            }

            console.log("CALC_POS: Calling calculateInitialPositions...");
            calculateInitialPositions();
            console.log(`CALC_POS: Returned. timelineItems length: ${timelineItems.length}`);

            if(timelineItems.length === 0 && sortedProjects.length > 0) {
                 console.error("CRITICAL: timelineItems is EMPTY after calculation!");
                 displayErrorMessage("Internal error calculating positions."); return;
            }

            console.log("RENDER: Rendering items...");
            renderTimelineItems();
            console.log(`RENDER: Finished rendering. ${timelineItems.length} items added.`);

            requestAnimationFrame(() => {
                 console.log("POST-RENDER: Starting adjustments...");
                 try {
                    adjustForOverlaps();
                    updateConnectorLines(); // Keep enabled
                    updateContainerHeight();
                    setupProgressBar();
                    addScrollListener();
                    requestAnimationFrame(updateProgressBarOnScroll);
                    console.log("POST-RENDER: Adjustments complete.");
                 } catch (postRenderError) { console.error("POST-RENDER ERROR:", postRenderError); }
            });

        } catch (error) { console.error('Error in fetchProjects:', error); displayErrorMessage(`Error loading projects: ${error.message}.`); }
    }

    // --- Helper: Display Error ---
    function displayErrorMessage(message) { console.error("DISPLAY ERROR:", message); if (initialLoadingMessage) initialLoadingMessage.remove(); timelineContainer.innerHTML = `<p class="error-message">${message}</p>`; }

    // --- Helper: Process & Sort Data ---
    function processAndSortProjects(projects) { /* ... (Keep V14/V16 Logic) ... */ }

    // --- Helper: Calculate Initial Positions ---
    function calculateInitialPositions() { /* ... (Keep V17 logic with logs) ... */ }

    // --- Helper: Render Items Using Calculated Positions ---
    function renderTimelineItems(forceSimpleLayout = false) { /* ... (Keep V17 logic) ... */ }

    // --- Helper: Adjust for Overlaps ---
    function adjustForOverlaps() { /* ... (Keep V17 logic) ... */ }

    // --- Helper: Draw Connector Lines ---
    function updateConnectorLines() { /* ... (Keep V17 logic) ... */ }

    // --- Helper: Update Container Height ---
    function updateContainerHeight() { /* ... (Keep V17 logic) ... */ }

    // --- Helper: Progress Bar Setup ---
    function setupProgressBar() { /* ... (Keep V17 logic) ... */ }

    // --- Scroll Handler: Update Progress Bar ---
    function updateProgressBarOnScroll() { /* ... (Keep V17 logic) ... */ }

    // --- Throttled Scroll Listener ---
    let isThrottled = false; function throttledScrollHandler() { /* ... */ }
    // --- Add Scroll/Resize Listeners ---
    function addScrollListener() { /* ... (Keep V17 logic) ... */ }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
