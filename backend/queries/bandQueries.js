// Get all bands
export const getAllBandsQuery = `
  SELECT id, name, genre, bandemail, play_shows, group_size, social_links, music_links, created_at, profile_image, other_images, location
  FROM tcupbands;
`;

// Get a specific band by ID
export const getBandByIdQuery = `
  SELECT id, name, genre, bandemail, play_shows, group_size, social_links, music_links, created_at, profile_image, other_images, location
  FROM tcupbands
  WHERE id = $1;
`;

export const updateBandQuery = `
  UPDATE tcupbands
  SET 
    name = $1, 
    genre = $2, 
    bandemail = $3, 
    play_shows = $4, 
    group_size = $5, 
    social_links = $6, 
    music_links = $7, 
    profile_image = $8,
    other_images = $9,
    location = $10
  WHERE id = $11
  RETURNING *;
`;

// Insert a new band
export const addBandQuery = `
  INSERT INTO tcupbands (name, genre, bandemail, play_shows, group_size, social_links, music_links, profile_image, other_images, location)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  RETURNING *;
`;