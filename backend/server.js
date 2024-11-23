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

app.use(cors());
app.use(express.json());

pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
  } else {
    console.log("Database connected successfully.");
  }
  release();
});

// Serve static files
app.use('/images', express.static(path.join(__dirname, '../assets/images/venuecoverimages')));

// Unified query for events with venue details
const unifiedQuery = `
  SELECT 
    sc.id,
    sc.bands,
    sc.event_link,
    sc.flyer_image,
    sc.other_info,
    sc.venue,
    sc.start,
    vt.location,
    vt.capacity
  FROM 
    shows sc
  LEFT JOIN 
    venues vt 
  ON 
    sc.venue = vt.venue;
`;

// Query for bands
const bandsQuery = `
  SELECT 
    id,
    band,
    social_links
  FROM 
    bands;
`;

// Query for venues
const venuesQuery = `
  SELECT 
    venue,
    location,
    capacity,
    cover_image
  FROM 
    venues;
`;

// Unified endpoint for fetching data from any table
app.get('/tcup', async (req, res) => {
  const { table } = req.query;

  try {
    let result;

    if (table === 'bands') {
      console.log("Fetching bands data...");
      result = await pool.query(bandsQuery);
      const bands = result.rows.map(band => {
        let socialLinks = null;

        if (band.social_links) {
          try {
            socialLinks = typeof band.social_links === 'string'
              ? JSON.parse(band.social_links)
              : band.social_links;
          } catch (err) {
            console.error(`Error parsing social links for band ${band.band}:`, err);
            socialLinks = null;
          }
        }

        return {
          id: band.id,
          band: band.band,
          socialLinks,
        };
      });
      return res.json(bands);

    } else if (table === 'shows') {
      console.log("Fetching shows data...");
      result = await pool.query(unifiedQuery);
      const shows = result.rows.map(show => ({
        id: show.id,
        eventLink: show.event_link,
        flyerImage: show.flyer_image,
        otherInfo: show.other_info,
        venue: show.venue,
        bands: show.bands,
        start: new Date(show.start).toISOString(),
        location: show.location,
        capacity: show.capacity,
      }));
      return res.json(shows);

    } else if (table === 'venues') {
      console.log("Fetching venues data...");
      result = await pool.query(venuesQuery);
      const venues = result.rows.map(venue => ({
        venue: venue.venue,
        location: venue.location,
        capacity: venue.capacity,
        coverImage: venue.cover_image,
      }));
      return res.json(venues);

    } else {
      return res.status(400).json({ error: "Invalid table parameter" });
    }
  } catch (err) {
    console.error(`Error fetching ${table} data:`, err.message);
    res.status(500).json({ error: `Error fetching ${table} data` });
  }
});

// Endpoint to fetch a band by ID
app.get('/tcup/bands/:id', async (req, res) => {
  const bandId = req.params.id;

  try {
    const { rows } = await pool.query('SELECT * FROM bands WHERE id = $1', [bandId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Band not found' });
    }

    // Parse social_links JSON if necessary
    let band = rows[0];
    if (band.social_links) {
      try {
        band.social_links = JSON.parse(band.social_links);
      } catch (err) {
        console.error(`Error parsing social_links for band ID ${bandId}:`, err);
      }
    }

    res.status(200).json(band);
  } catch (error) {
    console.error('Error fetching band:', error);
    res.status(500).json({ error: 'Failed to fetch band' });
  }
});

// Endpoint to fetch shows for a specific band
app.get('/tcup/shows/:id', async (req, res) => {
  const bandId = req.params.id;

  try {
    const { rows } = await pool.query('SELECT * FROM shows WHERE bands ILIKE $1', [`%${bandId}%`]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "No shows found for this band" });
    }

    res.json(rows);
  } catch (error) {
    console.error('Error fetching shows for band:', error);
    res.status(500).send('Error fetching shows for band');
  }
});


// Endpoint to edit a band's profile
app.put('/tcup/bands/:id/edit', async (req, res) => {
  const { id } = req.params;
  const { band, social_links, genre, contact, open_to_requests, band_size_options } = req.body;

  try {
    const query = `
      UPDATE bands
      SET 
        band = $1, 
        social_links = $2, 
        genre = $3, 
        contact = $4, 
        open_to_requests = $5, 
        band_size = $6
      WHERE id = $7
      RETURNING *;
    `;
    const values = [
      band,
      social_links,
      genre,
      contact,
      open_to_requests,
      band_size_options,
      id,
    ];

    const result = await pool.query(query, values);

    console.log('Received PUT request:', { id, body: req.body });

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Band not found' });
    }

    res.status(200).json({ message: 'Band updated successfully!', band: result.rows[0] });
  } catch (error) {
    console.error('Error updating band:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Endpoint to fetch a specific venue's details
app.get('/tcup/venues/:venueName', (req, res) => {
  const venueName = req.params.venueName;

  pool.query('SELECT * FROM venues WHERE venue = $1', [venueName], (error, result) => {
    if (error) {
      console.error('Error fetching venue data:', error);
      res.status(500).json({ error: "Database error" });
    } else if (result.rows.length === 0) {
      res.status(404).json({ error: "Venue Not Found" });
    } else {
      res.json(result.rows[0]);
    }
  });
});

// Endpoint to add a new band
app.post('/tcup/add-band', (req, res) => {
  const { band, socialLinks } = req.body;

  const query = 'INSERT INTO bands (band, social_links) VALUES ($1, $2) RETURNING *';
  const values = [band, JSON.stringify(socialLinks)];

  pool.query(query, values, (error, result) => {
    if (error) {
      console.error('Error adding band:', error);
      res.status(500).send('Error adding band');
    } else {
      res.status(201).json({ message: 'Band added successfully!', band: result.rows[0] });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});