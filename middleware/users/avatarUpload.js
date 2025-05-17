// internal import
const uploader = require('../../utilities/singleUploader');

function avatarUpload(req, res, next) {
  const upload = uploader(
    'avatars',
    ['image/jpeg', 'image/jpg', 'image/png'],
    1000000,
    'Only .jpeg .jpg or .png files are allowed'
  );

  // Call upload.array to handle the avatar field
  // This ensures req.files will contain the uploaded files
  upload.array('avatar', 1)(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err); // debugging log

      // Handle different types of errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          errors: {
            avatar: {
              msg: 'File size too large. Maximum 1MB allowed.',
            },
          },
        });
      }

      return res.status(400).json({
        errors: {
          avatar: {
            msg: err.message || 'Error uploading file',
          },
        },
      });
    }

    // For debugging - log file information
    console.log('Uploaded files:', req.files); // debugging log

    next();
  });
}

module.exports = avatarUpload;
