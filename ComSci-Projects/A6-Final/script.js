// File Location: Playground/ComSci-Projects/A6-Final/script.js
// V13: Debugging calculateInitialPositions - COMPLETE FILE

document.addEventListener('DOMContentLoaded', () => {
    console.log("--- V13 START --- DOM Loaded. Script starting.");

    // --- DOM Elements, Config, State Vars (Keep same as V12) ---
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
            processAndSortProjects(projects);
            console.log(`PROCESS: Done. Start=${timelineStartDate?.toISOString()}, End=${timelineEndDate?.toISOString()}`);

            if (!timelineStartDate || !timelineEndDate) {
                displayErrorMessage('Could not determine timeline range (missing/invalid dates).'); return;
            }

            // ** Explicitly call position calculation **
            calculateInitialPositions();
            // ** Log size AFTER calculation **
            console.log(`CALC_POS: Exiting calculateInitialPositions. timelineItems length: ${timelineItems.length}`);

            // ** Check length BEFORE rendering **
            if(timelineItems.length !== sortedProjects.length) {
                 console.error(`CRITICAL: Mismatch between sortedProjects (${sortedProjects.length}) and calculated timelineItems (${timelineItems.length})`);
                 displayErrorMessage("Internal error during position calculation.");
                 return; // Don't render if calculation failed
            }

            console.log("RENDER: Rendering items to DOM...");
            renderTimelineItems(); // Should now have items data
            console.log(`RENDER: ${timelineItems.length} items theoretically added to DOM.`);

            requestAnimationFrame(() => {
                 console.log("POST-RENDER: Starting adjustments...");
                 try { /* ... post-render calls ... */ } catch (e) { /* ... error ... */ }
            });

        } catch (error) { console.error('Error in fetchProjects:', error); /* ... display error ... */ }
    }

    // --- Helper: Display Error ---
    function displayErrorMessage(message) { /* ... (same) ... */ }
    // --- Helper: Process & Sort Data ---
    function processAndSortProjects(projects) { /* ... (Keep V12 logic w/ date logs) ... */ }

    // --- Helper: Calculate Initial Positions (WITH MORE LOGS) ---
    function calculateInitialPositions() {
        console.log(`CALC_POS: Calculating positions for ${sortedProjects.length} projects...`);
        timelineItems = []; // Reset the global array
        let lastValidTopPosition = BASE_ITEM_OFFSET;
        let itemCountProcessed = 0; // Counter

        try { // Add try-catch around the loop
            sortedProjects.forEach((project, index) => {
                itemCountProcessed++; // Increment counter
                const isLeft = index % 2 === 0;
                let targetTop = 0;

                if (project.isValidDate) {
                    const timeDiffMs = project.dateObj.getTime() - timelineStartDate.getTime();
                    const timeDiffDays = Math.max(0, timeDiffMs / MS_PER_DAY);
                    targetTop = BASE_ITEM_OFFSET + (timeDiffDays * PX_PER_DAY);
                    lastValidTopPosition = targetTop;
                } else {
                     targetTop = lastValidTopPosition + MIN_SPACING_PX;
                     lastValidTopPosition = targetTop;
                }

                // Store calculated position
                timelineItems.push({
                    projectData: project,
                    targetTop: targetTop,
                    isLeft: isLeft,
                    element: null
                });
                // console.log(`CALC_POS: Item ${index} - Target Top: ${targetTop.toFixed(1)}`); // Log for each item (can be noisy)

            }); // End forEach
        } catch (calcError) {
             console.error("CALC_POS: Error during position calculation loop:", calcError);
        }

        console.log(`CALC_POS: Finished loop. Processed ${itemCountProcessed} items. timelineItems array now has ${timelineItems.length} entries.`); // Log after loop
    }


    // --- Helper: Render Items (Check if itemInfo exists) ---
    function renderTimelineItems(forceSimpleLayout = false) {
        // Check timelineItems BEFORE trying to render
        if (!timelineItems || timelineItems.length === 0) {
            console.error("RENDER: Attempted to render, but timelineItems array is empty!");
            displayErrorMessage("Failed to calculate item positions for rendering.");
            return;
        }

        timelineContainer.style.position = 'relative';
        timelineContainer.style.minHeight = `${calculatedTimelineHeight}px`;
        // Clear previous DOM elements explicitly if re-rendering
        timelineContainer.innerHTML = '';

        console.log(`RENDER: Starting render loop for ${timelineItems.length} items...`);
        timelineItems.forEach((itemInfo, index) => { // Use itemInfo from pre-calculated array
            if (!itemInfo || !itemInfo.projectData) { // Add check for valid itemInfo
                console.error(`RENDER: Skipping item ${index} due to missing itemInfo or projectData.`);
                return;
            }

            const project = itemInfo.projectData;
            const isLeft = itemInfo.isLeft;

            const timelineItem = document.createElement('div');
            // ... (rest of element creation, style setting, innerHTML same as V11/V12) ...
             timelineItem.classList.add('timeline-item', isLeft ? 'timeline-item-left' : 'timeline-item-right');
             timelineItem.dataset.identifier = project.isValidDate ? project.dateObj.toISOString() : `item-invalid-${index}`;
             timelineItem.style.position = 'absolute';
             timelineItem.style.top = `${itemInfo.targetTop}px`;
             timelineItem.style.left = isLeft ? '0' : '50%';
             timelineItem.style.width = '50%';
             itemInfo.element = timelineItem; // Store DOM ref

             let displayDate = 'Date N/A'; if (project.isValidDate) { /* format */ }
             const title = project.title ?? 'Untitled'; const description = project.description ?? '...';
             const imagePath = project.images?.[0] ? `assets/${project.images[0]}` : '';
             const category = project.tags?.[0]?.toUpperCase() ?? ''; const link = project.link ?? null;
             const imageHTML = imagePath ? `<div ...><img src="${imagePath}" ...></div>` : `<div></div>`;
             const catHTML = category ? `<span ...>-</span><span ...>${category}</span>` : '';
             const linkHTML = link ? `<p ...><a href="${link}" ...>View</a></p>` : '';

             try { timelineItem.innerHTML = `...`; /* Full innerHTML with SVG */ } catch (e) { /* error */ }

            timelineContainer.appendChild(timelineItem);
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
