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
    array_agg(json_build_object('id', bands.id, 'name', bands.band)) AS band_list
  FROM 
    shows
  JOIN 
    venues 
  ON 
    shows.venue_id = venues.id
  LEFT JOIN 
    show_bands
  ON 
    shows.id = show_bands.show_id
  LEFT JOIN 
    bands
  ON 
    show_bands.band_id = bands.id
  GROUP BY 
    shows.id, venues.id;
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

// Get specific band by ID
app.get('/tcup/bands/:id', async (req, res) => {
  const bandId = req.params.id;

  try {
    // Fetch band details
    const bandQuery = `
      SELECT id, band, social_links 
      FROM bands 
      WHERE id = $1
    `;
    const bandResult = await pool.query(bandQuery, [bandId]);

    if (bandResult.rows.length === 0) {
      return res.status(404).json({ error: 'Band not found' });
    }

    const band = bandResult.rows[0];

    // Fetch shows for this band
    const showsQuery = `
      SELECT 
        shows.id AS show_id,
        shows.start,
        shows.flyer_image,
        shows.event_link,
        venues.venue AS venue_name,
        venues.id AS venue_id
      FROM 
        shows
      JOIN 
        show_bands
      ON 
        shows.id = show_bands.show_id
      JOIN 
        venues
      ON 
        shows.venue_id = venues.id
      WHERE 
        show_bands.band_id = $1
      ORDER BY 
        shows.start ASC;
    `;
    const showsResult = await pool.query(showsQuery, [bandId]);

    res.json({
      band,
      shows: showsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching band details:', error.message);
    res.status(500).json({ error: 'Failed to fetch band details' });
  }
});

// Fetch shows filtered by venue ID
app.get('/tcup/shows', async (req, res) => {
  const { venue } = req.query; // Extract venue ID from query params

  try {
    // Query to fetch shows with venue and band details
    const query = `
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
        array_agg(json_build_object('id', bands.id, 'name', bands.band)) AS band_list
      FROM 
        shows
      JOIN 
        venues 
      ON 
        shows.venue_id = venues.id
      LEFT JOIN 
        show_bands
      ON 
        shows.id = show_bands.show_id
      LEFT JOIN 
        bands
      ON 
        show_bands.band_id = bands.id
      WHERE ($1::integer IS NULL OR shows.venue_id = $1)
      GROUP BY 
        shows.id, venues.id
      ORDER BY 
        shows.start ASC;
    `;

    // If `venue` is provided, filter by `venue_id`, otherwise fetch all shows
    const values = [venue || null];
    const { rows } = await pool.query(query, values);

    // Handle case when no results are found
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No shows found for this venue' });
    }

    // Return fetched shows
    res.json(rows);
  } catch (error) {
    // Log error for debugging and return a generic error message
    console.error('Error fetching shows:', error.message);
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

// Add a band
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

//Add a show
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

// Get a specific show by ID
app.get('/tcup/shows/:id', async (req, res) => {
  const showId = req.params.id;

  try {
    const query = `
      SELECT 
        shows.id AS show_id,
        shows.bands,
        shows.flyer_image,
        shows.event_link,
        shows.start,
        venues.venue AS venue_name,
        venues.location,
        venues.capacity
      FROM 
        shows
      JOIN 
        venues 
      ON 
        shows.venue_id = venues.id
      WHERE 
        shows.id = $1;
    `;
    const { rows } = await pool.query(query, [showId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Show not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching show:', error.message);
    res.status(500).json({ error: 'Failed to fetch show' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});