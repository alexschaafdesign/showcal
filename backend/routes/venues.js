import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import pool from './config/db.js'; // Import shared database connection
import showsRoutes from './routes/shows.js';
import bandsRoutes from './routes/bands.js';
import venuesRoutes from './routes/venues.js';
import tcupBandsRoutes from './routes/tcupbands.js'; // Route for TCUPBands table
import showBandsRoutes from './routes/show_bands.js'; // Optional: Route for show_bands junction table

// Define __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/images', express.static(path.join(__dirname, '../assets/images')));
app.use('/documents', express.static(path.join(__dirname, '../assets/documents')));

// Ensure directories exist (utility function)
import ensureDirectoryExistence from './utils/ensureDirectoryExistence.js';
ensureDirectoryExistence(path.join(__dirname, '../assets/images'));
ensureDirectoryExistence(path.join(__dirname, '../assets/documents'));

// Unified `/tcup` Endpoint for querying tables
app.get('/tcup', async (req, res) => {
  const { table } = req.query;

  try {
    let result;

    switch (table) {
      case 'tcupbands':
        result = await pool.query('SELECT * FROM tcupbands');
        break;
      case 'shows':
        result = await pool.query(`
          SELECT 
            shows.id AS show_id,
            shows.start,
            shows.flyer_image,
            shows.event_link,
            shows.venue_id,
            venues.venue AS venue_name,
            array_agg(json_build_object('id', bands.id, 'name', bands.band)) AS bands
          FROM 
            shows
          LEFT JOIN 
            venues ON shows.venue_id = venues.id
          LEFT JOIN 
            show_bands ON shows.id = show_bands.show_id
          LEFT JOIN 
            bands ON show_bands.band_id = bands.id
          GROUP BY 
            shows.id, venues.id
          ORDER BY 
            shows.start ASC;
        `);
        break;
      case 'bands':
        result = await pool.query('SELECT id, band, social_links FROM bands');
        break;
      case 'venues':
        result = await pool.query('SELECT * FROM venues');
        break;
      default:
        return res.status(400).json({ error: 'Invalid table parameter' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(`Error fetching ${table} data:`, err.message);
    res.status(500).json({ error: `Error fetching ${table} data` });
  }
});

// Routes
app.use('/shows', showsRoutes);
app.use('/bands', bandsRoutes);
app.use('/venues', venuesRoutes);
app.use('/tcupbands', tcupBandsRoutes);
app.use('/showbands', showBandsRoutes); // Optional

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});