import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import venuesRoutes from './routes/venues.js';
import tcupbandsRoutes from './routes/tcupbands.js';
import bandsRoutes from './routes/bands.js';
import showsRoutes from './routes/shows.js';
import uploadRoutes from './routes/upload.js'; // Import the new upload route
import revertRoutes from './routes/revert.js'; // Adjust the path as needed


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

// Route Handling
app.use('/venues', venuesRoutes);       // All routes for venues table
app.use('/tcupbands', tcupbandsRoutes); // All routes for TCUP bands
app.use('/bands', bandsRoutes);         // All routes for bands table
app.use('/shows', showsRoutes);         // All routes for shows table
app.use('/venues', venuesRoutes);       // All routes for venues table
app.use('/', uploadRoutes);       // Register the upload route
app.use('/revert', revertRoutes);  // to delete photos from the form


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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

console.log('Server started. Routes registered:');
console.log('/venues');
console.log('/tcupbands');
console.log('/bands');
console.log('/shows');
console.log('Connected to database:', process.env.DB_NAME);

pool.query('SELECT current_database()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to database:', res.rows[0].current_database);
  }
});