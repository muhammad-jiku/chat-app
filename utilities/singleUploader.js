// external imports
const multer = require('multer');
const path = require('path');
const createError = require('http-errors');
const fs = require('fs');

function uploader(
  subfolder_path,
  allowed_file_types,
  max_file_size,
  error_msg
) {
  // Use path.join with absolute path to project root
  // to ensure consistent path resolution across the application
  const PROJECT_ROOT = path.join(__dirname, '..');
  const UPLOADS_FOLDER = path.join(
    PROJECT_ROOT,
    'public',
    'uploads',
    subfolder_path
  );

  // Create directory if it doesn't exist
  if (!fs.existsSync(UPLOADS_FOLDER)) {
    fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
    console.log(`Created directory: ${UPLOADS_FOLDER}`);
  }

  // define storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_FOLDER);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const filename =
        file.originalname
          .replace(fileExt, '')
          .toLowerCase()
          .split(' ')
          .join('-') +
        '-' +
        Date.now();

      cb(null, filename + fileExt);
    },
  });

  // prepare the final multer upload object
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: max_file_size,
    },
    fileFilter: (req, file, cb) => {
      if (allowed_file_types.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(createError(error_msg));
      }
    },
  });

  return upload;
}

module.exports = uploader;
