// api/projects.js (Simplest Test)

// Use module.exports for CommonJS compatibility
module.exports = (req, res) => {
    // Try to log directly to the console where vercel dev runs
    console.log("--- API SIMPLE TEST: Handler function started ---");
  
    // Send a basic success response immediately
    res.status(200).json({ message: "API simple test function executed successfully." });
  
    // Log after sending response
    console.log("--- API SIMPLE TEST: Response sent ---");
  };