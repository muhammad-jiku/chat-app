const uploader = require('../../utilities/singleUploader');

function avatarUpload(req, res, next) {
  const upload = uploader(
    'avatars',
    ['image/jpeg', 'image/jpg', 'image/png'],
    1000000,
    'Only .jpeg .jpg or .png file are allowed'
  );
  console.log('avatarUpload middleware called on');
  console.log('requested file', req.file);
  console.log('requested files', req.files);
  console.log('requested body', req.body);
  console.log('uploaded files', upload);
  console.log('avatarUpload middleware called off');

  // call the middleware function
  upload.any()(req, res, (err) => {
    if (err) {
      res.status(500).json({
        errors: {
          avatar: {
            msg: err.message,
          },
        },
      });
    } else {
      next();
    }
  });
}

module.exports = avatarUpload;
