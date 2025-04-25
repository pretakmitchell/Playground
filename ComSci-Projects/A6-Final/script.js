// File Location: Playground/ComSci-Projects/A6-Final/script.js

document.addEventListener('DOMContentLoaded', () => {
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');

    // --- CONFIGURATION FOR DYNAMIC SPACING ---
    const MIN_SPACING_PX = 60;
    const MAX_SPACING_PX = 450;
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const PX_PER_DAY = 1.5; // Pixels margin per day difference

    // --- Variables for Progress Bar & Timeline Bounds ---
    let progressBarElement = null;
    let progressBarTextElement = null;
    let progressBarIndicatorElement = null;
    let progressBarPercentageElement = null;
    let timelineItems = [];
    let sortedProjects = []; // Keep the original data + date objects
    let timelineStartDate = null; // Earliest valid date object
    let timelineEndDate = null;   // Latest valid date object
    let timelineDurationMs = 0;   // Total time span in milliseconds

    async function fetchProjects() {
        try {
            const response = await fetch('/api/a6-timeline-projects'); // Verify this API path

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}. Response: ${errorText}`);
            }

            const projects = await response.json();

            if (initialLoadingMessage) initialLoadingMessage.remove();
            timelineContainer.innerHTML = '';

            if (!projects || !Array.isArray(projects) || projects.length === 0) {
                timelineContainer.innerHTML = '<p class="error-message">No projects found or data is invalid.</p>';
                return;
            }

            // --- Process, Validate, and Sort Projects ---
            const projectsWithDates = projects
                .map(p => ({ ...p, dateObj: p.date ? new Date(p.date) : null }))
                .map(p => ({ ...p, isValidDate: p.dateObj && !isNaN(p.dateObj.getTime()) }));

            // Separate valid and invalid dates for sorting and bounds calculation
            const validDateProjects = projectsWithDates.filter(p => p.isValidDate);
            const invalidDateProjects = projectsWithDates.filter(p => !p.isValidDate);

            if (validDateProjects.length === 0) {
                 timelineContainer.innerHTML = '<p class="error-message">No projects with valid dates found.</p>';
                 // Optionally render invalid date projects here if desired
                 return;
            }

            // Sort only the projects with valid dates
            validDateProjects.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()); // Oldest first

            // Determine timeline start/end dates and duration from VALID dates
            timelineStartDate = validDateProjects[0].dateObj;
            timelineEndDate = validDateProjects[validDateProjects.length - 1].dateObj;
            timelineDurationMs = timelineEndDate.getTime() - timelineStartDate.getTime();

            // Combine sorted valid projects with invalid date projects at the end
            sortedProjects = [...validDateProjects, ...invalidDateProjects];

            // --- Render Timeline Items ---
            timelineItems = [];
            let previousProjectDate = null; // Track last VALID date for spacing

            sortedProjects.forEach((project, index) => {
                const timelineItem = document.createElement('div');
                timelineItem.classList.add('timeline-item', index % 2 === 0 ? 'timeline-item-left' : 'timeline-item-right');
                 // Store ISO date string if valid, otherwise maybe an index or ID
                 timelineItem.dataset.identifier = project.isValidDate ? project.dateObj.toISOString() : `item-${index}`;


                // --- Calculate and Apply Dynamic Spacing ---
                let calculatedMargin = 0;
                const currentProjectDate = project.dateObj; // Already validated or null
                const isValidDate = project.isValidDate;

                if (index > 0) {
                    if (previousProjectDate && isValidDate) {
                        const timeDifferenceMs = currentProjectDate.getTime() - previousProjectDate.getTime();
                        const timeDifferenceDays = Math.max(0, timeDifferenceMs / MS_PER_DAY);

                        calculatedMargin = MIN_SPACING_PX + (timeDifferenceDays * PX_PER_DAY);
                        calculatedMargin = Math.max(MIN_SPACING_PX, Math.min(MAX_SPACING_PX, calculatedMargin));
                    } else {
                        calculatedMargin = MIN_SPACING_PX;
                    }
                    timelineItem.style.marginTop = `${calculatedMargin}px`;
                }

                // Update previous date ONLY if the current date was valid
                if (isValidDate) {
                   previousProjectDate = currentProjectDate;
                }
                // --- End Spacing Calculation ---

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
            // --- END Rendering ---

            setupProgressBar();
            addScrollListener();
            requestAnimationFrame(updateProgressBarOnScroll); // Initial update

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

    // --- Scroll Handler ---
    function updateProgressBarOnScroll() {
        // Ensure elements and required date info exist
        if (!progressBarIndicatorElement || !progressBarTextElement || !progressBarPercentageElement || !timelineStartDate || !timelineEndDate) {
            // console.log("Progress bar elements or timeline date range not ready.");
            if(progressBarTextElement) progressBarTextElement.textContent = "Timeline"; // Default text if no date range
            return;
        }

        // --- Calculate Scroll Percentage (same as before) ---
        const timelineTop = timelineContainer.offsetTop;
        const timelineHeight = timelineContainer.offsetHeight;
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;
        const scrollStartOffset = timelineTop;
        const totalScrollableDistance = Math.max(1, timelineHeight - viewportHeight); // Avoid division by zero
        let currentScrollPositionInTimeline = Math.max(0, scrollY - scrollStartOffset);
        currentScrollPositionInTimeline = Math.min(currentScrollPositionInTimeline, totalScrollableDistance);
        let scrollPercentage = (currentScrollPositionInTimeline / totalScrollableDistance) * 100;
        scrollPercentage = Math.max(0, Math.min(100, scrollPercentage));

        // Update Percentage Indicator
        progressBarIndicatorElement.style.width = `${scrollPercentage}%`;
        progressBarPercentageElement.textContent = `${Math.round(scrollPercentage)}%`;

        // --- Calculate and Update Interpolated Date Text ---
        let estimatedDate = timelineStartDate; // Default to start date

        if (timelineDurationMs > 0) { // Avoid calculation if duration is zero
            const timeOffset = timelineDurationMs * (scrollPercentage / 100);
            const estimatedTimeMs = timelineStartDate.getTime() + timeOffset;
            estimatedDate = new Date(estimatedTimeMs);
        }

        // Format the estimated date
        if (!isNaN(estimatedDate.getTime())) {
            const monthYear = estimatedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            progressBarTextElement.textContent = monthYear;
        } else {
            // Fallback if date calculation fails for some reason
            progressBarTextElement.textContent = "Timeline Date";
        }
    }

    // --- Throttled Scroll Listener (same as before) ---
    let isThrottled = false;
    function throttledScrollHandler() {
        if (!isThrottled) {
            isThrottled = true;
            requestAnimationFrame(() => {
                updateProgressBarOnScroll();
                isThrottled = false;
            });
        }
    }
    function addScrollListener() {
       window.removeEventListener('scroll', throttledScrollHandler);
       window.removeEventListener('resize', throttledScrollHandler);
       window.addEventListener('scroll', throttledScrollHandler);
       window.addEventListener('resize', throttledScrollHandler);
    }

    // --- Initial Load ---
    fetchProjects();
});
