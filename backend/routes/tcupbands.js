import express from 'express';
import pool from '../config/db.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Get all TCUP bands
router.get('/', async (req, res) => {
  try {
    const query = `SELECT * FROM tcupbands;`;
    const { rows } = await pool.query(query);

    console.log("Fetched Band Data:", rows); // Log the fetched data

    res.json(rows);
  } catch (error) {
    console.error('Error fetching TCUP bands:', error);
    res.status(500).json({ error: 'Failed to fetch TCUP bands' });
  }
});

// Get a specific TCUP band by ID
router.get('/:bandid', async (req, res) => {
  const { bandid } = req.params;

  // Validate the provided band ID
  if (!bandid) {
    return res.status(400).json({ error: 'Band ID is required' });
  }

  try {
    const query = `SELECT * FROM tcupbands WHERE id = $1;`;
    const { rows } = await pool.query(query, [bandid]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Band not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(`Error fetching TCUP band with ID ${bandid}:`, error);
    res.status(500).json({ error: 'An error occurred while fetching the TCUP band. Please try again later.' });
  }
});

// Add a new TCUP band
router.post(
  '/add',
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'stage_plot', maxCount: 10 },
  ]),
  async (req, res) => {
    console.log('Uploaded Files:', req.files); // Verify uploaded files
    console.log('Form Data:', req.body);
    try {
      const { name, genre, contact, play_shows, group_size, social_links } = req.body;

      // Parse `group_size` and `social_links`
      const formattedGroupSize = Array.isArray(group_size)
        ? group_size
        : JSON.parse(group_size || "[]");
      const formattedSocialLinks = typeof social_links === "string"
        ? JSON.parse(social_links)
        : social_links;

      // Handle uploaded file paths
      const images = req.files.images
        ? req.files.images.map((file) => `/images/${file.filename}`)
        : [];
      const stagePlot =
        req.files.stage_plot?.[0]?.filename
          ? `/documents/${req.files.stage_plot[0].filename}`
          : null;

      // Database query
      const query = `
        INSERT INTO tcupbands (name, genre, contact, play_shows, group_size, images, social_links, stage_plot)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
      `;
      const values = [
        name,
        genre,
        contact,
        play_shows,
        `{${formattedGroupSize.join(',')}}`, // Convert array to PostgreSQL array format
        images,
        JSON.stringify(formattedSocialLinks), // JSON must be stringified
        stagePlot,
      ];

      const { rows } = await pool.query(query, values);

      res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
      console.error('Error adding band:', error);
      res.status(500).json({ error: 'Failed to add band' });
    }
  }
);

// Edit an existing band
router.put(
  '/:bandid/edit',
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'stage_plot', maxCount: 10 },
  ]),
  async (req, res) => {
    console.log('Received Data:', req.body);
    console.log('Uploaded Files:', req.files);

    try {
      const { bandid } = req.params;
      const { name, genre, contact, play_shows, social_links, group_size } = req.body;

      // Parse `group_size` and `social_links`
      const formattedGroupSize = Array.isArray(group_size)
        ? group_size
        : JSON.parse(group_size || '[]');
      const formattedSocialLinks = typeof social_links === 'string'
        ? JSON.parse(social_links)
        : social_links;

      // Handle file uploads
      const uploadedImages = req.files.images
        ? req.files.images.map((file) => `/images/${file.filename}`)
        : [];
      const uploadedStagePlot = req.files.stage_plot?.[0]?.filename
        ? `/documents/${req.files.stage_plot[0].filename}`
        : null;

      // Fetch existing data for the band
      const existingQuery = `SELECT images, stage_plot FROM tcupbands WHERE id = $1`;
      const existingResult = await pool.query(existingQuery, [bandid]);
      if (existingResult.rows.length === 0) {
        return res.status(404).json({ message: 'Band not found' });
      }
      const existingBand = existingResult.rows[0];

      // Merge existing and new data
      const mergedImages = [...(existingBand.images || []), ...uploadedImages];
      const stagePlot = uploadedStagePlot || existingBand.stage_plot;

      // Update query
      const updateQuery = `
        UPDATE tcupbands 
        SET name = $1, genre = $2, contact = $3, play_shows = $4, 
            group_size = $5, social_links = $6, images = $7, stage_plot = $8
        WHERE id = $9
        RETURNING *;
      `;
      const values = [
        name,
        genre,
        contact,
        play_shows,
        `{${formattedGroupSize.join(',')}}`, // Convert to PostgreSQL array format
        JSON.stringify(formattedSocialLinks), // JSON must be stringified
        JSON.stringify(mergedImages), // Ensure images array is stored as JSON
        stagePlot,
        bandid,
      ];

      console.log('Formatted Values:', values);

      const { rows } = await pool.query(updateQuery, values);

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Band not found' });
      }

      res.json({ success: true, data: rows[0] });
    } catch (error) {
      console.error('Error updating band:', error);
      res.status(500).json({ message: 'Failed to update band' });
    }
  }
);

export default router;