// server.js
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Make sure this path is correct
const venuesRouter = require('./routes/venues'); // Import the venues router

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Use CORS if needed
app.use(express.json()); // For parsing application/json

// Use the venues routes
app.use('/api', venuesRouter); // This sets the base path for your routes

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});