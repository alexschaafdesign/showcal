import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import axios from 'axios'; // Import axios for Figma API calls

const { Pool } = pkg;

const app = express();  // Ensure app is initialized
const PORT = process.env.PORT || 3001;

const pool = new Pool({
  user: 'aschaaf',
  host: 'localhost',
  database: 'venues',
  password: 'notthesame',  // Replace with your actual password
  port: 5432,
});

// Figma configuration
const FILE_ID = 'NBHU5lsSfPTBMnlFVPxHNB';  // Your Figma file ID
const FIGMA_TOKEN = 'figd_9IgwTEDRk2P6kWhTjRvtOmkFcAKniW9pPya9ohwA';  // Replace with your Figma token
const BASE_URL = 'https://api.figma.com/v1';

app.use(cors());
app.use(express.json());

// Endpoint to fetch events from the database
app.get('/events', async (req, res) => {
  try {
    console.log("Received request to /events");

    // Query to fetch events from the view that includes min_capacity and max_capacity
    const result = await pool.query(`
      SELECT 
        id, 
        title, 
        url, 
        flyerImage, 
        description, 
        venue, 
        start,
        min_capacity,
        max_capacity
      FROM "Combined Tables"
    `);

    console.log("Query Result:", result.rows);  // Log the query result to the console

    // Map the results to the correct structure
    const events = result.rows.map(event => {
      const startDate = new Date(event.start);

      if (isNaN(startDate.getTime())) {
        console.error('Invalid start date:', event.start);
        return null;  // Return null for invalid events
      }

      return {
        id: event.id,
        title: event.title,
        start: startDate.toISOString(),
        description: event.description,
        venue: event.venue,
        url: event.url,
        flyerImage: event.flyerImage,
        minCapacity: event.min_capacity,  // Include min_capacity
        maxCapacity: event.max_capacity   // Include max_capacity
      };
    }).filter(event => event !== null);  // Filter out any invalid events

    console.log("Formatted Events:", events);  // Log the formatted events
    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: 'Error fetching events' });
  }
});

// Figma API route to get Figma file data
app.get('/figma-data', async (req, res) => {
  try {
    // Set up the request configuration
    const config = {
      headers: {
        'X-Figma-Token': FIGMA_TOKEN,  // Your Figma personal access token
      },
    };

    // Make a GET request to the Figma API
    const response = await axios.get(`${BASE_URL}/files/${FILE_ID}`, config);

    console.log("Figma File Data:", response.data); // Log the data for debugging
    res.json(response.data); // Send the data back to the frontend
  } catch (error) {
    console.error('Error fetching Figma data:', error);
    res.status(500).json({ error: 'Error fetching Figma data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});