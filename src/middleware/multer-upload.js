import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// เปลี่ยนจาก diskStorage เป็น memoryStorage
const storage = multer.memoryStorage(); // ใช้ memoryStorage แทน

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  console.log("Invalid file type");
  cb(new Error("Only JPEG and PNG images are allowed"));
};

const uploadMiddleware = multer({
  storage: storage, // ใช้ memoryStorage
  fileFilter: fileFilter,
  // limits: { fileSize: 2 * 1024 * 1024 },
});

export default uploadMiddleware;
