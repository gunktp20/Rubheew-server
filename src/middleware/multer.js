import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const storage = (destinationFolder) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, `../uploads/${destinationFolder}/`));
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
      );
    },
  });

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  console.log('Invalid file type');
  cb(new Error("Only JPEG and PNG images are allowed"));
};

const uploadMiddleware = (destinationFolder) =>
  multer({
    storage: storage(destinationFolder),
    fileFilter: fileFilter,
    // limits: { fileSize: 2 * 1024 * 1024 },
  });

export default uploadMiddleware;
