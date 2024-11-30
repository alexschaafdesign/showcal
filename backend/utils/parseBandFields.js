const parseBandFields = (body, files) => {
    const group_size = body.group_size ? JSON.parse(body.group_size) : [];
    const social_links = body.social_links ? JSON.parse(body.social_links) : {};
    const preUploadedImages = body.preUploadedImages ? JSON.parse(body.preUploadedImages) : [];
    const newImages = files.map((file) => `/assets/images/${file.filename}`);
    const images = [...preUploadedImages, ...newImages];
  
    return {
      name: body.name,
      genre: body.genre,
      contact: body.contact,
      play_shows: body.play_shows,
      group_size,
      social_links,
      images,
    };
  };
  
  export default parseBandFields;