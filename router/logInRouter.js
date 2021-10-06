// external import
const express = require('express');

// internal import
const { getLogIn } = require('../controller/logInController');
const decorateHtmlResponse = require('../middleware/common/decorateHtmlResponse');

const router = express.Router();

// logIn Page
router.get('/', decorateHtmlResponse('Login'), getLogIn);

module.exports = router;
