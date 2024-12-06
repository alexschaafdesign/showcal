// Get all bands
export const getAllBandsQuery = `
  SELECT id, name, genre, contact, play_shows, group_size, social_links, music_links, images, created_at
  FROM tcupbands;
`;

// Get a specific band by ID
export const getBandByIdQuery = `
  SELECT id, name, genre, contact, play_shows, group_size, social_links, music_links, images, created_at
  FROM tcupbands
  WHERE id = $1;
`;

export const updateBandQuery = `
  UPDATE tcupbands
  SET 
    name = $1, 
    genre = $2, 
    contact = $3, 
    play_shows = $4, 
    group_size = $5, 
    social_links = $6, 
    music_links = $7, 
    images = $8
  WHERE id = $9
  RETURNING *;
`;

// Insert a new band
export const addBandQuery = `
  INSERT INTO tcupbands (name, genre, contact, play_shows, group_size, social_links, music_links, images)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *;
`;