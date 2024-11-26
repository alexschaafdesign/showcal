import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import multer from 'multer';
import fs from 'fs';

// Define __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3001;
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Database Connection
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

// Serve static files
app.use('/images', express.static(path.join(__dirname, '../assets/images')));
app.use('/documents', express.static(path.join(__dirname, '../assets/documents')));

// Ensure directories exist
const ensureDirectoryExistence = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDirectoryExistence(path.join(__dirname, '../assets/images'));
ensureDirectoryExistence(path.join(__dirname, '../assets/documents'));

// Configure Multer for dynamic file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === "photos") {
        cb(null, path.join(__dirname, '../assets/images')); // Store images
      } else if (file.fieldname === "stage_plot") {
        cb(null, path.join(__dirname, '../assets/documents')); // Store stage plots
      } else {
        cb(new Error("Invalid file field"), false);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"), false);
    }
  },
});

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

// Unified `/tcup` Endpoint
app.get('/tcup', async (req, res) => {
  const { table } = req.query;

  try {
    let result;

    if (table === 'tcupbands') {
      const query = `
        SELECT 
          id,
          name,
          genre,
          contact,
          play_shows,
          group_size,
          photos,
          social_links,
          stage_plot
        FROM tcupbands;
      `;
      result = await pool.query(query);
    } else if (table === 'shows') {
      const query = `
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
      `;
      result = await pool.query(query);
    } else if (table === 'bands') {
      const query = `
        SELECT id, band, social_links
        FROM bands;
      `;
      result = await pool.query(query);
    } else if (table === 'venues') {
      const query = `
        SELECT 
          id,
          venue,
          location,
          capacity,
          cover_image
        FROM venues;
      `;
      result = await pool.query(query);
    } else {
      return res.status(400).json({ error: "Invalid table parameter" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(`Error fetching ${table} data:`, err.message);
    res.status(500).json({ error: `Error fetching ${table} data` });
  }
});

// Add a band to the tcupbands table
app.post(
  '/tcup/tcupbands',
  upload.fields([
    { name: 'photos', maxCount: 3 },
    { name: 'stage_plot', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        genre = null,
        contact = null,
        play_shows = null,
        group_size = null,
        social_links = null,
      } = req.body;

      const parsedGroupSize = group_size ? JSON.parse(group_size) : [];
      const parsedSocialLinks = social_links ? JSON.parse(social_links) : {};

      const photos = req.files['photos']
        ? req.files['photos'].map((file) => `/images/${file.filename}`)
        : [];
      const stagePlot =
        req.files['stage_plot'] && req.files['stage_plot'][0]
          ? `/documents/${req.files['stage_plot'][0].filename}`
          : null;

      const query = `
        INSERT INTO tcupbands (name, genre, contact, play_shows, group_size, photos, social_links, stage_plot)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;

      const values = [
        name,
        genre,
        contact,
        play_shows,
        parsedGroupSize,
        photos,
        parsedSocialLinks,
        stagePlot,
      ];

      const { rows } = await pool.query(query, values);
      res.status(201).json({ message: 'Band added successfully!', band: rows[0] });
    } catch (error) {
      console.error('Error adding band:', error.message);
      res.status(500).json({ error: 'Failed to add band' });
    }
  }
);

// Get a specific TCUP band by ID
app.get('/tcup/tcupbands/:id', async (req, res) => {
  const bandId = req.params.id;
  try {
    const query = `
      SELECT 
        id,
        name,
        genre,
        contact,
        play_shows,
        group_size,
        photos,
        social_links,
        stage_plot
      FROM tcupbands
      WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [bandId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Band not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching band:', error);
    res.status(500).json({ error: 'Failed to fetch band' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});