// File Location: Playground/ComSci-Projects/A6-Final/script.js
// V7: Integrating Progress Bar Fixes/Logging into V6 Base

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
            console.log("Projects data received:", projects?.length ? `${projects.length} projects` : "No projects data", projects);


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
                // Optionally render invalid items without time positioning if needed
                // renderTimelineItems(true);
                return;
            }

            renderTimelineItems(); // Initial render based on time
            console.log("Initial render complete. Items generated:", timelineItems.length);


            // Defer adjustments to allow browser paint
            requestAnimationFrame(() => {
                console.log("Deferred: Adjusting for overlaps...");
                adjustForOverlaps();
                // console.log("Deferred: Drawing connector lines..."); // Keep commented out for now
                // updateConnectorLines();
                console.log("Deferred: Updating container height...");
                updateContainerHeight();
                console.log("Deferred: Setting up progress bar...");
                setupProgressBar(); // Setup bar AFTER container height is known
                console.log("Deferred: Adding scroll listener...");
                addScrollListener(); // Add listener AFTER progress bar setup
                requestAnimationFrame(updateProgressBarOnScroll); // Initial update call
                console.log("Deferred: Post-render setup complete.");
            });

        } catch (error) {
            console.error('Error fetching or displaying projects:', error);
            displayErrorMessage(`Error loading projects: ${error.message}.`);
        }
    }

    // --- Helper: Display Error ---
    function displayErrorMessage(message) {
        if (initialLoadingMessage) initialLoadingMessage.remove();
        timelineContainer.innerHTML = ''; // Clear previous content
        timelineContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }

    // --- Helper: Process & Sort Data ---
    function processAndSortProjects(projects) {
         const projectsWithDates = projects
            .map(p => ({ ...p, dateObj: p.date ? new Date(p.date) : null }))
            .map(p => ({ ...p, isValidDate: p.dateObj && !isNaN(p.dateObj.getTime()) }));
        const validDateProjects = projectsWithDates.filter(p => p.isValidDate);
        const invalidDateProjects = projectsWithDates.filter(p => !p.isValidDate);
        if (validDateProjects.length === 0) {
            timelineStartDate = null; timelineEndDate = null; timelineDurationDays = 0;
            sortedProjects = [...invalidDateProjects]; // Keep invalid only if needed
            console.warn("No projects with valid dates found to calculate timeline range.");
            return;
        }
        validDateProjects.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()); // Oldest first
        timelineStartDate = validDateProjects[0].dateObj;
        timelineEndDate = validDateProjects[validDateProjects.length - 1].dateObj;
        const durationMs = timelineEndDate.getTime() - timelineStartDate.getTime();
        timelineDurationDays = Math.max(1, durationMs / MS_PER_DAY); // Ensure min 1 day
        calculatedTimelineHeight = BASE_ITEM_OFFSET + (timelineDurationDays * PX_PER_DAY) + CARD_HEIGHT_ESTIMATE * 1.5; // Initial estimate
        sortedProjects = [...validDateProjects, ...invalidDateProjects];
         console.log(`Timeline Range: ${timelineDurationDays.toFixed(1)} days. Estimated Initial Height: ${calculatedTimelineHeight.toFixed(0)}px`);
    }

    // --- Helper: Render Items ---
    function renderTimelineItems(forceSimpleLayout = false) { // Keep forceSimpleLayout option if needed
        timelineItems = [];
        timelineContainer.style.position = 'relative';
        timelineContainer.style.minHeight = `${calculatedTimelineHeight}px`;

        let lastCalculatedBottom = BASE_ITEM_OFFSET;

        console.log(`Rendering ${sortedProjects.length} items...`);
        sortedProjects.forEach((project, index) => {
            const isLeft = index % 2 === 0;
            const timelineItem = document.createElement('div');
            timelineItem.classList.add('timeline-item', isLeft ? 'timeline-item-left' : 'timeline-item-right');
            timelineItem.dataset.identifier = project.isValidDate ? project.dateObj.toISOString() : `item-invalid-${index}`;

            let verticalPosition = BASE_ITEM_OFFSET;
            if (project.isValidDate && !forceSimpleLayout) {
                const timeDiffMs = project.dateObj.getTime() - timelineStartDate.getTime();
                const timeDiffDays = Math.max(0, timeDiffMs / MS_PER_DAY);
                verticalPosition = BASE_ITEM_OFFSET + (timeDiffDays * PX_PER_DAY);
                lastCalculatedBottom = verticalPosition;
            } else {
                 verticalPosition = lastCalculatedBottom + MIN_SPACING_PX;
                 lastCalculatedBottom = verticalPosition;
            }

            timelineItem.style.position = 'absolute';
            timelineItem.style.top = `${verticalPosition}px`;
            timelineItem.style.left = isLeft ? '0' : '50%';
            timelineItem.style.width = '50%';

            // Create itemInfo AFTER element exists
            const itemInfo = { projectData: project, targetTop: verticalPosition, isLeft: isLeft, element: timelineItem };

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
            const imageHTML = imagePath ? `<div class="card-image-container"><img src="${imagePath}" alt="${title}" loading="lazy"></div>` : '<div class="card-image-container"></div>';
            const categoryHTML = category ? `<span class="separator">-</span><span class="card-category">${category}</span>` : '';
            const linkHTML = projectLink ? `<p class="card-link"><a href="${projectLink}" target="_blank" rel="noopener noreferrer">View</a></p>` : '';

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
            } catch (htmlError) { /* ... error handling ... */ }

            timelineContainer.appendChild(timelineItem);
            timelineItems.push(itemInfo); // Store info AFTER element is created

            lastCalculatedBottom = verticalPosition + CARD_HEIGHT_ESTIMATE; // Update tracker
        });
        console.log("Finished appending items to DOM.");
    }

    // --- Helper: Adjust for Overlaps ---
    function adjustForOverlaps() {
        console.log("Checking for overlaps..."); // Log: Overlap check start
        if (timelineItems.length < 2) return;
        // Use CARD_VERTICAL_GAP defined at the top
        for (let i = 0; i < timelineItems.length - 1; i++) {
            const itemInfo1 = timelineItems[i]; const itemInfo2 = timelineItems[i + 1];
            if (!itemInfo1.element || !itemInfo2.element || itemInfo1.isLeft === itemInfo2.isLeft) continue;
            const item1Top = itemInfo1.element.offsetTop; const item1Height = itemInfo1.element.offsetHeight;
            const item1Bottom = item1Top + item1Height;
            const item2Top = itemInfo2.element.offsetTop;
            const minimumItem2Top = item1Bottom + CARD_VERTICAL_GAP;
            if (item2Top < minimumItem2Top) {
                itemInfo2.element.style.top = `${minimumItem2Top}px`;
                console.log(`Overlap Adjust: Pushed item index ${i + 1} down to ${minimumItem2Top.toFixed(0)}px`); // Log: Adjustment made
            }
        }
         console.log("Finished checking overlaps."); // Log: Overlap check end
    }

    // --- Helper: Draw Connector Lines ---
    function updateConnectorLines() { /* ... (Keep commented out for now) ... */ }

    // --- Helper: Update Container Height ---
    function updateContainerHeight() {
        if (timelineItems.length === 0 || !timelineItems[0].element) {
            timelineContainer.style.height = '100vh'; return;
        }
        let maxHeight = 0;
        timelineItems.forEach(itemInfo => {
             if (!itemInfo.element) return;
            const itemBottom = itemInfo.element.offsetTop + itemInfo.element.offsetHeight;
            if (itemBottom > maxHeight) maxHeight = itemBottom;
        });
        const finalHeight = maxHeight + BASE_ITEM_OFFSET * 1.5;
        timelineContainer.style.height = `${finalHeight}px`;
        calculatedTimelineHeight = finalHeight; // Update global for progress bar
        console.log(`Final container height set to: ${finalHeight.toFixed(0)}px`);
    }

    // --- Helper: Progress Bar Setup ---
    function setupProgressBar() {
        console.log("Setting up progress bar...");
        try {
            progressBarElement = document.getElementById('progress-bar');
            if (!progressBarElement) {
               progressBarElement = document.createElement('footer'); progressBarElement.id = 'progress-bar';
               progressBarElement.innerHTML = `
                  <span id="progress-bar-text">Loading Date...</span>
                  <div class="progress-bar-visual">
                     <div class="progress-bar-track"><div id="progress-bar-indicator"></div></div>
                     <span id="progress-bar-percentage">0%</span><span id="progress-bar-icon"></span>
                  </div>`;
               document.body.appendChild(progressBarElement);
               console.log("Progress bar element CREATED.");
            } else { console.log("Progress bar element found."); }
            progressBarTextElement = document.getElementById('progress-bar-text');
            progressBarIndicatorElement = document.getElementById('progress-bar-indicator');
            progressBarPercentageElement = document.getElementById('progress-bar-percentage');
            if(!progressBarTextElement || !progressBarIndicatorElement || !progressBarPercentageElement) {
                console.error("Failed to find one or more progress bar inner elements!");
            } else {
                 console.log("Progress bar inner elements found.");
                  // Set initial state
                 progressBarIndicatorElement.style.width = '0%';
                 progressBarPercentageElement.textContent = '0%';
                 progressBarTextElement.textContent = 'Timeline Start';
            }
        } catch (e) { console.error("Error during progress bar setup:", e); progressBarElement = null; }
    }

    // --- Scroll Handler: Update Progress Bar ---
    function updateProgressBarOnScroll() {
        // console.log("Scroll handler triggered."); // Log: Scroll event handled

        if (!progressBarIndicatorElement || !progressBarTextElement || !progressBarPercentageElement || !timelineStartDate || !timelineEndDate || calculatedTimelineHeight <= 0) {
             // console.log("Skipping progress update - prerequisites not met.");
            if(progressBarTextElement) progressBarTextElement.textContent = "Timeline";
            return;
        }

        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;
        const pageHeight = document.documentElement.scrollHeight;
        const totalScrollableHeight = Math.max(1, pageHeight - viewportHeight);
        let scrollPercentage = (scrollY / totalScrollableHeight) * 100;
        scrollPercentage = Math.max(0, Math.min(100, scrollPercentage));

        // ** Log Calculation Values **
        // console.log(`Progress Update -> ScrollY: ${scrollY.toFixed(0)}, PageH: ${pageHeight.toFixed(0)}, ViewportH: ${viewportHeight.toFixed(0)}, ScrollableH: ${totalScrollableHeight.toFixed(0)}, CalcHeight: ${calculatedTimelineHeight.toFixed(0)}, Percent: ${scrollPercentage.toFixed(1)}%`);

        // Update Percentage Indicator
        progressBarIndicatorElement.style.width = `${scrollPercentage}%`;
        progressBarPercentageElement.textContent = `${Math.round(scrollPercentage)}%`;

        // --- Calculate and Update Interpolated Date Text ---
        let estimatedDate = timelineStartDate;
        if (timelineDurationDays > 0) {
            const daysOffset = timelineDurationDays * (scrollPercentage / 100);
            const estimatedTimeMs = timelineStartDate.getTime() + (daysOffset * MS_PER_DAY);
            estimatedDate = new Date(estimatedTimeMs);
        } else { estimatedDate = null; }

        if (estimatedDate && !isNaN(estimatedDate.getTime())) {
            const monthYear = estimatedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            // console.log("Updating date text:", monthYear); // Log: Date Update
            progressBarTextElement.textContent = monthYear;
        } else { progressBarTextElement.textContent = "Timeline Date"; }
    }

    // --- Throttled Scroll Listener ---
    let isThrottled = false;
    function throttledScrollHandler() {
        // console.log("Raw scroll event..."); // Log: Raw scroll
        if (!isThrottled) {
            isThrottled = true;
            requestAnimationFrame(() => { updateProgressBarOnScroll(); isThrottled = false; });
        }
    }

    // --- Add Scroll/Resize Listeners ---
    function addScrollListener() {
       console.log("Adding scroll and resize listeners...");
       window.removeEventListener('scroll', throttledScrollHandler); window.removeEventListener('resize', throttledScrollHandler);
       window.addEventListener('scroll', throttledScrollHandler); window.addEventListener('resize', throttledScrollHandler);
       console.log("Listeners added.");
    }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
