import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Log environment variables to confirm they are loaded
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME); // Should output 'tcup'
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost', // defaults to localhost if DB_HOST is not defined
  database: process.env.DB_NAME, // Now uses DB_NAME from .env
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

// Serve static files from the 'assets/images/venuecoverimages' folder
app.use('/images', express.static(path.join(__dirname, '../assets/images/venuecoverimages')));

// Endpoint to serve other content (if needed)
app.get('/', (req, res) => {
  res.send('Welcome to the venue image server');
});

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

// Query to fetch all band names and social media links from the bands table
const bandsQuery = `
  SELECT 
    band,
    social_links
  FROM 
    bands;
`;

// Query to fetch all venues with their details
const venuesQuery = `
  SELECT 
    venue,
    location,
    capacity,
    cover_image
  FROM 
    venues;
`;

// Single endpoint to fetch either bands, shows, or venues based on query parameter
app.get('/tcup', async (req, res) => {
  const { table } = req.query;
  console.log("Received table parameter:", table);  // Add this line

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
          band: band.band,
          socialLinks: socialLinks
        };
      });
      console.log("Fetched bands data:", bands);
      return res.json(bands);

    } else if (table === 'shows') {
      console.log("Fetching shows data...");
      result = await pool.query(unifiedQuery);
      const events = result.rows.map(event => {
        const startDate = new Date(event.start);

        return {
          id: event.id,
          eventLink: event.event_link,
          flyerImage: event.flyer_image,
          otherInfo: event.other_info,
          venue: event.venue,
          bands: event.bands,
          start: !isNaN(startDate.getTime()) ? startDate.toISOString() : null,
          location: event.location,
          capacity: event.capacity
        };
      });
      console.log("Fetched shows data:", events);
      return res.json(events);

    } else if (table === 'venues') {
      console.log("Fetching venues data...");
      result = await pool.query(venuesQuery);
      const venues = result.rows.map(venue => ({
        venue: venue.venue,
        location: venue.location,
        capacity: venue.capacity,
        cover_image: venue.cover_image, // Include cover_image in the response
      }));
      console.log("Fetched venues data:", venues);
      return res.json(venues);

    } else {
      return res.status(400).json({ error: "Invalid table parameter" });
    }
  } catch (err) {
    console.error(`Error fetching data for ${table}:`, err.message, err.stack);
    res.status(500).json({ error: `Error fetching ${table} data` });
  }
});

// Endpoint for band profile
app.get('/tcup/bands/:band', async (req, res) => {
  const band = decodeURIComponent(req.params.band); // Decode the band parameter
  const query = 'SELECT * FROM bands WHERE band = $1';
  try {
    const { rows } = await pool.query(query, [band]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Band Not Found" });
    }

    // Extract the band data
    const bandData = rows[0];

    // Parse social_links if it exists
    let socialLinks = null;
    if (bandData.social_links) {
      try {
        socialLinks = typeof bandData.social_links === 'string'
          ? JSON.parse(bandData.social_links)
          : bandData.social_links;
          console.log("Parsed socialLinks for band:", socialLinks);
      } catch (error) {
        console.error(`Error parsing social links for band ${band}:`, error);
      }
    }

    // Endpoint for all shows of a specific band
app.get('/tcup/shows/:band', async (req, res) => {
  const band = decodeURIComponent(req.params.band); // Decode the band name from the URL
  const query = 'SELECT * FROM shows WHERE bands ILIKE $1';
  const values = [`%${band}%`];

  try {
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: "No shows found for this band" });
    }
    res.json(rows);
  } catch (error) {
    console.error('Error fetching shows for band:', error);
    res.status(500).send('Error fetching shows for band');
  }
});

    // Format response with parsed socialLinks
    res.json({
      band: bandData.band,
      socialLinks: socialLinks
    });
  } catch (error) {
    console.error('Error fetching band data:', error);
    res.status(500).send('Error fetching band data');
  }
});

// Endpoint for individual venue profile
app.get('/tcup/venues/:venueName', (req, res) => {
  const venueName = req.params.venueName;
  // Query your database to find the venue by name
  const query = `SELECT * FROM venues WHERE venue = $1`;
  pool.query(query, [venueName], (error, result) => {
      if (error) {
          res.status(500).json({ error: "Database error" });
      } else if (result.rows.length === 0) {
          res.status(404).json({ error: "Venue Not Found" });
      } else {
          res.json(result.rows[0]);
      }
  });
});

// Endpoint for past shows
app.get('/tcup/shows', async (req, res) => {
  const { band, past } = req.query;
  let query = 'SELECT * FROM shows WHERE bands ILIKE $1';
  let values = [`%${band}%`];

  if (past) {
    query += ' AND start < NOW()';
  }

  try {
    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching past shows:', error);
    res.status(500).send('Error fetching past shows');
  }
});

app.post('/tcup/add-band', (req, res) => {
  const { band, socialLinks } = req.body;

  // Convert socialLinks to a string format if necessary
  // For example, "twitter: http://twitter.com/username, facebook: http://facebook.com/username"
  const socialLinksString = Object.entries(socialLinks)
  .filter(([_, value]) => value) // Only include non-empty values
  .map(([key, value]) => `${key}: ${value}`)
  .join(', ');

  const query = 'INSERT INTO bands (band, socialLinks) VALUES ($1, $2) RETURNING *';
  const values = [band, socialLinksString];

  db.query(query, values, (error, result) => {
      if (error) {
          console.error('Error adding band:', error);
          res.status(500).send('Error adding band');
      } else {
          res.status(201).json({ message: 'Band added successfully!', band: result.rows[0] });
      }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});