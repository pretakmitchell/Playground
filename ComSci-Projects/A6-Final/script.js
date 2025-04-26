// File Location: Playground/ComSci-Projects/A6-Final/script.js
// Attempt V6: Simplify Render, Add Logging

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Script starting."); // Log: Script start

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
        console.log("Fetching projects...");
        try {
            const response = await fetch('/api/a6-timeline-projects'); // Verify path
            console.log("Fetch response received:", response.status, response.statusText);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText}`);
            }
            const projects = await response.json();
            console.log("Projects data received:", projects);

            if (initialLoadingMessage) initialLoadingMessage.remove();
            timelineContainer.innerHTML = ''; // Clear just before rendering

            if (!projects || !Array.isArray(projects)) { // Check if it's an array
                 displayErrorMessage('Invalid project data received.');
                 console.error("Invalid data format:", projects);
                 return;
            }
            if (projects.length === 0) {
                displayErrorMessage('No projects found.'); return;
            }

            processAndSortProjects(projects);
            console.log(`Processed ${sortedProjects.length} projects. Start: ${timelineStartDate}, End: ${timelineEndDate}`);

            if (!timelineStartDate || !timelineEndDate) {
                displayErrorMessage('Could not determine timeline range (missing/invalid dates).');
                // Decide whether to render invalid date items anyway
                renderTimelineItems(true); // Pass flag to indicate non-time-based render maybe?
                return;
            }

            renderTimelineItems(); // Initial render based on time
            console.log("Initial render complete. Items generated:", timelineItems.length);


            // Defer adjustments to allow browser paint
            requestAnimationFrame(() => {
                console.log("Adjusting for overlaps...");
                adjustForOverlaps();
                // console.log("Drawing connector lines..."); // ** Temporarily disable **
                // updateConnectorLines();
                console.log("Updating container height...");
                updateContainerHeight();
                console.log("Setting up progress bar...");
                setupProgressBar();
                addScrollListener();
                requestAnimationFrame(updateProgressBarOnScroll); // Initial update
                console.log("Post-render setup complete.");
            });

        } catch (error) {
            console.error('Error fetching or displaying projects:', error);
            displayErrorMessage(`Error loading projects: ${error.message}.`);
        }
    }

    // --- Helper: Display Error ---
    function displayErrorMessage(message) {
        if (initialLoadingMessage) initialLoadingMessage.remove();
        // Ensure container is clear before adding error
        timelineContainer.innerHTML = '';
        timelineContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }

    // --- Helper: Process & Sort Data ---
    function processAndSortProjects(projects) {
        // ... (Keep the same robust logic from V5) ...
         const projectsWithDates = projects
            .map(p => ({ ...p, dateObj: p.date ? new Date(p.date) : null }))
            .map(p => ({ ...p, isValidDate: p.dateObj && !isNaN(p.dateObj.getTime()) }));
        const validDateProjects = projectsWithDates.filter(p => p.isValidDate);
        const invalidDateProjects = projectsWithDates.filter(p => !p.isValidDate);
        if (validDateProjects.length === 0) {
            timelineStartDate = null; timelineEndDate = null; timelineDurationDays = 0;
            sortedProjects = [...invalidDateProjects]; return; // Keep invalid only if needed
        }
        validDateProjects.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
        timelineStartDate = validDateProjects[0].dateObj;
        timelineEndDate = validDateProjects[validDateProjects.length - 1].dateObj;
        const durationMs = timelineEndDate.getTime() - timelineStartDate.getTime();
        timelineDurationDays = Math.max(1, durationMs / MS_PER_DAY);
        calculatedTimelineHeight = BASE_ITEM_OFFSET + (timelineDurationDays * PX_PER_DAY) + CARD_HEIGHT_ESTIMATE * 1.5;
        sortedProjects = [...validDateProjects, ...invalidDateProjects];
         console.log(`Timeline Range: ${timelineDurationDays.toFixed(1)} days. Estimated Height: ${calculatedTimelineHeight.toFixed(0)}px`);
    }

    // --- Helper: Render Items (Simplified innerHTML) ---
    function renderTimelineItems(forceSimpleLayout = false) {
        timelineItems = [];
        timelineContainer.style.position = 'relative';
        timelineContainer.style.minHeight = `${calculatedTimelineHeight}px`; // Set initial min height

        let lastCalculatedBottom = BASE_ITEM_OFFSET;

        console.log(`Rendering ${sortedProjects.length} items...`);
        sortedProjects.forEach((project, index) => {
             // console.log(`Rendering item ${index}: ${project.title || 'Untitled'}`); // Log each item start
            const isLeft = index % 2 === 0;
            const timelineItem = document.createElement('div');
            timelineItem.classList.add('timeline-item', isLeft ? 'timeline-item-left' : 'timeline-item-right');
            timelineItem.dataset.identifier = project.isValidDate ? project.dateObj.toISOString() : `item-invalid-${index}`;

            let verticalPosition = BASE_ITEM_OFFSET;
            if (project.isValidDate && !forceSimpleLayout) {
                const timeDiffMs = project.dateObj.getTime() - timelineStartDate.getTime();
                const timeDiffDays = Math.max(0, timeDiffMs / MS_PER_DAY);
                verticalPosition = BASE_ITEM_OFFSET + (timeDiffDays * PX_PER_DAY);
                lastCalculatedBottom = verticalPosition; // Use this item's top as floor
            } else {
                 verticalPosition = lastCalculatedBottom + MIN_SPACING_PX;
                 lastCalculatedBottom = verticalPosition; // Update floor
            }

            timelineItem.style.position = 'absolute';
            timelineItem.style.top = `${verticalPosition}px`;
            timelineItem.style.left = isLeft ? '0' : '50%';
            timelineItem.style.width = '50%';

            itemInfo = { projectData: project, targetTop: verticalPosition, isLeft: isLeft, element: timelineItem }; // Store info with element


            // --- Format Date ---
            let displayDate = 'Date N/A';
            if (project.isValidDate) {
                 try { displayDate = project.dateObj.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}).toUpperCase(); }
                 catch(e) { displayDate = "Invalid Date"; }
            }

            // --- Get Image, Category, Link (with checks) ---
            const title = project.title ?? 'Untitled Project';
            const description = project.description ?? 'No description.';
            const firstImage = project.images?.[0] ?? null;
            const imagePath = firstImage ? `assets/${firstImage}` : '';
            const category = project.tags?.[0]?.toUpperCase() ?? '';
            const projectLink = project.link ?? null;
            const imageHTML = imagePath ? `<div class="card-image-container"><img src="${imagePath}" alt="${title}" loading="lazy"></div>` : '<div class="card-image-container"></div>';
            const categoryHTML = category ? `<span class="separator">-</span><span class="card-category">${category}</span>` : '';
            const linkHTML = projectLink ? `<p class="card-link"><a href="${projectLink}" target="_blank" rel="noopener noreferrer">View</a></p>` : '';

            // --- Generate HTML (Check all variables used) ---
            try {
                timelineItem.innerHTML = `
                    <div class="timeline-marker"></div>
                    <!-- <svg class="connector-line" preserveAspectRatio="none"><path d="" fill="none" /></svg> --> <!-- ** Temporarily Commented Out SVG ** -->
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
            } catch (htmlError) {
                 console.error("Error generating innerHTML for item:", index, project.title, htmlError);
                 // Optionally add fallback HTML
                 timelineItem.innerHTML = `<div class="timeline-marker"></div><div class="timeline-card"><p style="color:red;">Render Error</p></div>`;
            }


            timelineContainer.appendChild(timelineItem);
            timelineItems.push(itemInfo); // Store Ref WITH element now

            // Update tracker using calculated position + ESTIMATED height for next invalid item
            lastCalculatedBottom = verticalPosition + CARD_HEIGHT_ESTIMATE;
        });
        console.log("Finished appending items to DOM.");
    }


    // --- Helper: Adjust for Overlaps ---
    function adjustForOverlaps() { /* ... (Keep same logic, check console if called) ... */ }

    // --- Helper: Draw Connector Lines ---
    function updateConnectorLines() { /* ... (Keep same logic, but won't be called yet) ... */ }

    // --- Helper: Update Container Height ---
    function updateContainerHeight() { /* ... (Keep same logic) ... */ }

    // --- Helper: Progress Bar Setup ---
        // --- Helper: Progress Bar Setup ---
    function setupProgressBar() {
        console.log("Setting up progress bar..."); // Log: Start setup
        try {
            progressBarElement = document.getElementById('progress-bar');

            // If the footer doesn't exist, create and append it
            if (!progressBarElement) {
               progressBarElement = document.createElement('footer');
               progressBarElement.id = 'progress-bar';
               // ** Ensure this structure exactly matches your CSS **
               progressBarElement.innerHTML = `
                  <span id="progress-bar-text">Loading Date...</span>
                  <div class="progress-bar-visual">
                     <div class="progress-bar-track">
                        <div id="progress-bar-indicator"></div>
                     </div>
                     <span id="progress-bar-percentage">0%</span>
                     <span id="progress-bar-icon"></span>
                  </div>
               `;
               document.body.appendChild(progressBarElement);
               console.log("Progress bar element CREATED and appended.");
            } else {
                 console.log("Progress bar element found existing in DOM.");
            }

            // Now, query *within* the progressBarElement (or document) to find the parts
            // Querying the document is generally safer if the element was just added
            progressBarTextElement = document.getElementById('progress-bar-text');
            progressBarIndicatorElement = document.getElementById('progress-bar-indicator');
            progressBarPercentageElement = document.getElementById('progress-bar-percentage');

            // Check if elements were found
            if (!progressBarTextElement) { console.error("Failed to find #progress-bar-text"); }
            if (!progressBarIndicatorElement) { console.error("Failed to find #progress-bar-indicator"); }
            if (!progressBarPercentageElement) { console.error("Failed to find #progress-bar-percentage"); }

            // Initial visual state (optional, scroll handler updates anyway)
            if (progressBarIndicatorElement) progressBarIndicatorElement.style.width = '0%';
            if (progressBarPercentageElement) progressBarPercentageElement.textContent = '0%';
            if (progressBarTextElement) progressBarTextElement.textContent = 'Timeline Start'; // More descriptive initial text

        } catch (e) {
            console.error("Error during progress bar setup:", e);
            // Fallback: try to remove potentially broken progress bar
            if (progressBarElement) progressBarElement.remove();
            progressBarElement = null; // Ensure it's null so update function doesn't run
        }
    }

    // --- Scroll Handler: Update Progress Bar ---
    function updateProgressBarOnScroll() { /* ... (Keep same logic) ... */ }

    // --- Throttled Scroll Listener ---
    let isThrottled = false;
    function throttledScrollHandler() { /* ... (Keep same logic) ... */ }
    function addScrollListener() { /* ... (Keep same logic) ... */ }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
