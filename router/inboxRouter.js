// external import
const express = require('express');

// internal import
const { getInbox } = require('../controller/inboxController');
const decorateHtmlResponse = require('../middleware/common/decorateHtmlResponse');

const router = express.Router();

// Inbox Page
router.get('/', decorateHtmlResponse('Inbox'), getInbox);

module.exports = router;
