const formatBandData = (band) => {
  return {
    ...band,
    images: Array.isArray(band.images)
      ? band.images
      : band.images
      ? band.images
          .replace(/{|}/g, "") // Remove curly braces
          .split(",") // Split into an array
          .map((img) => img.trim().replace(/^"|"$/g, "")) // Remove extra quotes and trim whitespace
      : [], // Default to an empty array if `images` is null
  };
};

export default formatBandData;