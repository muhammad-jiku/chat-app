// external import
const express = require('express');
// internal imports
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
const { checkLogIn, requireRole } = require('../middleware/common/checkLogIn');

// router initialization
const router = express.Router();

// users page
router.get(
  '/',
  decorateHtmlResponse('Users'),
  checkLogIn,
  requireRole(['admin']),
  getUsers
);

// add user
router.post(
  '/',
  checkLogIn,
  requireRole(['admin']),
  avatarUpload,
  addUsersValidator,
  addUsersValidationHandler,
  addUsers
);

// remove user
router.delete('/:id', checkLogIn, requireRole(['admin']), removeUsers);

module.exports = router;
