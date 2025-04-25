// File Location: ComSci-Projects/A6-Final/script.js

document.addEventListener('DOMContentLoaded', () => {
    const timelineContainer = document.getElementById('timeline-container');

    // --- CONFIGURATION FOR DYNAMIC SPACING ---
    const MIN_SPACING_PX = 60; // Minimum vertical space (pixels) between cards
    const MAX_SPACING_PX = 500; // Maximum vertical space
    // Define scaling factor: pixels per unit of time difference
    // Adjust these values to control how much space corresponds to a given time gap
    const MS_PER_PX = 1000 * 60 * 60 * 24 * 1; // 1 day in milliseconds corresponds to 1 pixel
    // Example: if diff is 30 days (1 month), extra spacing is 30 * (1000*60*60*24) / MS_PER_PX
    // If MS_PER_PX = 1 day, 30 days difference adds 30px.
    // If MS_PER_PX = 0.5 day, 30 days difference adds 60px.
    // Let's make 1 month difference add ~50px extra spacing:
    // 1 month ~ 30.44 days
    // We want 30.44 days / (MS_PER_PX / (1000*60*60*24)) * 1px_scaling = 50px
    // If 1px_scaling is 1, MS_PER_PX would be (30.44 * day_ms) / 50 = ~0.6 day in MS
    // Let's use days as the unit for calculation clarity.
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const PX_PER_DAY = 1; // How many pixels per day difference (adjust this value!)


    async function fetchProjects() {
        try {
            // Ensure this matches the API path configured in vercel.json
            const response = await fetch('/api/a6-timeline-projects');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const projects = await response.json();

            timelineContainer.innerHTML = ''; // Clear loading message

            if (!projects || projects.length === 0) {
                timelineContainer.innerHTML = '<p>No projects found.</p>';
                return;
            }

            // Sort projects by date (oldest first is CRUCIAL for spacing logic)
            projects.sort((a, b) => {
                const dateA = a && a.date ? new Date(a.date) : new Date(0);
                const dateB = b && b.date ? new Date(b.date) : new Date(0);
                // Use getTime() for reliable comparison
                if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0; // Handle invalid dates during sort
                return dateA.getTime() - dateB.getTime(); // Sort oldest first by timestamp
            });

            let previousProjectDate = null; // Keep track of the last project's date (Date object)

            projects.forEach((project, index) => {
                const timelineItem = document.createElement('div');
                timelineItem.classList.add('timeline-item', index % 2 === 0 ? 'timeline-item-left' : 'timeline-item-right');

                // --- CALCULATE DYNAMIC SPACING ---
                let currentProjectDate = null;
                if (project.date) {
                    const dateObj = new Date(project.date);
                    // Check if the date object is valid before using it
                    if (!isNaN(dateObj.getTime())) {
                        currentProjectDate = dateObj;
                    } else {
                         console.warn(`Invalid date string for project ${project.id}: "${project.date}". Using minimum spacing.`);
                    }
                } else {
                     console.warn(`Missing date for project ${project.id}. Using minimum spacing.`);
                }


                let calculatedMargin = MIN_SPACING_PX; // Default spacing

                if (index > 0 && previousProjectDate && currentProjectDate) {
                    // Calculate time difference in days
                    const timeDifferenceMs = currentProjectDate.getTime() - previousProjectDate.getTime();
                    const timeDifferenceDays = timeDifferenceMs / MS_PER_DAY;

                    // Calculate spacing based on days, scale, and clamp
                    calculatedMargin = MIN_SPACING_PX + (timeDifferenceDays * PX_PER_DAY);
                    calculatedMargin = Math.max(MIN_SPACING_PX, Math.min(MAX_SPACING_PX, calculatedMargin));

                    // Add an extra base margin after the first item if you want more space
                    // calculatedMargin += (index === 1 ? 50 : 0); // Example: add 50px after the very first item

                     // console.log(`Project ${project.id} (${project.date}): Diff from prev = ${timeDifferenceDays.toFixed(1)} days. Margin = ${calculatedMargin.toFixed(1)}px`); // Debugging log
                } else if (index === 0) {
                    // First item has no margin-top from previous
                    calculatedMargin = 0;
                } else {
                    // If previous or current date is invalid, use minimum spacing
                     calculatedMargin = MIN_SPACING_PX;
                }

                timelineItem.style.marginTop = `${calculatedMargin}px`;

                // Update previous date for the next iteration, only if the current date was valid
                if (currentProjectDate) {
                   previousProjectDate = currentProjectDate;
                }
                // --- END SPACING CALCULATION ---


                // --- Format Date ---
                let displayDate = 'Date N/A';
                if (currentProjectDate) { // Use the validated date object
                    displayDate = currentProjectDate.toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                    }).toUpperCase();
                }

                // --- Get First Image ---
                const firstImage = project.images && project.images.length > 0 ? project.images[0] : null;
                // --- CONSTRUCT IMAGE PATH --- assumes assets folder sibling to index.html
                // Path from the perspective of index.html, which is in A6-Final
                const imagePath = firstImage ? `assets/${firstImage}` : ''; // e.g. ComSci-Projects/A6-Final/assets/image.jpg

                // --- Get Category Tag (example: use first tag) ---
                const category = project.tags && project.tags.length > 0 ? project.tags[0].toUpperCase() : 'PROJECT';


                // --- Generate HTML Structure ---
                timelineItem.innerHTML = `
                    <div class="timeline-marker"></div>
                    <div class="timeline-card">
                        ${imagePath ? `
                        <div class="card-image-container">
                           <img src="${imagePath}" alt="${project.title || 'Project image'}">
                        </div>` : ''}
                        <div class="card-content">
                            <div class="card-header">
                                <span class="card-date">${displayDate}</span>
                                ${category ? `<span class="card-category">${category}</span>` : ''}
                            </div>
                            <h3 class="card-title">${project.title || 'Untitled Project'}</h3>
                            <p class="card-description">${project.description || 'No description available.'}</p>
                            ${project.link ? `<p><a href="${project.link}" target="_blank" rel="noopener noreferrer">View Project</a></p>` : ''}
                            <!-- Add more project details here if needed -->
                        </div>
                    </div>
                `;
                timelineContainer.appendChild(timelineItem);
            });
            // --- END HTML GENERATION ---

             // --- PROGRESS BAR UPDATE (Placeholder) ---
             // Call this *after* all items are added, so the total height is somewhat available (though scroll position needed for value)
            setupProgressBar();


        } catch (error) {
            console.error('Error fetching or displaying projects:', error);
            timelineContainer.innerHTML = `<p style="color: red;">Error loading projects. Please check the console.</p>`;
        }
    }

    // --- Progress Bar Setup (Visuals Only For Now) ---
    function setupProgressBar() {
        let progressBar = document.getElementById('progress-bar');
        if (!progressBar) {
           progressBar = document.createElement('footer');
           progressBar.id = 'progress-bar';
           progressBar.innerHTML = `
              <div id="progress-bar-text">Calculating Progress...</div>
              <div class="progress-bar-track">
                 <div id="progress-bar-indicator" style="width: 0%;"></div>
              </div>
           `;
           document.body.appendChild(progressBar);
        }

        // Placeholder Update (requires scroll listener for real logic)
        const progressBarIndicator = document.getElementById('progress-bar-indicator');
        const progressText = document.getElementById('progress-bar-text');

        if (progressText) progressText.textContent = 'July - December 2022'; // Example static text
        if (progressBarIndicator) progressBarIndicator.style.width = '48%'; // Example static width
    }


    // Initial call to load projects and set up visuals when the page loads
    fetchProjects();

    // --- Scroll Listener for Progress Bar (IMPLEMENT LATER) ---
    // function updateProgressBarOnScroll() {
    //   // Calculate scroll position relative to total scrollable height
    //   // Update progressText (e.g., based on project dates in view)
    //   // Update progressBarIndicator width
    // }
    // window.addEventListener('scroll', updateProgressBarOnScroll);
    // window.addEventListener('resize', updateProgressBarOnScroll); // Also update on resize
    // Call initially after layout might have settled
    // setTimeout(updateProgressBarOnScroll, 100); // Give layout time to render

});