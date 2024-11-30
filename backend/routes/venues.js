import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Get all venues
router.get('/', async (req, res) => {
  try {
    console.log('Attempting to query venues...');
    const query = 'SELECT * FROM public.venues';
    const result = await pool.query('SELECT * FROM public.venues');
    console.log('Query result:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single venue by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const venue = await pool.query('SELECT * FROM venues WHERE id = $1', [id]);

    if (venue.rows.length === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    res.json(venue.rows[0]);
  } catch (error) {
    console.error('Error fetching venue:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new venue
router.post('/', async (req, res) => {
  try {
    const { name, address, capacity } = req.body;

    const newVenue = await pool.query(
      'INSERT INTO venues (name, address, capacity) VALUES ($1, $2, $3) RETURNING *',
      [name, address, capacity]
    );

    res.status(201).json(newVenue.rows[0]);
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an existing venue
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, capacity } = req.body;

    const updatedVenue = await pool.query(
      'UPDATE venues SET name = $1, address = $2, capacity = $3 WHERE id = $4 RETURNING *',
      [name, address, capacity, id]
    );

    if (updatedVenue.rows.length === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    res.json(updatedVenue.rows[0]);
  } catch (error) {
    console.error('Error updating venue:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a venue
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedVenue = await pool.query('DELETE FROM venues WHERE id = $1 RETURNING *', [id]);

    if (deletedVenue.rows.length === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    res.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    console.error('Error deleting venue:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;