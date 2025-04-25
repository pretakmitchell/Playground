// File Location: api/a6-timeline-projects.js

const fs = require('fs').promises; // Use promise-based fs
const path = require('path');

// Helper function to safely parse JSON
const safeJsonParse = (data, filename) => {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error parsing JSON from file: ${filename}`, error);
    return null; // Return null if parsing fails
  }
};

// Export the handler function using module.exports
module.exports = async (req, res) => {
  // --- MODIFIED PATH ---
  // Construct the absolute path to the A6-Final projects directory from the repo root
  const projectsDirectory = path.join(process.cwd(), 'ComSci-Projects', 'A6-Final', 'projects');
  console.log(`[API:a6] Reading projects from: ${projectsDirectory}`);

  try {
    // Read the contents of the projects directory
    const filenames = await fs.readdir(projectsDirectory);
    console.log(`[API:a6] Found files: ${filenames.join(', ')}`);

    // Filter for .json files only
    const jsonFilenames = filenames.filter(filename => path.extname(filename).toLowerCase() === '.json');
    console.log(`[API:a6] Found JSON files: ${jsonFilenames.join(', ')}`);

    if (jsonFilenames.length === 0) {
         console.log(`[API:a6] No JSON files found.`);
         return res.status(200).json([]); // Return empty array if no JSON found
    }

    // Read and parse all JSON files concurrently
    const projectsDataPromises = jsonFilenames.map(async (filename) => {
      const filePath = path.join(projectsDirectory, filename);
      try {
        console.log(`[API:a6] Reading file: ${filePath}`);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const projectData = safeJsonParse(fileContent, filename);
        return projectData;
      } catch (readError) {
        console.error(`[API:a6] Error reading file: ${filePath}`, readError);
        return null; // Skip this file if reading fails
      }
    });

    // Wait for all file reads and parses to complete
    const projectsData = (await Promise.all(projectsDataPromises))
      .filter(project => project !== null); // Filter out nulls from failed reads/parses

    console.log(`[API:a6] Successfully parsed ${projectsData.length} projects.`);

    // Sort projects by date (newest first) before sending
    projectsData.sort((a, b) => {
         const dateA = a && a.date ? new Date(a.date) : new Date(0); // Default to epoch if missing
         const dateB = b && b.date ? new Date(b.date) : new Date(0); // Default to epoch if missing
         if (isNaN(dateA) || isNaN(dateB)) {
             console.warn(`[API:a6] Invalid date found during sort: a.date=${a.date}, b.date=${b.date}`);
             return 0; // Avoid crash if date is invalid
         }
         return dateB - dateA;
    });

    console.log(`[API:a6] Sending project data to client.`);
    // Send the data back as a JSON response
    res.status(200).json(projectsData);

  } catch (error) {
    // Handle errors like directory not found, etc.
    console.error('[API:a6] CRITICAL ERROR fetching projects:', error); // Log the main error
    res.status(500).json({ error: 'Failed to load project data' });
  }
};