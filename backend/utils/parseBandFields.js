function parseBandFields(body, files) {
  const {
    name = "",
    genre = "",
    contact = "",
    play_shows = "",
    group_size = "[]", // Default to an empty array if not provided
    social_links = "{}", // Default to an empty object if not provided
  } = body;

  // Parse group_size and social_links to ensure they are arrays/objects
  const parsedGroupSize = Array.isArray(group_size) ? group_size : JSON.parse(group_size || "[]");
  const parsedSocialLinks = typeof social_links === "object" ? social_links : JSON.parse(social_links || "{}");

  // Parse uploaded images
  const uploadedImages = files.map((file) => `/assets/images/${file.filename}`);

  return {
    name,
    genre,
    contact,
    play_shows,
    group_size: parsedGroupSize,
    social_links: parsedSocialLinks,
    images: uploadedImages,
  };
}
  
  export default parseBandFields;