const { check, validationResult } = require('express-validator');
const createError = require('http-errors');
const path = require('path');
const fs = require('fs');

// internal imports
const User = require('../../models/People');

// add user
const addUsersValidator = [
  check('username')
    .isLength({ min: 1 })
    .withMessage('Username is required')
    .isAlpha('en-US', { ignore: ' -' })
    .withMessage('Username must not contain anything other than Alphabet')
    .trim()
    .custom(async (value) => {
      try {
        const user = await User.findOne({ username: value });
        if (user) {
          throw createError('This username already exists!');
        }
      } catch (err) {
        throw createError(err.message);
      }
    }),
  check('email')
    .isEmail()
    .withMessage('Invalid Mail Address')
    .trim()
    .custom(async (value) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          throw createError('E-mail has already been in use!');
        }
      } catch (err) {
        throw createError(err.message);
      }
    }),
  check('mobile')
    .isMobilePhone('bn-BD', {
      strictMode: true,
    })
    .withMessage('Your Contact number must be from Bangladeshi SIM Operator!')
    .custom(async (value) => {
      try {
        const user = await User.findOne({ mobile: value });
        if (user) {
          throw createError('This number already exists!');
        }
      } catch (err) {
        throw createError(err.message);
      }
    }),
  check('password')
    .isStrongPassword()
    .withMessage(
      'Password must be at least 8 characters long & should contain at least 1 lowercase, 1 uppercase, 1 number & 1 symbol'
    ),
];

const addUsersValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  console.log('errors', errors);
  console.log('mapped errors', mappedErrors);

  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    // Remove uploaded files if validation fails
    if (req.files && req.files.length > 0) {
      const { filename } = req.files[0];
      const filePath = path.join(
        __dirname,
        '../../public/uploads/avatars/',
        filename
      );

      // Use fs.unlink instead of requiring just the unlink method
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log(`Successfully deleted ${filePath}`);
        }
      });
    }

    // Send validation errors back to client
    res.status(400).json({
      errors: mappedErrors,
    });
  }
};

module.exports = {
  addUsersValidator,
  addUsersValidationHandler,
};
