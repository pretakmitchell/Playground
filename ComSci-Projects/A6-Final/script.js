// File Location: Playground/ComSci-Projects/A6-Final/script.js

document.addEventListener('DOMContentLoaded', () => {
    const timelineContainer = document.getElementById('timeline-container');
    const initialLoadingMessage = document.querySelector('.loading-message');

    // --- CONFIGURATION FOR DYNAMIC SPACING ---
    const MIN_SPACING_PX = 60;    // Min vertical space (pixels) between cards
    const MAX_SPACING_PX = 450;   // Max vertical space for large gaps
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const PX_PER_DAY = 1.5;       // Pixels of margin added per day difference (TWEAK THIS VALUE!)

    async function fetchProjects() {
        try {
            // Ensure this matches the API path configured in vercel.json (relative to root)
            const response = await fetch('/api/a6-timeline-projects');

            if (!response.ok) {
                // Provide more specific error info if possible
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}. Response: ${errorText}`);
            }

            const projects = await response.json();

            // Clear loading or previous error message
            if (initialLoadingMessage) initialLoadingMessage.remove();
            timelineContainer.innerHTML = ''; // Clear any previous error messages rendered here

            if (!projects || !Array.isArray(projects) || projects.length === 0) {
                timelineContainer.innerHTML = '<p class="error-message">No projects found or data is invalid.</p>';
                console.warn("No projects found or received invalid data:", projects);
                return;
            }

            // Sort projects by date (oldest first is CRUCIAL for spacing logic)
            projects.sort((a, b) => {
                const dateA = a && a.date ? new Date(a.date) : null;
                const dateB = b && b.date ? new Date(b.date) : null;

                // Handle cases where dates might be null or invalid
                const timeA = dateA && !isNaN(dateA.getTime()) ? dateA.getTime() : Infinity; // Invalid dates sort last
                const timeB = dateB && !isNaN(dateB.getTime()) ? dateB.getTime() : Infinity;

                if (timeA === Infinity && timeB === Infinity) return 0; // Both invalid, keep order
                return timeA - timeB; // Sort oldest first by timestamp
            });

            let previousProjectDate = null; // Keep track of the last project's VALID date

            // --- Render Timeline Items ---
            projects.forEach((project, index) => {
                const timelineItem = document.createElement('div');
                timelineItem.classList.add('timeline-item', index % 2 === 0 ? 'timeline-item-left' : 'timeline-item-right');

                // --- Validate and Get Current Date ---
                let currentProjectDate = null;
                let isValidDate = false;
                if (project.date) {
                    const dateObj = new Date(project.date);
                    if (!isNaN(dateObj.getTime())) {
                        currentProjectDate = dateObj;
                        isValidDate = true;
                    } else {
                         console.warn(`Invalid date string for project ${project.id || '(no id)'}: "${project.date}". Using minimum spacing.`);
                    }
                } else {
                     console.warn(`Missing date for project ${project.id || '(no id)'}. Using minimum spacing.`);
                }

                // --- Calculate Dynamic Spacing ---
                let calculatedMargin = 0; // Default for the first item

                if (index > 0) { // Apply spacing only after the first item
                    if (previousProjectDate && isValidDate) {
                        // Calculate time difference ONLY if both dates are valid
                        const timeDifferenceMs = currentProjectDate.getTime() - previousProjectDate.getTime();
                        const timeDifferenceDays = Math.max(0, timeDifferenceMs / MS_PER_DAY); // Ensure non-negative diff

                        calculatedMargin = MIN_SPACING_PX + (timeDifferenceDays * PX_PER_DAY);
                        calculatedMargin = Math.max(MIN_SPACING_PX, Math.min(MAX_SPACING_PX, calculatedMargin));

                        // Debugging log - uncomment to check values
                        // console.log(`Project ${project.id} (${project.date}): Diff from prev = ${timeDifferenceDays.toFixed(1)} days. Margin = ${calculatedMargin.toFixed(1)}px`);
                    } else {
                        // If previous or current date is invalid/missing, use minimum spacing
                        calculatedMargin = MIN_SPACING_PX;
                         // console.log(`Project ${project.id}: Using min spacing due to invalid/missing dates.`);
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
                    }).toUpperCase(); // e.g., AUG 31, 2024
                }

                // --- Get Image ---
                const firstImage = project.images && project.images.length > 0 ? project.images[0] : null;
                // Path relative to the index.html file in A6-Final
                const imagePath = firstImage ? `assets/${firstImage}` : '';

                // --- Get Category ---
                const category = project.tags && project.tags.length > 0 ? project.tags[0].toUpperCase() : '';


                // --- Generate HTML ---
                timelineItem.innerHTML = `
                    <div class="timeline-marker"></div>
                    <div class="timeline-card">
                        ${imagePath ? `
                        <div class="card-image-container">
                           <img src="${imagePath}" alt="${project.title || 'Project image'}" loading="lazy"> <!-- Added lazy loading -->
                        </div>` : '<div class="card-image-container"></div>' /* Optional: Placeholder if no image */ }
                        <div class="card-content">
                            <div class="card-header">
                                <span class="card-date">${displayDate}</span>
                                ${category ? `<span class="card-category">${category}</span>` : ''}
                            </div>
                            <h3 class="card-title">${project.title || 'Untitled Project'}</h3>
                            <p class="card-description">${project.description || 'No description available.'}</p>
                            ${project.link ? `<p class="card-link"><a href="${project.link}" target="_blank" rel="noopener noreferrer">View Project</a></p>` : ''}
                        </div>
                    </div>
                `;
                timelineContainer.appendChild(timelineItem);
            });
            // --- END Rendering ---

            // Set up the progress bar elements after rendering timeline
            setupProgressBar();

        } catch (error) {
            console.error('Error fetching or displaying projects:', error);
            // Display error message in the container
             if (initialLoadingMessage) initialLoadingMessage.remove();
            timelineContainer.innerHTML = `<p class="error-message">Error loading projects: ${error.message}. Please check the console.</p>`;
        }
    }

    // --- Progress Bar Setup (Visuals Only) ---
    function setupProgressBar() {
        let progressBar = document.getElementById('progress-bar');
        if (!progressBar) {
           progressBar = document.createElement('footer');
           progressBar.id = 'progress-bar';
           progressBar.innerHTML = `
              <div id="progress-bar-text">Loading...</div>
              <div class="progress-bar-track">
                 <div id="progress-bar-indicator" style="width: 0%;"></div>
              </div>
           `;
           // Insert footer before the closing body tag if possible, or just append
           document.body.appendChild(progressBar);
        }

        // Placeholder Update - Real logic requires scroll listener
        const progressBarIndicator = document.getElementById('progress-bar-indicator');
        const progressText = document.getElementById('progress-bar-text');

        // Example static update based on your reference image
        if (progressText) progressText.textContent = 'July - December 2022';
        if (progressBarIndicator) progressBarIndicator.style.width = '48%';

        // TODO: Implement scroll listener to update text and width dynamically
    }

    // --- Initial Load ---
    fetchProjects();

});