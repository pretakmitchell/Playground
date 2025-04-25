// File Location: ComSci-Projects/A6-Final/script.js

document.addEventListener('DOMContentLoaded', () => {
    const timelineContainer = document.getElementById('timeline-container');

    async function fetchProjects() {
        try {
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

            // Sort projects by date (oldest first for timeline display)
            projects.sort((a, b) => {
                const dateA = a && a.date ? new Date(a.date) : new Date(0);
                const dateB = b && b.date ? new Date(b.date) : new Date(0);
                if (isNaN(dateA) || isNaN(dateB)) return 0;
                return dateA - dateB;
            });

            // --- MODIFIED HTML GENERATION ---
            projects.forEach((project, index) => {
                const timelineItem = document.createElement('div');
                // Add alternating classes for left/right positioning
                timelineItem.classList.add('timeline-item', index % 2 === 0 ? 'timeline-item-left' : 'timeline-item-right');

                // --- Format Date ---
                let displayDate = 'Date N/A';
                let displayMonthYear = ''; // For card header if needed
                if (project.date) {
                    const dateObj = new Date(project.date);
                    if (!isNaN(dateObj)) {
                        // Example formats - adjust as needed
                        displayDate = dateObj.toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                        }).toUpperCase(); // e.g., AUG 31, 2024
                         displayMonthYear = dateObj.toLocaleDateString('en-US', {
                            month: 'long', year: 'numeric'
                        }); // e.g., August 2024
                    }
                }

                // --- Get First Image ---
                const firstImage = project.images && project.images.length > 0 ? project.images[0] : null;
                // --- CONSTRUCT IMAGE PATH --- assumes assets folder sibling to index.html
                const imagePath = firstImage ? `assets/${firstImage}` : ''; // Adjust path if assets is elsewhere

                // --- Get Category Tag (example: use first tag) ---
                const category = project.tags && project.tags.length > 0 ? project.tags[0].toUpperCase() : 'PROJECT';

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
                                <span class="card-category">${category}</span>
                            </div>
                            <h3 class="card-title">${project.title || 'Untitled Project'}</h3>
                            <p class="card-description">${project.description || 'No description available.'}</p>
                        </div>
                    </div>
                `;
                timelineContainer.appendChild(timelineItem);
            });
            // --- END MODIFIED HTML GENERATION ---

        } catch (error) {
            console.error('Error fetching or displaying projects:', error);
            timelineContainer.innerHTML = `<p style="color: red;">Error loading projects. Please check the console.</p>`;
        }
    }

    fetchProjects();

    // --- PROGRESS BAR UPDATE (Placeholder - Requires scroll listener later) ---
    // We'll add the JS logic for this later if needed.
    // For now, the HTML/CSS will just display it.
    function updateProgressBar() {
        const progressBar = document.getElementById('progress-bar-indicator');
        const progressText = document.getElementById('progress-bar-text');
        if (!progressBar || !progressText) return;

        // Placeholder text for now
        progressText.textContent = 'July - December 2022'; // Example static text
        progressBar.style.width = '48%'; // Example static width
    }
    // Add placeholder progress bar HTML if it doesn't exist (optional)
    if (!document.getElementById('progress-bar')) {
       const footer = document.createElement('footer');
       footer.id = 'progress-bar';
       footer.innerHTML = `
          <div id="progress-bar-text">Scroll Progress</div>
          <div class="progress-bar-track">
             <div id="progress-bar-indicator"></div>
          </div>
       `;
       document.body.appendChild(footer);
    }
    updateProgressBar(); // Call once initially with placeholder values
});