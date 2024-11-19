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

// Single endpoint to fetch either bands or shows based on query parameter
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
          bandName: band.band,
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

    } else {
      return res.status(400).json({ error: "Invalid table parameter" });
    }
  } catch (err) {
    console.error(`Error fetching data for ${table}:`, err.message, err.stack);
    res.status(500).json({ error: `Error fetching ${table} data` });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});