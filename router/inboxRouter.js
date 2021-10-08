// external import
const express = require('express');

// internal import
const { getInbox } = require('../controller/inboxController');
const { checkLogIn } = require('../middleware/common/checkLogIn');
const decorateHtmlResponse = require('../middleware/common/decorateHtmlResponse');

const router = express.Router();

// Inbox Page
router.get('/', decorateHtmlResponse('Inbox'), checkLogIn, getInbox);

module.exports = router;
