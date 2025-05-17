// external imports
const path = require('path');
const fs = require('fs');
// internal import
const uploader = require('../../utilities/multipleUploader');

function attachmentUpload(req, res, next) {
  // Check if the uploads directory exists in app root
  const uploadsDir = path.join(__dirname, '../../public/uploads/attachments');

  // Double-check directory exists
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
    } catch (err) {
      console.error('Failed to create uploads directory:', err); // debugging log
      return res.status(500).json({
        errors: {
          attachment: {
            msg: 'Server error: Could not create upload directory',
          },
        },
      });
    }
  } else {
    console.log('Uploads directory exists'); // debugging log
  }

  const upload = uploader(
    'attachments',
    ['image/jpeg', 'image/jpg', 'image/png'],
    1000000,
    5, // Maximum 5 files
    'Only .jpg, jpeg or .png format allowed!'
  );

  // Debug logging before upload
  console.log(
    'Initiating attachment upload, incoming request has files:',
    req.files ? req.files.length : 'No req.files'
  ); // debugging log

  // Call the middleware function
  upload.array('attachment')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err); // debugging log

      // Give more specific error messages based on error type
      if (err.code === 'ENOENT') {
        return res.status(500).json({
          errors: {
            attachment: {
              msg: 'Server storage error: Directory not found',
            },
          },
        });
      } else if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          errors: {
            attachment: {
              msg: 'File too large! Maximum size is 1MB',
            },
          },
        });
      } else {
        return res.status(500).json({
          errors: {
            attachment: {
              msg: err.message || 'Unknown upload error',
            },
          },
        });
      }
    }

    // Log successful upload
    console.log(
      'Upload complete, files received:',
      req.files ? req.files.length : 'No files'
    ); // debugging log

    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        console.log(`File ${index + 1}: ${file.filename} (${file.mimetype})`); // debugging log
      });
    }

    next();
  });
}

module.exports = attachmentUpload;
