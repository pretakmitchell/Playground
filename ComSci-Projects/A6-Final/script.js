// File Location: Playground/ComSci-Projects/A6-Final/script.js
// COMPLETE SCRIPT - REVISED INNERHTML

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');

    // --- Configuration ---
    const PX_PER_DAY = 1.5;
    const BASE_ITEM_OFFSET = 50;
    const CARD_HEIGHT_ESTIMATE = 200;
    const MIN_SPACING_PX = 60;
    const MAX_SPACING_PX = 450;
    const CARD_VERTICAL_GAP = 30; // Increased from 25

    // --- State Variables ---
    let progressBarElement, progressBarTextElement, progressBarIndicatorElement, progressBarPercentageElement;
    let timelineItems = [];
    let sortedProjects = [];
    let timelineStartDate, timelineEndDate, timelineDurationDays;
    let calculatedTimelineHeight = 0;
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // --- Main Function ---
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

            renderTimelineItems(); // Initial render

            requestAnimationFrame(() => { // Defer adjustments
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

    // --- Helper: Display Error ---
    function displayErrorMessage(message) {
        if (initialLoadingMessage) initialLoadingMessage.remove();
        timelineContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }

    // --- Helper: Process & Sort Data ---
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
        timelineContainer.style.minHeight = `${calculatedTimelineHeight}px`;

        let lastCalculatedBottom = BASE_ITEM_OFFSET; // Use BASE_ITEM_OFFSET as initial floor

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
            } else {
                 verticalPosition = lastCalculatedBottom + MIN_SPACING_PX; // Position below last known bottom
            }

            timelineItem.style.position = 'absolute';
            timelineItem.style.top = `${verticalPosition}px`;
            timelineItem.style.left = isLeft ? '0' : '50%';
            timelineItem.style.width = '50%';

            // Update tracker using this item's calculated position + estimate
            lastCalculatedBottom = verticalPosition + CARD_HEIGHT_ESTIMATE;

            // --- Format Date ---
            let displayDate = 'Date N/A';
            if (project.isValidDate) {
                 try {
                     const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
                     displayDate = project.dateObj.toLocaleDateString('en-US', dateOptions).toUpperCase();
                 } catch(e) { console.error("Error formatting date:", e, project.dateObj); displayDate = "Invalid Date"; }
            }

            // --- Get Image, Category, Link ---
            const firstImage = project.images?.[0] ?? null; // Use nullish coalescing
            const imagePath = firstImage ? `assets/${firstImage}` : '';
            const category = project.tags?.[0]?.toUpperCase() ?? ''; // Use optional chaining
            const projectLink = project.link ?? null;

            // --- Generate HTML (Carefully check syntax) ---
            // Using variables outside template literal for complex conditionals
            const imageHTML = imagePath
                ? `<div class="card-image-container"><img src="${imagePath}" alt="${project.title || 'Project image'}" loading="lazy"></div>`
                : '<div class="card-image-container"></div>'; // Placeholder

            const categoryHTML = category
                ? `<span class="separator">-</span><span class="card-category">${category}</span>`
                : '';

            const linkHTML = projectLink
                ? `<p class="card-link"><a href="${projectLink}" target="_blank" rel="noopener noreferrer">View Project</a></p>`
                : '';

            // ** REVISED innerHTML Assignment **
            timelineItem.innerHTML = `
                <div class="timeline-marker"></div>
                <svg class="connector-line" preserveAspectRatio="none"><path d="" fill="none" /></svg>
                <div class="timeline-card">
                    ${imageHTML}
                    <div class="card-content">
                         <div class="card-header">
                            <span class="card-date">${displayDate}</span>
                            ${categoryHTML}
                        </div>
                        <h3 class="card-title">${project.title || 'Untitled Project'}</h3>
                        <p class="card-description">${project.description || 'No description available.'}</p>
                        ${linkHTML}
                    </div>
                </div>
            `;
            // ** END REVISED innerHTML **

            timelineContainer.appendChild(timelineItem);
            timelineItems.push(timelineItem);
        });
    }

    // --- Helper: Adjust for Overlaps ---
    function adjustForOverlaps() {
        if (timelineItems.length < 2) return;
        const itemData = timelineItems.map(item => ({ element: item, isLeft: item.classList.contains('timeline-item-left') }));
        for (let i = 0; i < itemData.length - 1; i++) {
            const item1 = itemData[i]; const item2 = itemData[i + 1];
            if (item1.isLeft === item2.isLeft) continue;
            const item1Bottom = item1.element.offsetTop + item1.element.offsetHeight;
            const item2Top = item2.element.offsetTop;
            const minimumItem2Top = item1Bottom + CARD_VERTICAL_GAP;
            if (item2Top < minimumItem2Top) {
                item2.element.style.top = `${minimumItem2Top}px`;
            }
        }
    }

    // --- Helper: Draw Connector Lines ---
    function updateConnectorLines() {
         const markerSize = 10; // Match CSS --marker-size approx
         timelineItems.forEach(item => {
            const svg = item.querySelector('.connector-line'); const path = svg?.querySelector('path');
            const marker = item.querySelector('.timeline-marker'); const card = item.querySelector('.timeline-card');
            if (!path || !marker || !card) return; // Skip if elements missing
            const isLeft = item.classList.contains('timeline-item-left');
            // Get positions relative to the item itself for SVG path calculation
            const markerOffsetX = marker.offsetLeft + marker.offsetWidth / 2;
            const markerOffsetY = marker.offsetTop + marker.offsetHeight / 2;
            const cardOffsetX = card.offsetLeft; const cardOffsetY = card.offsetTop;
            const cardWidth = card.offsetWidth; const cardHeight = card.offsetHeight;
            const cardConnectX = isLeft ? cardOffsetX : cardOffsetX + cardWidth; // Connect to inner edge
            const cardConnectY = cardOffsetY + cardHeight / 2;
            const svgTop = Math.min(markerOffsetY, cardConnectY) - 10;
            const svgLeft = Math.min(markerOffsetX, cardConnectX) - 10;
            const svgWidth = Math.abs(cardConnectX - markerOffsetX) + 20;
            const svgHeight = Math.abs(cardConnectY - markerOffsetY) + 20;
            svg.style.position = 'absolute'; svg.style.top = `${svgTop}px`; svg.style.left = `${svgLeft}px`;
            svg.style.width = `${svgWidth}px`; svg.style.height = `${svgHeight}px`;
            svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
            const startX = markerOffsetX - svgLeft; const startY = markerOffsetY - svgTop;
            const endX = cardConnectX - svgLeft; const endY = cardConnectY - svgTop;
            const midX = (startX + endX) / 2; const cp1OffsetX = (midX - startX) * 0.7; const cp2OffsetX = (endX - midX) * 0.7;
            const cp1X = startX + cp1OffsetX; const cp1Y = startY; const cp2X = endX - cp2OffsetX; const cp2Y = endY;
            const pathData = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
            path.setAttribute('d', pathData);
        });
    }

    // --- Helper: Update Container Height ---
    function updateContainerHeight() {
        if (timelineItems.length === 0) { timelineContainer.style.height = '100vh'; return; }
        let maxHeight = 0;
        timelineItems.forEach(item => {
            const itemBottom = item.offsetTop + item.offsetHeight;
            if (itemBottom > maxHeight) maxHeight = itemBottom;
        });
        const finalHeight = maxHeight + BASE_ITEM_OFFSET * 1.5;
        timelineContainer.style.height = `${finalHeight}px`;
        calculatedTimelineHeight = finalHeight;
    }

    // --- Helper: Progress Bar Setup ---
    function setupProgressBar() {
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
        }
        progressBarTextElement = document.getElementById('progress-bar-text');
        progressBarIndicatorElement = document.getElementById('progress-bar-indicator');
        progressBarPercentageElement = document.getElementById('progress-bar-percentage');
    }

    // --- Scroll Handler: Update Progress Bar ---
    function updateProgressBarOnScroll() {
        if (!progressBarIndicatorElement || !progressBarTextElement || !progressBarPercentageElement || !timelineStartDate || !timelineEndDate || calculatedTimelineHeight <= 0) {
            if(progressBarTextElement) progressBarTextElement.textContent = "Timeline"; return;
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
        if (!isThrottled) { isThrottled = true; requestAnimationFrame(() => { updateProgressBarOnScroll(); isThrottled = false; }); }
    }

    // --- Add Scroll/Resize Listeners ---
    function addScrollListener() {
       window.removeEventListener('scroll', throttledScrollHandler); window.removeEventListener('resize', throttledScrollHandler);
       window.addEventListener('scroll', throttledScrollHandler); window.addEventListener('resize', throttledScrollHandler);
    }

    // --- Initial Execution ---
    fetchProjects();

}); // End DOMContentLoaded
