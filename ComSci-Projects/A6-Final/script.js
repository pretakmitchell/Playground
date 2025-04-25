// script.js
document.addEventListener('DOMContentLoaded', () => {
    const timelineContainer = document.getElementById('timeline-container');

    // Function to fetch project data from our API endpoint
    async function fetchProjects() {
        try {
            const response = await fetch('/api/a6-timeline-projects'); // Call our serverless function

            if (!response.ok) {
                // Throw an error if the response status is not 2xx
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const projects = await response.json(); // Parse the JSON response

            // Clear the 'Loading...' message
            timelineContainer.innerHTML = '';

            if (projects.length === 0) {
                timelineContainer.innerHTML = '<p>No projects found.</p>';
                return;
            }

            // Data is already sorted by date (newest first) by the server
            // If you wanted oldest first, you could sort here:
            // projects.sort((a, b) => new Date(a.date) - new Date(b.date));

            // Create and append HTML elements for each project
            projects.forEach(project => {
                const projectElement = document.createElement('div');
                projectElement.classList.add('timeline-entry'); // Add a class for styling

                // Format date for display (optional)
                const displayDate = new Date(project.date).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });

                projectElement.innerHTML = `
                    <h2>${project.title} (${project.id})</h2>
                    <p><em>Date: ${displayDate}</em></p>
                    <p>${project.description || 'No description available.'}</p>
                    ${project.images && project.images.length > 0
                        ? `<div class="images">Images: ${project.images.join(', ')}</div>` // Basic image list for now
                        : ''
                    }
                     ${project.tags && project.tags.length > 0
                        ? `<div class="tags">Tags: ${project.tags.join(', ')}</div>`
                        : ''
                    }
                    <hr>
                `;
                timelineContainer.appendChild(projectElement);
            });

        } catch (error) {
            console.error('Error fetching or displaying projects:', error);
            timelineContainer.innerHTML = `<p style="color: red;">Error loading projects. Please check the console.</p>`;
        }
    }

    // Initial call to load projects when the page loads
    fetchProjects();
});
