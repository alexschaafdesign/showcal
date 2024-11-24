import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '../assets/images/venuecoverimages')));

// Validate required environment variables
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

// Log database connection status
pool.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
  } else {
    console.log("Database connected successfully.");
  }
});

// Query to join shows and venues
const showsWithVenuesQuery = `
  SELECT 
    shows.id AS show_id,
    shows.bands,
    shows.flyer_image,
    shows.event_link,
    shows.start,
    shows.venue_id, 
    venues.venue AS venue_name,
    venues.location,
    venues.capacity,
    bands.id AS band_id,
    bands.band AS band_name
  FROM 
    shows
  JOIN 
    venues 
  ON 
    shows.venue_id = venues.id
  LEFT JOIN 
    bands
  ON 
    bands.id = ANY(shows.bands)
`;


// Unified endpoint for fetching data
app.get('/tcup', async (req, res) => {
  const { table } = req.query;

  try {
    let result;

    if (table === 'bands') {
      const bandsQuery = `
        SELECT id, band, social_links FROM bands;
      `;
      result = await pool.query(bandsQuery);
    } else if (table === 'shows') {
      result = await pool.query(showsWithVenuesQuery);
    } else if (table === 'venues') {
      const venuesQuery = `
        SELECT id, venue, location, capacity, cover_image FROM venues;
      `;
      result = await pool.query(venuesQuery);
    } else {
      return res.status(400).json({ error: "Invalid table parameter" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(`Error fetching ${table} data:`, err.message);
    res.status(500).json({ error: `Error fetching ${table} data` });
  }
});

// Get specific band by id
app.get('/tcup/bands/:id', async (req, res) => {
  const bandId = req.params.id; // Extract the band ID or name

  if (!bandId) {
    return res.status(400).json({ error: 'Invalid band ID' });
  }

  try {
    const query = 'SELECT * FROM bands WHERE id = $1 OR band ILIKE $1';
    const { rows } = await pool.query(query, [bandId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Band not found' });
    }

    res.json(rows[0]); // Return the band data
  } catch (error) {
    console.error('Error fetching band:', error);
    res.status(500).json({ error: 'Failed to fetch band' });
  }
});

// Fetch shows filtered by venue ID
app.get('/tcup/shows', async (req, res) => {
  const { venue } = req.query; // `venue` is the venue_id passed from the frontend

  try {
    let query = showsWithVenuesQuery; // Base query with JOIN to fetch venue details
    const values = [];

    if (venue) {
      query += ' WHERE shows.venue_id = $1'; // Filter by venue_id
      values.push(venue);
    }

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No shows found for this venue' });
    }
    res.json(rows); // Send the shows data, including bands
  } catch (error) {
    console.error('Error fetching shows:', error);
    res.status(500).json({ error: 'Failed to fetch shows' });
  }
});

// Fetch a specific venue by ID
app.get('/tcup/venues/:id', async (req, res) => {
  const venueId = req.params.id;

  try {
    const query = 'SELECT * FROM venues WHERE id = $1';
    const { rows } = await pool.query(query, [venueId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching venue:', error);
    res.status(500).json({ error: 'Failed to fetch venue' });
  }
});

app.post('/tcup/bands', async (req, res) => {
  const { band, social_links } = req.body;

  try {
    const query = `
      INSERT INTO bands (band, social_links)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [band, social_links ? JSON.stringify(social_links) : null];
    const { rows } = await pool.query(query, values);

    res.status(201).json({ message: 'Band added successfully!', band: rows[0] });
  } catch (error) {
    console.error('Error adding band:', error);
    res.status(500).json({ error: 'Failed to add band' });
  }
});

app.post('/tcup/shows', async (req, res) => {
  const { venue_id, bands, flyer_image, event_link, start } = req.body;

  try {
    const query = `
      INSERT INTO shows (venue_id, bands, flyer_image, event_link, start)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [venue_id, bands, flyer_image, event_link, start];
    const { rows } = await pool.query(query, values);

    res.status(201).json({ message: 'Show added successfully!', show: rows[0] });
  } catch (error) {
    console.error('Error adding show:', error);
    res.status(500).json({ error: 'Failed to add show' });
  }
});

// Add a new venue
app.post('/tcup/venues', async (req, res) => {
  const { venue, location, capacity, cover_image } = req.body;

  try {
    const query = `
      INSERT INTO venues (id, venue, location, capacity, cover_image)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [venue, location, capacity, cover_image];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error adding venue:', error);
    res.status(500).json({ error: 'Failed to add venue' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});