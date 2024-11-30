import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = "assets/images"; // Save all uploaded images in the specified folder
    cb(null, path.join(__dirname, `../../${folder}`)); // Resolve to the correct folder path
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    cb(null, uniqueSuffix); // Save file with a unique name
  },
});

// Set up Multer instance
const upload = multer({
  storage, // Use the defined storage
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"]; // Allow only JPEG and PNG formats
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Unsupported file type"), false); // Reject the file
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
    files: 10, // Limit the number of files per request
  },
});

export default upload; // Export the multer instance