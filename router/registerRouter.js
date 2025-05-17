// external import
const express = require('express');
// internal imports
const {
  getRegister,
  registerUser,
} = require('../controller/registerController');
const decorateHtmlResponse = require('../middleware/common/decorateHtmlResponse');
const avatarUpload = require('../middleware/users/avatarUpload');
const {
  addUsersValidator,
  addUsersValidationHandler,
} = require('../middleware/users/usersValidator');

// router initialization
const router = express.Router();

// GET register page
router.get('/', decorateHtmlResponse('Register'), getRegister);

// POST register form
router.post(
  '/',
  decorateHtmlResponse('Register'),
  avatarUpload,
  addUsersValidator,
  addUsersValidationHandler,
  registerUser
);

module.exports = router;
