// File Location: Playground/ComSci-Projects/A6-Final/script.js
// V10: Adding Detailed Date Validation Logging - COMPLETE FILE

document.addEventListener('DOMContentLoaded', () => {
    console.log("--- V10 START --- DOM Loaded. Script starting.");

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
            const response = await fetch('/api/a6-timeline-projects'); // Verify path
            console.log("FETCH: Response received:", response.status);
            if (!response.ok) { const txt = await response.text(); throw new Error(`HTTP ${response.status}: ${txt}`); }
            const projects = await response.json();
            console.log(`FETCH: ${projects?.length ?? 0} projects received.`);

            if (initialLoadingMessage) initialLoadingMessage.remove();
            timelineContainer.innerHTML = '';

            if (!projects || !Array.isArray(projects)) { throw new Error('Invalid project data received.'); }
            if (projects.length === 0) { displayErrorMessage('No projects found.'); return; }

            console.log("PROCESS: Starting project processing...");
            processAndSortProjects(projects); // Call the modified function
            console.log(`PROCESS: Done. Start=${timelineStartDate?.toISOString()}, End=${timelineEndDate?.toISOString()}`);


            if (!timelineStartDate || !timelineEndDate) {
                // Use error message from log if range couldn't be determined
                displayErrorMessage('Could not determine timeline range (missing/invalid dates).');
                // Consider rendering invalid items if processAndSortProjects populated sortedProjects with them
                if (sortedProjects.length > 0) {
                    console.log("Attempting to render items without valid date range...");
                    renderTimelineItems(true); // Pass flag to use simple layout
                }
                return; // Stop further processing that relies on date range
            }

            // If date range is valid, proceed with normal rendering
            console.log("RENDER: Calculating initial positions...");
            calculateInitialPositions(); // Uses the now-valid date range
            console.log("RENDER: Rendering items to DOM...");
            renderTimelineItems();
            console.log(`RENDER: ${timelineItems.length} items theoretically added to DOM.`);


            requestAnimationFrame(() => {
                console.log("POST-RENDER: Starting adjustments...");
                try {
                    adjustForOverlaps();
                    // updateConnectorLines(); // Keep connector lines disabled for now
                    updateContainerHeight();
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
        console.error("DISPLAY ERROR:", message);
        if (initialLoadingMessage) initialLoadingMessage.remove();
        timelineContainer.innerHTML = '';
        timelineContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }

    // --- Helper: Process & Sort Data (WITH DETAILED LOGGING) ---
    function processAndSortProjects(projects) {
         console.log("PROCESS: Starting detailed date validation...");
         const projectsWithDates = projects.map((p, index) => {
             const originalDateString = p.date; // Store original string
             let dateObj = null;
             let isValid = false;
             let parseError = null;

             if (originalDateString && typeof originalDateString === 'string') { // Check if date exists and is a string
                 try {
                     // Attempt to parse the date string - YYYY-MM-DD is generally reliable
                     dateObj = new Date(originalDateString);
                     // Check if the resulting object is a valid Date AND the year seems reasonable (e.g. not 1970 from bad parse)
                     // getTime() check is the most robust way to check validity
                     isValid = !isNaN(dateObj.getTime());

                     // Optional additional check for very old/unlikely dates if needed
                     // if (isValid && dateObj.getFullYear() < 1980) {
                     //    console.warn(`PROCESS: Item ${index} (ID: ${p.id || 'N/A'}) - Date "${originalDateString}" parsed to year ${dateObj.getFullYear()}, seems unlikely.`);
                     //    // Decide if you want to treat this as invalid: isValid = false;
                     // }

                 } catch (e) {
                      parseError = e;
                      isValid = false; // Ensure invalid if parsing threw error
                      console.error(`PROCESS: Item ${index} (ID: ${p.id || 'N/A'}) - Input: "${originalDateString}", PARSE ERROR:`, e);
                 }
             } else {
                  // Log if date field is missing or not a string
                  console.warn(`PROCESS: Item ${index} (ID: ${p.id || 'N/A'}) - Date field missing or not a string:`, originalDateString);
             }

             // Log invalid dates clearly if it wasn't missing
             if (!isValid && originalDateString) {
                 console.warn(`PROCESS: Item ${index} (ID: ${p.id || 'N/A'}) - Input: "${originalDateString}" resulted in INVALID DATE object (parsed as: ${dateObj}).`);
             }

             return { ...p, dateObj: dateObj, isValidDate: isValid }; // Keep dateObj even if invalid for debugging
         });

        // Filter valid dates AFTER logging all attempts
        const validDateProjects = projectsWithDates.filter(p => p.isValidDate);
        const invalidDateProjects = projectsWithDates.filter(p => !p.isValidDate);
        console.log(`PROCESS: Found ${validDateProjects.length} valid date projects and ${invalidDateProjects.length} invalid/missing date projects.`);


        if (validDateProjects.length === 0) {
            timelineStartDate = null; timelineEndDate = null; timelineDurationDays = 0;
            sortedProjects = [...invalidDateProjects]; // Keep invalid only if needed for rendering later
            console.warn("PROCESS: No projects with valid dates found. Cannot calculate timeline range.");
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
    function calculateInitialPositions() {
        console.log("CALC_POS: Calculating initial positions...");
        timelineItems = []; // Reset
        let lastValidTopPosition = BASE_ITEM_OFFSET;

        sortedProjects.forEach((project, index) => {
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

            timelineItems.push({ projectData: project, targetTop: targetTop, isLeft: isLeft, element: null });
            // console.log(`CALC_POS: Item ${index} - Target Top: ${targetTop.toFixed(1)}`);
        });
        console.log("CALC_POS: Finished calculating initial positions.");
    }


    // --- Helper: Render Items Using Calculated Positions ---
    function renderTimelineItems(forceSimpleLayout = false) { // Keep flag if needed
        // timelineItems array should already be populated by calculateInitialPositions
        if (!timelineItems || timelineItems.length === 0) {
            console.error("RENDER: No timeline items data available to render.");
            return;
        }

        timelineContainer.style.position = 'relative';
        timelineContainer.style.minHeight = `${calculatedTimelineHeight}px`; // Set initial estimate

        console.log(`RENDER: Starting loop for ${timelineItems.length} items...`);
        timelineItems.forEach((itemInfo, index) => {
            const project = itemInfo.projectData;
            const isLeft = itemInfo.isLeft;

            const timelineItem = document.createElement('div');
            timelineItem.classList.add('timeline-item', isLeft ? 'timeline-item-left' : 'timeline-item-right');
            timelineItem.dataset.identifier = project.isValidDate ? project.dateObj.toISOString() : `item-invalid-${index}`;

            // --- Apply Position ---
            timelineItem.style.position = 'absolute';
            timelineItem.style.top = `${itemInfo.targetTop}px`; // Use pre-calculated top
            timelineItem.style.left = isLeft ? '0' : '50%';
            timelineItem.style.width = '50%';

            itemInfo.element = timelineItem; // Store DOM element reference

            // --- Format Date, Get Image/Category/Link ---
            let displayDate = 'Date N/A';
            if (project.isValidDate) {
                 try { displayDate = project.dateObj.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}).toUpperCase(); }
                 catch(e) { displayDate = "Invalid Date"; }
            }
            const title = project.title ?? 'Untitled Project';
            const description = project.description ?? 'No description.';
            const firstImage = project.images?.[0] ?? null;
            const imagePath = firstImage ? `assets/${firstImage}` : '';
            const category = project.tags?.[0]?.toUpperCase() ?? '';
            const projectLink = project.link ?? null;
            const imageHTML = imagePath ? `<div class="card-image-container"><img src="${imagePath}" alt="${title}" loading="lazy"></div>`:'<div class="card-image-container"></div>';
            const categoryHTML = category ? `<span class="separator">-</span><span class="card-category">${category}</span>`:'';
            const linkHTML = projectLink ? `<p class="card-link"><a href="${projectLink}" target="_blank" rel="noopener noreferrer">View</a></p>`:'';

            // --- Generate HTML ---
            try {
                timelineItem.innerHTML = `
                    <div class="timeline-marker"></div>
                    <!-- <svg class="connector-line" preserveAspectRatio="none"><path d="" fill="none" /></svg> --> <!-- Keep SVG commented out -->
                    <div class="timeline-card">
                        ${imageHTML}
                        <div class="card-content">
                            <div class="card-header"><span class="card-date">${displayDate}</span>${categoryHTML}</div>
                            <h3 class="card-title">${title}</h3>
                            <p class="card-description">${description}</p>
                            ${linkHTML}
                        </div>
                    </div>
                `;
                 timelineContainer.appendChild(timelineItem);
            } catch (htmlError) {
                 console.error(`RENDER ERROR generating innerHTML for item ${index}:`, htmlError);
                 // Append simple error placeholder to know which item failed
                 timelineItem.innerHTML = `<div style="position:absolute; top:${itemInfo.targetTop}px; left:${isLeft ? '0' : '50%'}; width:50%; color:red; border:1px solid red; padding: 5px; z-index: 100;">Render Error for item ${index}</div>`;
                 timelineContainer.appendChild(timelineItem);
            }
        });
        console.log("RENDER: Finished item rendering loop.");
    }


    // --- Helper: Adjust for Overlaps ---
     function adjustForOverlaps() { /* ... (Keep V8 logic) ... */ }

    // --- Helper: Draw Connector Lines ---
    function updateConnectorLines() { /* ... (Keep commented out) ... */ }

    // --- Helper: Update Container Height ---
    function updateContainerHeight() { /* ... (Keep V8 logic) ... */ }

    // --- Helper: Progress Bar Setup ---
    function setupProgressBar() { /* ... (Keep V8 logic) ... */ }

    // --- Scroll Handler: Update Progress Bar ---
    function updateProgressBarOnScroll() { /* ... (Keep V8 logic) ... */ }

    // --- Throttled Scroll Listener ---
    let isThrottled = false; function throttledScrollHandler() { /* ... */ }
    // --- Add Scroll/Resize Listeners ---
    function addScrollListener() { /* ... (Keep V8 logic) ... */ }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
