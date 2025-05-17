// external import
const express = require('express');
// internal imports
const {
  getInbox,
  searchUser,
  addConversation,
  getMessages,
  sendMessage,
} = require('../controller/inboxController');
const { checkLogIn } = require('../middleware/common/checkLogIn');
const decorateHtmlResponse = require('../middleware/common/decorateHtmlResponse');
const attachmentUpload = require('../middleware/inbox/attachmentUpload');

// router initialization
const router = express.Router();

// Inbox Page
router.get('/', decorateHtmlResponse('Inbox'), checkLogIn, getInbox);

// search user for conversation
router.post('/search', checkLogIn, searchUser);

// add conversation
router.post('/conversation', checkLogIn, addConversation);

// get messages of a conversation
router.get('/messages/:conversation_id', checkLogIn, getMessages);

// send message
router.post('/message', checkLogIn, attachmentUpload, sendMessage);

module.exports = router;
