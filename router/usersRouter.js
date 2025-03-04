// external import
const express = require('express');

// internal import
const {
  getUsers,
  addUsers,
  removeUsers,
} = require('../controller/usersController');
const decorateHtmlResponse = require('../middleware/common/decorateHtmlResponse');
const avatarUpload = require('../middleware/users/avatarUpload');
const {
  addUsersValidator,
  addUsersValidationHandler,
} = require('../middleware/users/usersValidator');

// internal import
const router = express.Router();

// Users Page
router.get('/', decorateHtmlResponse('Users'), getUsers);

// add user
router.post(
  '/',
  avatarUpload,
  addUsersValidator,
  addUsersValidationHandler,
  addUsers
);

// remove user
router.delete('/:id', removeUsers);

module.exports = router;
