import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import venuesRoutes from './routes/venues.js';
import tcupbandsRouter from './routes/tcupbands.js';
import bandsRoutes from './routes/bands.js';
import showsRoutes from './routes/shows.js';
import uploadRoutes from './routes/upload.js';
import peopleRouter from "./routes/people.js"; // Adjust path as needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3001;

// Load environment variables based on NODE_ENV
dotenv.config({ path: path.resolve(__dirname, `./.env.${process.env.NODE_ENV || 'local'}`) });

const corsOptions = {
  origin: process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000' // Allow localhost in development mode
    : ['https://alexschaafdesign.com', 'http://www.alexschaafdesign.com'], // Allow production domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

// Database Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/venues', venuesRoutes);       // All routes for venues table
app.use('/api/tcupbands', tcupbandsRouter); // All routes for TCUP bands
app.use('/api/bands', bandsRoutes);         // All routes for bands table
app.use('/api/shows', showsRoutes);         // All routes for shows table
app.use('/api/', uploadRoutes);             // Register the upload route
app.use("/api/people", peopleRouter);       // Ensure the base path is correct

// Serve static files (for the frontend)
app.use('/assets/images', express.static(path.join(__dirname, '../assets/images')));

// Serve static files for venue images (backend)
app.use("/images/venueimages", express.static(path.join(__dirname, "./public/images/venueimages")));

// Ensure directories exist
const ensureDirectoryExistence = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDirectoryExistence(path.join(__dirname, '../assets/images'));

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
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, host, () => {
  console.log(`Server is running on http://${host}:${PORT}`);
});

console.log('Server started. Routes registered:');
console.log('/venues');
console.log('/tcupbands');
console.log('/bands');
console.log('/shows');
console.log('/upload');
console.log('/people');

pool.query('SELECT current_database()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to database:', res.rows[0].current_database);
  }
});