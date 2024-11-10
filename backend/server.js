import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({
  user: 'aschaaf',
  host: 'localhost',
  database: 'venues',
  password: 'notthesame',  // Replace with your actual password
  port: 5432,
});

app.use(cors());
app.use(express.json());

// Endpoint to fetch events from the database
app.get('/events', async (req, res) => {
  try {
    console.log("Received request to /events");

    // Query to fetch events from the database
    const result = await pool.query(`
      SELECT 
        id, 
        headliner AS title, 
        event_link AS url, 
        flyer_image AS flyerImage, 
        support AS description, 
        venue, 
        start  -- Now directly select the 'start' column
      FROM "Show Calendar"
    `);

    // Map the results to the correct structure
    const events = result.rows.map(event => {
      const startDate = new Date(event.start);
      
      // Ensure event.start is a valid Date object
      if (isNaN(startDate.getTime())) {
        console.error('Invalid start date:', event.start);
        return null;  // Return null for invalid events
      }

      return {
        id: event.id,
        title: event.title,
        start: startDate.toISOString(),  // Convert to ISO string for FullCalendar
        description: event.description,
        venue: event.venue,
        url: event.url,
        flyerImage: event.flyerImage
      };
    }).filter(event => event !== null);  // Filter out any invalid events

    res.json(events);  // Send the events as a response to the frontend
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: 'Error fetching events' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});