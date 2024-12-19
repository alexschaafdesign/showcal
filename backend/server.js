import dotenv from 'dotenv';
import path, { resolve } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

// Debug the path resolution for db.js
console.log('Resolved db.js path:', resolve('./config/db.js'));

import pool from './config/db.js'; // Centralized database connection
import fs from 'fs';

// Route imports
import venuesRoutes from './routes/venues.js';
import tcupbandsRouter from './routes/tcupbands.js';
import showsRoutes from './routes/shows.js';
import peopleRouter from './routes/people.js'; // Adjust path as needed

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Load environment variables
const envFilePath = path.resolve(__dirname, `./.env.${process.env.NODE_ENV || 'development'}`);

console.log('Loaded environment variables from:', envFilePath);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

// App initialization
const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'development'
    ? 'http://localhost:3002'
    : ['https://portal.tcupboard.org', 'http://www.portal.tcupboard.org'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure necessary directories exist
const ensureDirectoryExistence = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};
ensureDirectoryExistence(path.join(__dirname, '../assets/images'));

// Routes
app.use('/api/venues', venuesRoutes);
app.use('/api/tcupbands', tcupbandsRouter);
app.use('/api/shows', showsRoutes);
app.use('/api/people', peopleRouter);

// Validate required environment variables
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'client/build')));

// Catch-all route to serve the React app for any undefined routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Test database connection
console.log('Testing database connection...');
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err.message || err.stack);
  } else {
    console.log('Database connected successfully!');
    client.query('SELECT current_database()', (queryErr, res) => {
      release();
      if (queryErr) {
        console.error('Database query error:', queryErr.message || queryErr.stack);
      } else {
        console.log('Connected to database:', res.rows[0].current_database);
      }
    });
  }
});

// Start the server
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
app.listen(PORT, host, () => {
  console.log(`Server is running on http://${host}:${PORT}`);
  console.log('Routes registered:');
  console.log('/venues');
  console.log('/tcupbands');
  console.log('/bands');
  console.log('/shows');
  console.log('/upload');
  console.log('/people');
});