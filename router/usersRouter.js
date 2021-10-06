// external import
const express = require('express');

// internal import
const { getUsers } = require('../controller/usersController');
const decorateHtmlResponse = require('../middleware/common/decorateHtmlResponse');

// internal import
const router = express.Router();

// Users Page
router.get('/', decorateHtmlResponse('Users'), getUsers);

module.exports = router;
