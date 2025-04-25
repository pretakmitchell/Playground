// File Location: Playground/ComSci-Projects/A6-Final/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');

    // --- Configuration ---
    const PX_PER_DAY = 1.5; // Pixels vertical space per day difference (TWEAK THIS!)
    const BASE_ITEM_OFFSET = 50; // Initial top offset for the first item
    const CARD_HEIGHT_ESTIMATE = 200; // Approx height for total height calc
    const MIN_SPACING_PX = 60;    // Min vertical space between cards (used if dates invalid or for same-day items)
    const MAX_SPACING_PX = 450;   // Max vertical space (clamp for large gaps)
    const CARD_VERTICAL_GAP = 25; // ** ADDED MISSING CONSTANT ** Min vertical pixels between overlapping cards after adjustment

    // --- State Variables ---
    let progressBarElement = null;
    let progressBarTextElement = null;
    let progressBarIndicatorElement = null;
    let progressBarPercentageElement = null;
    let timelineItems = []; // Array to store DOM references to timeline items
    let sortedProjects = []; // Array to store fetched and sorted project data
    let timelineStartDate = null; // Earliest valid Date object
    let timelineEndDate = null;   // Latest valid Date object
    let timelineDurationDays = 0; // Total duration in days
    let calculatedTimelineHeight = 0; // Estimated total pixel height
    const MS_PER_DAY = 1000 * 60 * 60 * 24; // Constant for calculations

    // --- Main Function to Fetch and Render ---
    async function fetchProjects() {
        try {
            const response = await fetch('/api/a6-timeline-projects');
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
                return;
            }

            renderTimelineItems();

            requestAnimationFrame(() => {
                adjustForOverlaps();
                updateConnectorLines();
                updateContainerHeight();
                setupProgressBar();
                addScrollListener();
                requestAnimationFrame(updateProgressBarOnScroll);
            });

        } catch (error) {
            console.error('Error fetching or displaying projects:', error);
            displayErrorMessage(`Error loading projects: ${error.message}.`);
        }
    }

    // --- Helper: Display Error Message ---
    function displayErrorMessage(message) {
         if (initialLoadingMessage) initialLoadingMessage.remove();
         timelineContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }

    // --- Helper: Process and Sort Project Data ---
    function processAndSortProjects(projects) {
         const projectsWithDates = projects
            .map(p => ({ ...p, dateObj: p.date ? new Date(p.date) : null }))
            .map(p => ({ ...p, isValidDate: p.dateObj && !isNaN(p.dateObj.getTime()) }));

        const validDateProjects = projectsWithDates.filter(p => p.isValidDate);
        if (validDateProjects.length === 0) {
            timelineStartDate = null; timelineEndDate = null; timelineDurationDays = 0;
            sortedProjects = [...projectsWithDates.filter(p => !p.isValidDate)];
            return;
        }
        validDateProjects.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

        timelineStartDate = validDateProjects[0].dateObj;
        timelineEndDate = validDateProjects[validDateProjects.length - 1].dateObj;
        const durationMs = timelineEndDate.getTime() - timelineStartDate.getTime();
        timelineDurationDays = Math.max(1, durationMs / MS_PER_DAY);

        calculatedTimelineHeight = BASE_ITEM_OFFSET + (timelineDurationDays * PX_PER_DAY) + CARD_HEIGHT_ESTIMATE * 1.5;

        sortedProjects = [...validDateProjects, ...projectsWithDates.filter(p => !p.isValidDate)];
    }

    // --- Helper: Render All Timeline Items ---
    function renderTimelineItems() {
        timelineItems = [];
        timelineContainer.style.position = 'relative';
        timelineContainer.style.minHeight = `${calculatedTimelineHeight}px`; // Set initial min height

        let lastValidTopPosition = BASE_ITEM_OFFSET;

        sortedProjects.forEach((project, index) => {
            const isLeft = index % 2 === 0;
            const timelineItem = document.createElement('div');
            timelineItem.classList.add('timeline-item', isLeft ? 'timeline-item-left' : 'timeline-item-right');
            timelineItem.dataset.identifier = project.isValidDate ? project.dateObj.toISOString() : `item-invalid-${index}`;

            let verticalPosition = BASE_ITEM_OFFSET;
            if (project.isValidDate) {
                const timeDiffMs = project.dateObj.getTime() - timelineStartDate.getTime();
                const timeDiffDays = Math.max(0, timeDiffMs / MS_PER_DAY);
                verticalPosition = BASE_ITEM_OFFSET + (timeDiffDays * PX_PER_DAY);
                lastValidTopPosition = verticalPosition;
            } else if (index > 0) {
                 verticalPosition = lastValidTopPosition + MIN_SPACING_PX;
                 lastValidTopPosition = verticalPosition; // Update approx position
            }

            timelineItem.style.position = 'absolute';
            timelineItem.style.top = `${verticalPosition}px`;
            timelineItem.style.left = isLeft ? '0' : '50%';
            timelineItem.style.width = '50%';

            let displayDate = 'Date N/A';
            if (project.isValidDate) {
                 try {
                     const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
                     displayDate = project.dateObj.toLocaleDateString('en-US', dateOptions).toUpperCase();
                 } catch(e) { console.error("Error formatting date:", e, project.dateObj); displayDate = "Invalid Date"; }
            }

            const firstImage = project.images?.[0];
            const imagePath = firstImage ? `assets/${firstImage}` : '';
            const category = project.tags?.[0]?.toUpperCase() ?? '';

            timelineItem.innerHTML = `
                <div class="timeline-marker"></div>
                <svg class="connector-line" preserveAspectRatio="none"><path d="" fill="none" /></svg>
                <div class="timeline-card">
                    ${imagePath ? `<div class="card-image-container"><img src="${imagePath}" alt="${project.title || 'Project'}" loading="lazy"></div>` : '<div class="card-image-container"></div>'}
                    <div class="card-content">
                         <div class="card-header">
                            <span class="card-date">${displayDate}</span>
                            ${category ? `<span class="separator">-</span><span class="card-category">${category}</span>` : ''}
                        </div>
                        <h3 class="card-title">${project.title || 'Untitled'}</h3>
                        <p class="card-description">${project.description || '...'}</p>
                        ${project.link ? `<p class="card-link"><a href="${project.link}" target="_blank" rel="noopener noreferrer">View</a></p>` : ''}
                    </div>
                </div>`;
            timelineContainer.appendChild(timelineItem);
            timelineItems.push(timelineItem);
        });
    }

    // --- Helper: Adjust for Overlaps ---
    function adjustForOverlaps() {
        if (timelineItems.length < 2) return;
        // Use CARD_VERTICAL_GAP defined at the top
        const itemData = timelineItems.map(item => ({ element: item, isLeft: item.classList.contains('timeline-item-left') }));

        for (let i = 0; i < itemData.length - 1; i++) {
            const item1 = itemData[i];
            const item2 = itemData[i + 1];
            if (item1.isLeft === item2.isLeft) continue;

            const item1Bottom = item1.element.offsetTop + item1.element.offsetHeight;
            const item2Top = item2.element.offsetTop;

            if (item1Bottom + CARD_VERTICAL_GAP > item2Top) {
                item2.element.style.top = `${item1Bottom + CARD_VERTICAL_GAP}px`;
            }
        }
    }

    // --- Helper: Draw Connector Lines (SVG Paths) ---
    function updateConnectorLines() {
        // (Keep the exact same logic as the previous script version)
         const markerSize = 10; // Match CSS --marker-size
         timelineItems.forEach(item => {
            const svg = item.querySelector('.connector-line');
            const path = svg?.querySelector('path');
            const marker = item.querySelector('.timeline-marker');
            const card = item.querySelector('.timeline-card');
            if (!path || !marker || !card) return;
            const isLeft = item.classList.contains('timeline-item-left');
            const markerOffsetX = marker.offsetLeft + marker.offsetWidth / 2;
            const markerOffsetY = marker.offsetTop + marker.offsetHeight / 2;
            const cardOffsetX = card.offsetLeft;
            const cardOffsetY = card.offsetTop;
            const cardWidth = card.offsetWidth;
            const cardHeight = card.offsetHeight;
            const cardConnectX = isLeft ? cardOffsetX + cardWidth : cardOffsetX;
            const cardConnectY = cardOffsetY + cardHeight / 2;
            const svgTop = Math.min(markerOffsetY, cardConnectY) - 10;
            const svgLeft = Math.min(markerOffsetX, cardConnectX) - 10;
            const svgWidth = Math.abs(cardConnectX - markerOffsetX) + 20;
            const svgHeight = Math.abs(cardConnectY - markerOffsetY) + 20;
            svg.style.position = 'absolute';
            svg.style.top = `${svgTop}px`; svg.style.left = `${svgLeft}px`;
            svg.style.width = `${svgWidth}px`; svg.style.height = `${svgHeight}px`;
            svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
            const startX = markerOffsetX - svgLeft; const startY = markerOffsetY - svgTop;
            const endX = cardConnectX - svgLeft; const endY = cardConnectY - svgTop;
            const midX = (startX + endX) / 2;
            const cp1OffsetX = (midX - startX) * 0.7; const cp2OffsetX = (endX - midX) * 0.7;
            const cp1X = startX + cp1OffsetX; const cp1Y = startY;
            const cp2X = endX - cp2OffsetX; const cp2Y = endY;
            const pathData = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
            path.setAttribute('d', pathData);
        });
    }

    // --- Helper: Update Container Height After Adjustments ---
    function updateContainerHeight() {
        if (timelineItems.length === 0) {
            timelineContainer.style.height = '100vh'; return;
        }
        let maxHeight = 0;
        timelineItems.forEach(item => {
            const itemBottom = item.offsetTop + item.offsetHeight;
            if (itemBottom > maxHeight) maxHeight = itemBottom;
        });
        const finalHeight = maxHeight + BASE_ITEM_OFFSET * 1.5; // Adjusted bottom padding
        timelineContainer.style.height = `${finalHeight}px`;
        calculatedTimelineHeight = finalHeight;
    }

    // --- Helper: Progress Bar Setup ---
    function setupProgressBar() {
        progressBarElement = document.getElementById('progress-bar');
        if (!progressBarElement) {
           progressBarElement = document.createElement('footer');
           progressBarElement.id = 'progress-bar';
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
        }
        progressBarTextElement = document.getElementById('progress-bar-text');
        progressBarIndicatorElement = document.getElementById('progress-bar-indicator');
        progressBarPercentageElement = document.getElementById('progress-bar-percentage');
    }

    // --- Scroll Handler: Update Progress Bar ---
    function updateProgressBarOnScroll() {
        if (!progressBarIndicatorElement || !progressBarTextElement || !progressBarPercentageElement || !timelineStartDate || !timelineEndDate || calculatedTimelineHeight <= 0) {
            if(progressBarTextElement) progressBarTextElement.textContent = "Timeline";
            return;
        }
        const viewportHeight = window.innerHeight; const scrollY = window.scrollY;
        const pageHeight = document.documentElement.scrollHeight;
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
        } else { progressBarTextElement.textContent = "Timeline Date"; }
    }

    // --- Throttled Scroll Listener ---
    let isThrottled = false;
    function throttledScrollHandler() {
        if (!isThrottled) {
            isThrottled = true;
            requestAnimationFrame(() => { updateProgressBarOnScroll(); isThrottled = false; });
        }
    }

    // --- Add Scroll/Resize Listeners ---
    function addScrollListener() {
       window.removeEventListener('scroll', throttledScrollHandler); window.removeEventListener('resize', throttledScrollHandler);
       window.addEventListener('scroll', throttledScrollHandler); window.addEventListener('resize', throttledScrollHandler);
    }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
