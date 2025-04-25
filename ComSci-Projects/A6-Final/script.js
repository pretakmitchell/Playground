// File Location: Playground/ComSci-Projects/A6-Final/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');

    // --- Configuration ---
    const PX_PER_DAY = 1.5; // Pixels vertical space per day difference (TWEAK THIS)
    const BASE_ITEM_OFFSET = 50; // Initial top offset
    const CARD_VERTICAL_GAP = 25; // Min vertical pixels between overlapping cards after adjustment
    // Card height is now determined by CSS, but we might need an estimate if dynamically calculating container height later.

    // --- State Variables ---
    let progressBarElement, progressBarTextElement, progressBarIndicatorElement, progressBarPercentageElement;
    let timelineItems = []; // DOM element references
    let sortedProjects = []; // Data + date objects
    let timelineStartDate, timelineEndDate, timelineDurationDays;
    let calculatedTimelineHeight = 0; // Will be set after adjustments
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // --- Main Function ---
    async function fetchProjects() {
        try {
            const response = await fetch('/api/a6-timeline-projects'); // Verify API path
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const projects = await response.json();

            if (initialLoadingMessage) initialLoadingMessage.remove();
            timelineContainer.innerHTML = '';

            if (!projects || !Array.isArray(projects) || projects.length === 0) {
                displayErrorMessage('No projects found.'); return;
            }

            processAndSortProjects(projects);

            if (!timelineStartDate || !timelineEndDate) {
                displayErrorMessage('Could not determine timeline range (missing/invalid dates).');
                // Optionally render items without time-based positioning here
                return;
            }

            renderTimelineItems(); // Initial render based on time
            requestAnimationFrame(() => { // Allow browser to paint initial layout
                adjustForOverlaps();
                updateConnectorLines(); // Draw connectors AFTER adjustments
                updateContainerHeight(); // Set final container height
                setupProgressBar(); // Setup bar AFTER container height is known
                addScrollListener();
                requestAnimationFrame(updateProgressBarOnScroll); // Initial update
            });

        } catch (error) {
            console.error('Error fetching or displaying projects:', error);
            displayErrorMessage(`Error loading projects: ${error.message}.`);
        }
    }

    // --- Helper: Display Error ---
    function displayErrorMessage(message) {
        if (initialLoadingMessage) initialLoadingMessage.remove();
        timelineContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }

    // --- Helper: Process & Sort Data ---
    function processAndSortProjects(projects) {
        // (Same logic as previous version to validate dates, sort, set bounds)
        const projectsWithDates = projects
            .map(p => ({ ...p, dateObj: p.date ? new Date(p.date) : null }))
            .map(p => ({ ...p, isValidDate: p.dateObj && !isNaN(p.dateObj.getTime()) }));
        const validDateProjects = projectsWithDates.filter(p => p.isValidDate);
        if (validDateProjects.length === 0) {
            timelineStartDate = null; timelineEndDate = null; return;
        }
        validDateProjects.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
        timelineStartDate = validDateProjects[0].dateObj;
        timelineEndDate = validDateProjects[validDateProjects.length - 1].dateObj;
        const durationMs = timelineEndDate.getTime() - timelineStartDate.getTime();
        timelineDurationDays = Math.max(1, durationMs / MS_PER_DAY);
        sortedProjects = [...validDateProjects, ...projectsWithDates.filter(p => !p.isValidDate)];
    }

    // --- Helper: Render Items (Initial Time-Based Placement) ---
    function renderTimelineItems() {
        timelineItems = [];
        timelineContainer.style.position = 'relative'; // Ensure positioning context

        sortedProjects.forEach((project, index) => {
            const isLeft = index % 2 === 0;
            const timelineItem = document.createElement('div');
            timelineItem.classList.add('timeline-item', isLeft ? 'timeline-item-left' : 'timeline-item-right');
            timelineItem.dataset.identifier = project.isValidDate ? project.dateObj.toISOString() : `item-invalid-${index}`;

            // Calculate initial vertical position
            let verticalPosition = BASE_ITEM_OFFSET;
            if (project.isValidDate) {
                const timeDiffMs = project.dateObj.getTime() - timelineStartDate.getTime();
                const timeDiffDays = Math.max(0, timeDiffMs / MS_PER_DAY);
                verticalPosition = BASE_ITEM_OFFSET + (timeDiffDays * PX_PER_DAY);
            } else if (index > 0) {
                 // Placeholder for invalid - adjustForOverlaps will fix if needed
                 const lastItem = timelineItems[timelineItems.length - 1];
                 verticalPosition = lastItem ? (lastItem.offsetTop + MIN_SPACING_PX) : BASE_ITEM_OFFSET;
            }

            timelineItem.style.position = 'absolute';
            timelineItem.style.top = `${verticalPosition}px`;
            timelineItem.style.left = isLeft ? '0' : '50%'; // Basic horizontal positioning

            // --- Format Date, Get Image/Category (same as before) ---
            let displayDate = 'Date N/A';
            if (project.isValidDate) { displayDate = project.dateObj.toLocaleDateString(...); }
            const firstImage = project.images?.[0];
            const imagePath = firstImage ? `assets/${firstImage}` : '';
            const category = project.tags?.[0]?.toUpperCase() ?? '';

            // --- Generate HTML with SVG Placeholder ---
            timelineItem.innerHTML = `
                <div class="timeline-marker"></div>
                <svg class="connector-line" preserveAspectRatio="none">
                   <path d="" fill="none" />
                </svg>
                <div class="timeline-card">
                     ${imagePath ? `<div class="card-image-container"><img src="${imagePath}" alt="${project.title || 'Project image'}" loading="lazy"></div>` : '<div class="card-image-container"></div>'}
                     <div class="card-content">
                         <div class="card-header">
                             <span class="card-date">${displayDate}</span>
                             ${category ? `<span class="separator">-</span><span class="card-category">${category}</span>` : ''}
                         </div>
                         <h3 class="card-title">${project.title || 'Untitled Project'}</h3>
                         <p class="card-description">${project.description || 'No description available.'}</p>
                         ${project.link ? `<p class="card-link"><a href="${project.link}" target="_blank" rel="noopener noreferrer">View Project</a></p>` : ''}
                     </div>
                 </div>
            `;
            timelineContainer.appendChild(timelineItem);
            timelineItems.push(timelineItem);
        });
    }

    // --- Helper: Adjust for Overlaps ---
    function adjustForOverlaps() {
        if (timelineItems.length < 2) return;

        for (let i = 0; i < timelineItems.length - 1; i++) {
            const item1 = timelineItems[i];
            const item2 = timelineItems[i + 1];

            // Only check adjacent items on opposite sides
            const isItem1Left = item1.classList.contains('timeline-item-left');
            const isItem2Left = item2.classList.contains('timeline-item-left');

            if (isItem1Left === isItem2Left) {
                continue; // Skip if items are on the same side
            }

            const item1Top = item1.offsetTop;
            const item1Height = item1.offsetHeight; // Get actual rendered height
            const item1Bottom = item1Top + item1Height;
            const item2Top = item2.offsetTop;

            // Check for overlap
            if (item1Bottom + CARD_VERTICAL_GAP > item2Top) {
                const newTop = item1Bottom + CARD_VERTICAL_GAP;
                item2.style.top = `${newTop}px`;
                // console.log(`Adjusted item ${i+1} top from ${item2Top} to ${newTop}`); // Debugging
            }
        }
    }

    // --- Helper: Draw Connector Lines (SVG Paths) ---
    function updateConnectorLines() {
        const markerSize = 14; // Should match CSS --marker-size approx
        const timelineAxisX = timelineContainer.offsetWidth / 2;

        timelineItems.forEach(item => {
            const svg = item.querySelector('.connector-line');
            const path = svg?.querySelector('path');
            const marker = item.querySelector('.timeline-marker');
            const card = item.querySelector('.timeline-card');
            if (!path || !marker || !card) return;

            const isLeft = item.classList.contains('timeline-item-left');

            // Get positions relative to the item's container (which is #timeline-container)
            const markerRect = marker.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            const containerRect = timelineContainer.getBoundingClientRect();

             // Calculate marker center relative to container top-left
             const markerCenterX = markerRect.left - containerRect.left + markerRect.width / 2;
             const markerCenterY = markerRect.top - containerRect.top + markerRect.height / 2;


            // Card connection point (middle of the edge facing the center)
            const cardConnectX = isLeft
                ? cardRect.right - containerRect.left
                : cardRect.left - containerRect.left;
            const cardConnectY = cardRect.top - containerRect.top + cardRect.height / 2;

            // SVG ViewBox needs to encompass the line
            const svgWidth = Math.abs(cardConnectX - markerCenterX);
            const svgHeight = Math.abs(cardConnectY - markerCenterY);
            // Position SVG - This part is tricky. Let's use absolute positioning on SVG too.
             svg.style.position = 'absolute';
             svg.style.top = `${Math.min(markerCenterY, cardConnectY) - 5}px`; // Add buffer
             svg.style.height = `${svgHeight + 10}px`; // Add buffer
             svg.setAttribute('viewBox', `0 0 ${svgWidth + 10} ${svgHeight + 10}`); // Add buffer

             let startX, startY, endX, endY;

             if (isLeft) {
                 svg.style.left = `${markerCenterX - 5}px`;
                 svg.style.width = `${svgWidth + 10}px`;
                 // Coordinates within the SVG viewBox
                 startX = 5;
                 startY = markerCenterY - parseFloat(svg.style.top);
                 endX = svgWidth + 5;
                 endY = cardConnectY - parseFloat(svg.style.top);
             } else { // isRight
                 svg.style.left = `${cardConnectX - 5}px`;
                 svg.style.width = `${svgWidth + 10}px`;
                 // Coordinates within the SVG viewBox
                 startX = svgWidth + 5;
                 startY = cardConnectY - parseFloat(svg.style.top);
                 endX = 5;
                 endY = markerCenterY - parseFloat(svg.style.top);
             }


            // --- Define SVG Path ---
            // M = MoveTo, C = Cubic Bezier Curve (startX, startY, cp1X, cp1Y, cp2X, cp2Y, endX, endY)
            // Straight line for now, S-curve needs more complex control points
            // const pathData = `M ${startX} ${startY} L ${endX} ${endY}`; // Straight Line

             // Simple S-Curve Logic (adjust control points for more/less curve)
             const curveFactor = 0.4; // How much the curve deviates horizontally
             const midX = (startX + endX) / 2;
             const cp1X = midX; // Control points directly above/below midpoint
             const cp1Y = startY;
             const cp2X = midX;
             const cp2Y = endY;

             const pathData = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;


            path.setAttribute('d', pathData);
        });
    }


    // --- Helper: Update Container Height ---
    function updateContainerHeight() {
        if (timelineItems.length === 0) {
            timelineContainer.style.height = '100vh'; // Default height if no items
            return;
        }
        let maxHeight = 0;
        timelineItems.forEach(item => {
            const itemBottom = item.offsetTop + item.offsetHeight;
            if (itemBottom > maxHeight) {
                maxHeight = itemBottom;
            }
        });
        // Add some padding at the bottom
        timelineContainer.style.height = `${maxHeight + BASE_ITEM_OFFSET}px`;
         calculatedTimelineHeight = maxHeight + BASE_ITEM_OFFSET; // Update for progress bar calc
    }


    // --- Helper: Progress Bar Setup ---
    function setupProgressBar() {
       // (Same as previous version)
         progressBarElement = document.getElementById('progress-bar');
        if (!progressBarElement) {
           progressBarElement = document.createElement('footer');
           progressBarElement.id = 'progress-bar';
           progressBarElement.innerHTML = `...`; // Same innerHTML
           document.body.appendChild(progressBarElement);
        }
        progressBarTextElement = document.getElementById('progress-bar-text');
        progressBarIndicatorElement = document.getElementById('progress-bar-indicator');
        progressBarPercentageElement = document.getElementById('progress-bar-percentage');
    }

    // --- Scroll Handler: Update Progress Bar ---
    function updateProgressBarOnScroll() {
         // (Use the same logic as previous version, but use the updated calculatedTimelineHeight)
        if (!progressBarIndicatorElement || !progressBarTextElement || !progressBarPercentageElement || !timelineStartDate || !timelineEndDate || calculatedTimelineHeight <= 0) {
            if(progressBarTextElement) progressBarTextElement.textContent = "Timeline";
            return;
        }

        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;
        const pageHeight = document.documentElement.scrollHeight; // Use actual page height
        const totalScrollableHeight = Math.max(1, pageHeight - viewportHeight);
        let scrollPercentage = (scrollY / totalScrollableHeight) * 100;
        scrollPercentage = Math.max(0, Math.min(100, scrollPercentage));

        progressBarIndicatorElement.style.width = `${scrollPercentage}%`;
        progressBarPercentageElement.textContent = `${Math.round(scrollPercentage)}%`;

        let estimatedDate = timelineStartDate;
        if (timelineDurationDays > 0) {
            const daysOffset = timelineDurationDays * (scrollPercentage / 100);
            const estimatedTimeMs = timelineStartDate.getTime() + (daysOffset * MS_PER_DAY);
            estimatedDate = new Date(estimatedTimeMs);
        }

        if (!isNaN(estimatedDate.getTime())) {
            const monthYear = estimatedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            progressBarTextElement.textContent = monthYear;
        } else {
            progressBarTextElement.textContent = "Timeline Date";
        }
    }

    // --- Throttled Scroll Listener ---
    // (Same as previous version)
    let isThrottled = false;
    function throttledScrollHandler() { /* ... */ }
    function addScrollListener() { /* ... */ }

    // --- Initial Execution ---
    fetchProjects(); // Start the process

}); // End DOMContentLoaded
