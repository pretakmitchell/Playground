// File Location: Playground/ComSci-Projects/A6-Final/script.js

document.addEventListener('DOMContentLoaded', () => {
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');

    // --- CONFIGURATION FOR DYNAMIC SPACING ---
    const MIN_SPACING_PX = 60;    // Min vertical space (pixels) between cards
    const MAX_SPACING_PX = 450;   // Max vertical space for large gaps
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    // --- ADJUST THIS VALUE to control spacing sensitivity ---
    const PX_PER_DAY = 1.5;       // Pixels of margin added per day difference

    // --- Variables for Progress Bar ---
    let progressBarElement = null;
    let progressBarTextElement = null;
    let progressBarIndicatorElement = null;
    let progressBarPercentageElement = null;
    let timelineItems = []; // Store references to timeline items for scroll calculation
    let sortedProjects = []; // Store sorted project data

    async function fetchProjects() {
        try {
            const response = await fetch('/api/a6-timeline-projects'); // Check this API path

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}. Response: ${errorText}`);
            }

            const projects = await response.json();

            if (initialLoadingMessage) initialLoadingMessage.remove();
            timelineContainer.innerHTML = '';

            if (!projects || !Array.isArray(projects) || projects.length === 0) {
                timelineContainer.innerHTML = '<p class="error-message">No projects found or data is invalid.</p>';
                console.warn("No projects found or received invalid data:", projects);
                return;
            }

            // --- Process and Sort Projects ---
            // Filter out projects with invalid dates first, but keep them for potential rendering later if needed
            const validDateProjects = projects
                .map(p => ({ ...p, dateObj: p.date ? new Date(p.date) : null })) // Add Date object
                .filter(p => p.dateObj && !isNaN(p.dateObj.getTime())); // Keep only valid dates

            const invalidDateProjects = projects
                .filter(p => !p.date || isNaN(new Date(p.date).getTime()));


            // Sort only the projects with valid dates
            validDateProjects.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()); // Oldest first

            // Combine sorted valid projects with invalid date projects at the end (or beginning if preferred)
            sortedProjects = [...validDateProjects, ...invalidDateProjects];


            // --- Render Timeline Items ---
            timelineItems = []; // Clear previous items if any
            let previousProjectDate = null; // Track last VALID date

            sortedProjects.forEach((project, index) => {
                const timelineItem = document.createElement('div');
                timelineItem.classList.add('timeline-item', index % 2 === 0 ? 'timeline-item-left' : 'timeline-item-right');
                // Add data attribute for date (useful for progress bar text)
                if (project.dateObj && !isNaN(project.dateObj.getTime())) {
                   timelineItem.dataset.date = project.dateObj.toISOString();
                }


                // --- Calculate and Apply Dynamic Spacing ---
                let calculatedMargin = 0;
                const currentProjectDate = project.dateObj; // Already validated or null
                const isValidDate = currentProjectDate && !isNaN(currentProjectDate.getTime());

                if (index > 0) { // Apply spacing only after the first item
                    if (previousProjectDate && isValidDate) {
                        const timeDifferenceMs = currentProjectDate.getTime() - previousProjectDate.getTime();
                        const timeDifferenceDays = Math.max(0, timeDifferenceMs / MS_PER_DAY);

                        calculatedMargin = MIN_SPACING_PX + (timeDifferenceDays * PX_PER_DAY);
                        calculatedMargin = Math.max(MIN_SPACING_PX, Math.min(MAX_SPACING_PX, calculatedMargin));
                    } else {
                        // Use minimum spacing if previous or current date is invalid/missing
                        calculatedMargin = MIN_SPACING_PX;
                    }
                    timelineItem.style.marginTop = `${calculatedMargin}px`;
                }
                // End Spacing Calculation

                // Update previous date ONLY if the current date was valid
                if (isValidDate) {
                   previousProjectDate = currentProjectDate;
                }

                // --- Format Date for Display ---
                let displayDate = 'Date N/A';
                if (isValidDate) {
                    displayDate = currentProjectDate.toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                    }).toUpperCase();
                }

                // --- Get Image and Category ---
                const firstImage = project.images && project.images.length > 0 ? project.images[0] : null;
                const imagePath = firstImage ? `assets/${firstImage}` : '';
                const category = project.tags && project.tags.length > 0 ? project.tags[0].toUpperCase() : '';

                // --- Generate HTML ---
                timelineItem.innerHTML = `
                    <div class="timeline-marker"></div>
                    <div class="timeline-card">
                        ${imagePath ? `
                        <div class="card-image-container">
                           <img src="${imagePath}" alt="${project.title || 'Project image'}" loading="lazy">
                        </div>` : '<div class="card-image-container"></div>'}
                        <div class="card-content">
                            <div class="card-header">
                                <span class="card-date">${displayDate}</span>
                                ${category ? `<span class="card-category">${category}</span>` : ''}
                                ${category ? `<span class="separator">-</span>` : ''} <!-- Add separator dynamically -->
                            </div>
                            <h3 class="card-title">${project.title || 'Untitled Project'}</h3>
                            <p class="card-description">${project.description || 'No description available.'}</p>
                            ${project.link ? `<p class="card-link"><a href="${project.link}" target="_blank" rel="noopener noreferrer">View Project</a></p>` : ''}
                        </div>
                    </div>
                `;
                timelineContainer.appendChild(timelineItem);
                timelineItems.push(timelineItem); // Store item reference
            });
            // --- END Rendering ---

            // Set up the progress bar elements and add scroll listener
            setupProgressBar();
            addScrollListener();
            // Initial update after layout calculation
            requestAnimationFrame(updateProgressBarOnScroll);


        } catch (error) {
            console.error('Error fetching or displaying projects:', error);
            if (initialLoadingMessage) initialLoadingMessage.remove();
            timelineContainer.innerHTML = `<p class="error-message">Error loading projects: ${error.message}. Please check the console.</p>`;
        }
    }

    // --- Progress Bar Setup ---
    function setupProgressBar() {
        progressBarElement = document.getElementById('progress-bar');
        if (!progressBarElement) {
           progressBarElement = document.createElement('footer');
           progressBarElement.id = 'progress-bar';
           // Match reference structure more closely
           progressBarElement.innerHTML = `
              <span id="progress-bar-text">Timeline Start</span> <!-- Combined text -->
              <div class="progress-bar-visual">
                 <div class="progress-bar-track">
                    <div id="progress-bar-indicator"></div>
                 </div>
                 <span id="progress-bar-percentage">0%</span>
                 <span id="progress-bar-icon"></span> <!-- Icon from CSS -->
              </div>
           `;
           document.body.appendChild(progressBarElement);
        }
        // Get references to the inner elements
        progressBarTextElement = document.getElementById('progress-bar-text');
        progressBarIndicatorElement = document.getElementById('progress-bar-indicator');
        progressBarPercentageElement = document.getElementById('progress-bar-percentage');
    }

    // --- Scroll Handler ---
    function updateProgressBarOnScroll() {
        if (!progressBarIndicatorElement || !progressBarTextElement || !progressBarPercentageElement || timelineItems.length === 0) {
            // console.log("Progress bar elements or timeline items not ready.");
            return;
        }

        // --- Calculate Scroll Percentage ---
        const timelineTop = timelineContainer.offsetTop; // Top position of the timeline container
        const timelineHeight = timelineContainer.offsetHeight; // Total height of the timeline content
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;

        // Calculate how far the user has scrolled *within* the timeline content area
        // Start percentage calculation when the top of the timeline container enters the viewport
        const scrollStartOffset = timelineTop;
        // Consider the scrollable range to be the timeline height minus the viewport height
        // (once the bottom of the timeline hits the bottom of the viewport, you're at 100%)
        const totalScrollableDistance = timelineHeight - viewportHeight;

        let currentScrollPositionInTimeline = scrollY - scrollStartOffset;

        // Clamp the scroll position within the timeline bounds (0 to totalScrollableDistance)
        currentScrollPositionInTimeline = Math.max(0, Math.min(currentScrollPositionInTimeline, totalScrollableDistance));

        let scrollPercentage = 0;
        if (totalScrollableDistance > 0) {
             scrollPercentage = (currentScrollPositionInTimeline / totalScrollableDistance) * 100;
        } else if (scrollY + viewportHeight >= timelineTop + timelineHeight) {
             // If timeline is shorter than viewport height, set to 100% when fully visible
             scrollPercentage = 100;
        }

        // Clamp percentage between 0 and 100
        scrollPercentage = Math.max(0, Math.min(100, scrollPercentage));

        // Update Progress Bar Visuals
        progressBarIndicatorElement.style.width = `${scrollPercentage}%`;
        progressBarPercentageElement.textContent = `${Math.round(scrollPercentage)}%`;

        // --- Update Progress Bar Text (Date Range) ---
        // Find the item closest to the middle of the viewport
        const viewportCenterY = scrollY + viewportHeight / 2;
        let closestItem = null;
        let minDistance = Infinity;

        timelineItems.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const itemCenterY = window.scrollY + itemRect.top + itemRect.height / 2;
            const distance = Math.abs(viewportCenterY - itemCenterY);

            if (distance < minDistance) {
                minDistance = distance;
                closestItem = item;
            }
        });

        // Update text based on the closest item's date
        if (closestItem && closestItem.dataset.date) {
             try {
                 const itemDate = new Date(closestItem.dataset.date);
                 if (!isNaN(itemDate.getTime())) {
                      // Format: Month YYYY (e.g., July 2022)
                      const monthYear = itemDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                      progressBarTextElement.textContent = monthYear;
                 } else {
                     progressBarTextElement.textContent = "Current View"; // Fallback
                 }
             } catch (e) {
                  progressBarTextElement.textContent = "Current View"; // Fallback on error
                  console.error("Error parsing date from dataset:", e);
             }
        } else if (timelineItems.length > 0 && timelineItems[0].dataset.date) {
            // Fallback to first item's date range if no item is centered
            const firstDate = new Date(timelineItems[0].dataset.date);
             const lastDate = new Date(timelineItems[timelineItems.length - 1].dataset.date);
             if (!isNaN(firstDate.getTime()) && !isNaN(lastDate.getTime())) {
                 progressBarTextElement.textContent = `${firstDate.getFullYear()} - ${lastDate.getFullYear()}`;
             } else {
                 progressBarTextElement.textContent = "Timeline Range";
             }

        } else {
             progressBarTextElement.textContent = "Timeline"; // Default
        }

        // Request next frame for smooth animation (optional but good practice)
        // requestAnimationFrame(updateProgressBarOnScroll); // Creates a loop, use throttling instead
    }


    // --- Throttled Scroll Listener ---
    // Avoid running the update function too frequently on scroll
    let isThrottled = false;
    function throttledScrollHandler() {
        if (!isThrottled) {
            isThrottled = true;
            requestAnimationFrame(() => { // Use rAF for smooth visual updates
                updateProgressBarOnScroll();
                isThrottled = false;
            });
        }
    }

    function addScrollListener() {
       // Remove existing listener first to avoid duplicates if fetchProjects is called again
       window.removeEventListener('scroll', throttledScrollHandler);
       window.removeEventListener('resize', throttledScrollHandler); // Also update on resize

       // Add the throttled listener
       window.addEventListener('scroll', throttledScrollHandler);
       window.addEventListener('resize', throttledScrollHandler);
    }

    // --- Initial Load ---
    fetchProjects(); // Fetch data, render items, setup progress bar, add listener
});
