const express = require('express');

const router = express.Router();
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
