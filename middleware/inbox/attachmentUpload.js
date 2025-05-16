const uploader = require('../../utilities/multipleUploader');

function attachmentUpload(req, res, next) {
  const upload = uploader(
    'attachments',
    ['image/jpeg', 'image/jpg', 'image/png'],
    1000000,
    5, // Increased from 2 to 5 maximum files
    'Only .jpg, jpeg or .png format allowed!'
  );

  // call the middleware function
  upload.array('attachment')(req, res, (err) => {
    if (err) {
      res.status(500).json({
        errors: {
          attachment: {
            msg: err.message,
          },
        },
      });
    } else {
      next();
    }
  });
}

module.exports = attachmentUpload;
