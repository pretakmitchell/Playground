// File Location: Playground/ComSci-Projects/A6-Final/script.js
// V17: Debugging calculateInitialPositions loop - COMPLETE FILE

document.addEventListener('DOMContentLoaded', () => {
    console.log("--- V17 START --- DOM Loaded. Script starting.");

    // --- DOM Elements, Config, State Vars (Keep same) ---
    const timelineContainer = document.getElementById('timeline-container'); /* ... */
    const PX_PER_DAY = 1.8; /* ... */ const BASE_ITEM_OFFSET = 60; /* ... */
    let progressBarElement, progressBarTextElement, /* ... */ ;
    let timelineItems = []; let sortedProjects = [];
    let timelineStartDate, timelineEndDate, timelineDurationDays;
    let calculatedTimelineHeight = 0; const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const CARD_VERTICAL_GAP = 30; const MIN_SPACING_PX = 60; const MAX_SPACING_PX = 450;
    const CARD_HEIGHT_ESTIMATE = 200; // Keep estimate

    // --- Main Function ---
    async function fetchProjects() {
        console.log("FETCH: Starting fetch...");
        try {
            /* ... fetch logic ... */
            const response = await fetch('/api/a6-timeline-projects');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const projects = await response.json();
            console.log(`FETCH: ${projects?.length ?? 0} projects received.`);
            /* ... clear loading/container ... */
            if (!projects || !Array.isArray(projects) || projects.length === 0) { /* error */ return; }

            console.log("PROCESS: Starting...");
            processAndSortProjects(projects);
            console.log(`PROCESS: Done Check. Start=${timelineStartDate?.toISOString()}, End=${timelineEndDate?.toISOString()}`);
            if (!timelineStartDate || !timelineEndDate) { /* error */ return; }

            // --- Call Calculation ---
            console.log("CALC_POS: Calling calculateInitialPositions...");
            calculateInitialPositions();
            console.log(`CALC_POS: Returned from calculateInitialPositions. Global timelineItems length: ${timelineItems.length}`); // Log length AFTER call

            if(timelineItems.length === 0 && sortedProjects.length > 0) {
                 console.error("CRITICAL: timelineItems is EMPTY after calculation!");
                 displayErrorMessage("Internal error: Failed to calculate item positions.");
                 return;
            }

            console.log("RENDER: Rendering items...");
            renderTimelineItems();
            console.log(`RENDER: Finished rendering. ${timelineItems.length} items added.`);

            requestAnimationFrame(() => { /* ... post-render adjustments ... */ });

        } catch (error) { /* ... error handling ... */ }
    }

    // --- Helper: Display Error ---
    function displayErrorMessage(message) { /* ... (same) ... */ }
    // --- Helper: Process & Sort Data ---
    function processAndSortProjects(projects) { /* ... (Keep V14/V16 Logic) ... */ }

    // --- Helper: Calculate Initial Positions (WITH MORE LOGS) ---
    function calculateInitialPositions() {
        console.log(`CALC_POS: START. Expecting ${sortedProjects.length} projects. Resetting timelineItems.`);
        timelineItems = []; // Reset the global array
        let lastValidTopPosition = BASE_ITEM_OFFSET;
        let itemCountProcessed = 0;
        let itemsPushed = 0; // Counter for successful pushes

        try {
            if (!Array.isArray(sortedProjects)) {
                 console.error("CALC_POS: sortedProjects is not an array!");
                 return;
            }
            console.log(`CALC_POS: Looping through ${sortedProjects.length} sorted projects...`);

            sortedProjects.forEach((project, index) => {
                itemCountProcessed++;
                const isLeft = index % 2 === 0;
                let targetTop = 0;

                // Log project data being processed
                // console.log(`CALC_POS: Processing index ${index}, ID: ${project?.id}, Date Valid: ${project?.isValidDate}`);

                if (project.isValidDate && timelineStartDate) { // Ensure start date exists
                    const timeDiffMs = project.dateObj.getTime() - timelineStartDate.getTime();
                    const timeDiffDays = Math.max(0, timeDiffMs / MS_PER_DAY);
                    targetTop = BASE_ITEM_OFFSET + (timeDiffDays * PX_PER_DAY);
                    lastValidTopPosition = targetTop;
                } else {
                     targetTop = lastValidTopPosition + MIN_SPACING_PX;
                     lastValidTopPosition = targetTop;
                }

                // Create the object to push
                const newItemInfo = {
                    projectData: project,
                    targetTop: targetTop,
                    isLeft: isLeft,
                    element: null
                };

                // Log BEFORE push
                // console.log(`CALC_POS: Preparing to push item ${index}. Current timelineItems length: ${timelineItems.length}`);
                timelineItems.push(newItemInfo);
                itemsPushed++; // Increment push counter
                // Log AFTER push
                // console.log(`CALC_POS: Pushed item ${index}. New timelineItems length: ${timelineItems.length}`);


            }); // End forEach
        } catch (calcError) {
             console.error("CALC_POS: Error during calculation loop:", calcError);
        }

        // Log final counts AFTER loop finishes
        console.log(`CALC_POS: FINISHED loop. Processed ${itemCountProcessed} items. Attempted to push ${itemsPushed} items. Final timelineItems length: ${timelineItems.length}.`);
    }


    // --- Helper: Render Items (Check itemInfo exists) ---
    function renderTimelineItems(forceSimpleLayout = false) {
        if (!timelineItems || timelineItems.length === 0) { /* ... error ... */ return; }
        // ... (rest of render logic same as V16) ...
         console.log(`RENDER: Starting render loop for ${timelineItems.length} items...`);
         /* ... */
         console.log("RENDER: Finished item rendering loop.");
    }

    // --- Other Helpers (Keep V16 versions) ---
    function adjustForOverlaps() { /* ... */ }
    function updateConnectorLines() { /* ... */ }
    function updateContainerHeight() { /* ... */ }
    function setupProgressBar() { /* ... */ }
    function updateProgressBarOnScroll() { /* ... */ }
    let isThrottled = false; function throttledScrollHandler() { /* ... */ }
    function addScrollListener() { /* ... */ }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
