// File Location: Playground/ComSci-Projects/A6-Final/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');

    // --- Configuration ---
    // Adjust PX_PER_DAY to control timeline density/spacing
    const PX_PER_DAY = 1.5; // Pixels of vertical space representing one day
    const BASE_ITEM_OFFSET = 50; // Initial top offset for the first item
    const CARD_HEIGHT_ESTIMATE = 180; // Approx height for total height calc
    const MIN_SPACING_PX = 60;    // Min vertical space between cards (used if dates invalid)
    const MAX_SPACING_PX = 450;   // Max vertical space (clamp for large gaps)


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
            // Ensure API path is correct relative to the site root
            const response = await fetch('/api/a6-timeline-projects');

            if (!response.ok) {
                const errorText = await response.text(); // Get more details if possible
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}. Response: ${errorText}`);
            }

            const projects = await response.json();

            // Clear loading message
            if (initialLoadingMessage) initialLoadingMessage.remove();
            timelineContainer.innerHTML = ''; // Clear previous content/errors

            if (!projects || !Array.isArray(projects) || projects.length === 0) {
                displayErrorMessage('No projects found or data is invalid.');
                console.warn("No projects found or received invalid data:", projects);
                return;
            }

            // --- Process, Validate, and Sort Projects ---
            processAndSortProjects(projects);

            if (!timelineStartDate || !timelineEndDate) {
                 displayErrorMessage('Could not determine timeline range due to missing/invalid dates.');
                 // Optionally still render items without date-based spacing/progress
                 // renderTimelineItems(); // Call a modified render function if needed
                 return;
            }

            // --- Render Timeline Items ---
            renderTimelineItems();

            // --- Setup UI ---
            setupProgressBar();
            addScrollListener();
            // Initial update after rendering (ensure layout is calculated)
            requestAnimationFrame(updateProgressBarOnScroll);


        } catch (error) {
            console.error('Error fetching or displaying projects:', error);
            displayErrorMessage(`Error loading projects: ${error.message}. Please check the console.`);
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
        const invalidDateProjects = projectsWithDates.filter(p => !p.isValidDate);

        if (validDateProjects.length === 0) {
            timelineStartDate = null;
            timelineEndDate = null;
            timelineDurationDays = 0;
            // Combine invalid projects only if needed, keep sortedProjects for rendering
             sortedProjects = [...invalidDateProjects];
            return; // Exit if no valid dates to define range
        }

        // Sort only the projects with valid dates
        validDateProjects.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()); // Oldest first

        // Determine timeline start/end dates and duration
        timelineStartDate = validDateProjects[0].dateObj;
        timelineEndDate = validDateProjects[validDateProjects.length - 1].dateObj;
        const timelineDurationMs = timelineEndDate.getTime() - timelineStartDate.getTime();
        timelineDurationDays = Math.max(1, timelineDurationMs / MS_PER_DAY); // Ensure at least 1 day

        // Estimate total height based on duration and density
        calculatedTimelineHeight = BASE_ITEM_OFFSET + (timelineDurationDays * PX_PER_DAY) + CARD_HEIGHT_ESTIMATE;

        // Combine sorted valid projects with invalid date projects at the end
        sortedProjects = [...validDateProjects, ...invalidDateProjects];
    }


    // --- Helper: Render All Timeline Items ---
    function renderTimelineItems() {
        timelineItems = []; // Clear previous DOM references
        timelineContainer.style.position = 'relative'; // Needed for absolute children
        // Set container height dynamically to ensure scrollbar appears correctly
        timelineContainer.style.height = `${calculatedTimelineHeight}px`;


        let previousProjectDate = null; // Track last VALID date for spacing

        sortedProjects.forEach((project, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.classList.add('timeline-item', index % 2 === 0 ? 'timeline-item-left' : 'timeline-item-right');
            timelineItem.dataset.identifier = project.isValidDate ? project.dateObj.toISOString() : `item-invalid-${index}`;


            // --- Calculate and Apply Vertical Position ---
            let verticalPosition = BASE_ITEM_OFFSET; // Default for first/invalid date items early on

            if (project.isValidDate) {
                 // Calculate position based on difference from start date
                const timeDiffMs = project.dateObj.getTime() - timelineStartDate.getTime();
                const timeDiffDays = Math.max(0, timeDiffMs / MS_PER_DAY);
                verticalPosition = BASE_ITEM_OFFSET + (timeDiffDays * PX_PER_DAY);

                // Update previous valid date tracker
                previousProjectDate = project.dateObj;
            } else if (index > 0) {
                 // If current date is invalid, base position roughly on previous item's position + min spacing
                 // This is approximate, better would be to track last valid item's calculated position
                 const lastItem = timelineItems[timelineItems.length - 1];
                 const lastItemTop = lastItem ? parseFloat(lastItem.style.top || '0') : BASE_ITEM_OFFSET;
                 verticalPosition = lastItemTop + MIN_SPACING_PX; // Position below previous item
            }


            // Apply position using top relative to the container
            timelineItem.style.position = 'absolute';
            timelineItem.style.top = `${verticalPosition}px`;

             // Set left/right for side alignment (use width calc if needed)
             if (index % 2 === 0) { // Left item
                timelineItem.style.left = '0';
             } else { // Right item
                 timelineItem.style.left = '50%';
             }


            // --- Format Date for Display ---
            let displayDate = 'Date N/A';
            if (project.isValidDate) {
                displayDate = project.dateObj.toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                }).toUpperCase();
            }

            // --- Get Image and Category ---
            const firstImage = project.images && project.images.length > 0 ? project.images[0] : null;
            const imagePath = firstImage ? `assets/${firstImage}` : ''; // Path relative to index.html
            const category = project.tags && project.tags.length > 0 ? project.tags[0].toUpperCase() : '';

            // --- Generate HTML (Ensure class names match CSS) ---
            timelineItem.innerHTML = `
                <div class="timeline-marker"></div>
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
            timelineItems.push(timelineItem); // Store DOM reference
        });
    }


    // --- Progress Bar Setup (Create if needed, get refs) ---
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
        // Exit if elements or timeline date range aren't ready
        if (!progressBarIndicatorElement || !progressBarTextElement || !progressBarPercentageElement || !timelineStartDate || !timelineEndDate || calculatedTimelineHeight <= 0) {
            if(progressBarTextElement) progressBarTextElement.textContent = "Timeline"; // Default text
            return;
        }

        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;
        // Use scrollY directly as progress through the document
        // Calculate the total scrollable height of the *document* containing the timeline
        const pageHeight = document.documentElement.scrollHeight;
        const totalScrollableHeight = pageHeight - viewportHeight;

        if (totalScrollableHeight <= 0) { // Avoid division by zero if content fits viewport
             progressBarIndicatorElement.style.width = '100%';
             progressBarPercentageElement.textContent = `100%`;
             progressBarTextElement.textContent = timelineEndDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
             return;
        }


        // Calculate scroll percentage based on overall page scroll
        let scrollPercentage = (scrollY / totalScrollableHeight) * 100;
        scrollPercentage = Math.max(0, Math.min(100, scrollPercentage));

        // Update Percentage Indicator
        progressBarIndicatorElement.style.width = `${scrollPercentage}%`;
        progressBarPercentageElement.textContent = `${Math.round(scrollPercentage)}%`;

        // --- Calculate and Update Interpolated Date Text ---
        // Interpolate time based on the scroll percentage through the *total duration*
        let estimatedDate = timelineStartDate;
        if (timelineDurationDays > 0) {
            const daysOffset = timelineDurationDays * (scrollPercentage / 100);
            const estimatedTimeMs = timelineStartDate.getTime() + (daysOffset * MS_PER_DAY);
            estimatedDate = new Date(estimatedTimeMs);
        }

        // Format the estimated date
        if (!isNaN(estimatedDate.getTime())) {
            const monthYear = estimatedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            progressBarTextElement.textContent = monthYear;
        } else {
            progressBarTextElement.textContent = "Timeline Date"; // Fallback
        }
    }


    // --- Throttled Scroll Listener (Prevents performance issues) ---
    let isThrottled = false;
    function throttledScrollHandler() {
        if (!isThrottled) {
            isThrottled = true;
            // Use requestAnimationFrame for smoother updates tied to browser rendering
            requestAnimationFrame(() => {
                updateProgressBarOnScroll();
                isThrottled = false;
            });
        }
    }

    // --- Add Scroll/Resize Listeners ---
    function addScrollListener() {
       // Clean up previous listeners if function is called multiple times
       window.removeEventListener('scroll', throttledScrollHandler);
       window.removeEventListener('resize', throttledScrollHandler);
       // Add new listeners
       window.addEventListener('scroll', throttledScrollHandler);
       window.addEventListener('resize', throttledScrollHandler); // Update on resize too
    }

    // --- Initial Execution ---
    fetchProjects(); // Start the process

}); // End DOMContentLoaded
