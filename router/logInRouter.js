// external import
const express = require('express');
// internal imports
const { getLogIn, logIn, logOut } = require('../controller/logInController');
const { redirectLoggedIn } = require('../middleware/common/checkLogIn');
const decorateHtmlResponse = require('../middleware/common/decorateHtmlResponse');
const {
  doLoginValidators,
  doLoginValidationHandler,
} = require('../middleware/login/logInValidator');

// router initialization
const router = express.Router();

// set page_title
const page_title = 'Login';

// logIn Page
router.get('/', decorateHtmlResponse(page_title), redirectLoggedIn, getLogIn);

// process login
router.post(
  '/',
  decorateHtmlResponse(page_title),
  doLoginValidators,
  doLoginValidationHandler,
  logIn
);

// logout
router.get('/logout', decorateHtmlResponse(page_title), logOut);

module.exports = router;
