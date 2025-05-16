// external imports
const createError = require('http-errors');

// internal imports
const User = require('../models/People');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const escape = require('../utilities/escape');

// get inbox page
async function getInbox(req, res, next) {
  try {
    const conversations = await Conversation.find({
      $or: [
        { 'creator.id': req.user.userid },
        { 'participant.id': req.user.userid },
      ],
    });
    console.log('inbox conversations', conversations);

    res.locals.data = conversations;
    console.log('inbox res.locals.data', res.locals.data);
    res.render('inbox');
  } catch (err) {
    next(err);
  }
}

// search user
async function searchUser(req, res, next) {
  const user = req.body.user;
  const searchQuery = user.replace('+88', '');
  console.log('search user', user);

  const username_search_regex = new RegExp(escape(searchQuery), 'i');
  const mobile_search_regex = new RegExp('^' + escape('+88' + searchQuery));
  const email_search_regex = new RegExp('^' + escape(searchQuery) + '$', 'i');
  console.log('username_search_regex', username_search_regex);
  console.log('mobile_search_regex', mobile_search_regex);
  console.log('email_search_regex', email_search_regex);
  console.log('searchQuery', searchQuery);

  try {
    if (searchQuery !== '') {
      const users = await User.find(
        {
          $or: [
            {
              username: username_search_regex,
            },
            {
              mobile: mobile_search_regex,
            },
            {
              email: email_search_regex,
            },
          ],
        },
        'username avatar'
      );

      console.log('search users', users);
      res.json(users);
    } else {
      throw createError('You must provide some text to search!');
    }
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

// add conversation
async function addConversation(req, res, next) {
  try {
    const newConversation = new Conversation({
      creator: {
        id: req.user.userid,
        username: req.user.username,
        avatar: req.user.avatar || null,
      },
      participant: {
        id: req.body.id,
        username: req.body.participant,
        avatar: req.body.avatar || null,
      },
    });
    console.log('new conversation', newConversation);

    const result = await newConversation.save();
    console.log('conversation result', result);
    res.status(200).json({
      message: 'Conversation was added successfully!',
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

// get messages of a conversation
async function getMessages(req, res, next) {
  try {
    const messages = await Message.find({
      conversation_id: req.params.conversation_id,
    }).sort('-createdAt');
    console.log('conversation messages', messages);

    const { participant } = await Conversation.findById(
      req.params.conversation_id
    );
    console.log('paritcipant', participant);

    res.status(200).json({
      data: {
        messages: messages,
        participant,
      },
      user: req.user.userid,
      conversation_id: req.params.conversation_id,
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: 'Unknows error occured!',
        },
      },
    });
  }
}

// send new message
// async function sendMessage(req, res, next) {
//   console.log('req.body message', req.body);
//   console.log('req.files message', req.files);

//   // Check if there's a message or files to send
//   if (req.body.message || (req.files && req.files.length > 0)) {
//     try {
//       // save message text/attachment in database
//       let attachments = null;

//       if (req.files && req.files.length > 0) {
//         attachments = [];

//         req.files.forEach((file) => {
//           attachments.push(file.filename);
//         });
//       }
//       console.log('attachments', attachments);

//       const newMessage = new Message({
//         text: req.body.message,
//         attachment: attachments,
//         sender: {
//           id: req.user.userid,
//           username: req.user.username,
//           avatar: req.user.avatar || null,
//         },
//         receiver: {
//           id: req.body.receiverId,
//           username: req.body.receiverName,
//           avatar: req.body.avatar || null,
//         },
//         conversation_id: req.body.conversationId,
//       });
//       console.log('new message', newMessage);

//       const result = await newMessage.save();
//       console.log('message result', result);

//       // emit socket event
//       global.io.emit('new_message', {
//         message: {
//           conversation_id: req.body.conversationId,
//           sender: {
//             id: req.user.userid,
//             username: req.user.username,
//             avatar: req.user.avatar || null,
//           },
//           message: req.body.message,
//           attachment: attachments,
//           date_time: result.date_time,
//         },
//       });

//       res.status(200).json({
//         message: 'Successful!',
//         data: result,
//       });
//     } catch (err) {
//       console.log('message error', err);
//       res.status(500).json({
//         errors: {
//           common: {
//             msg: err.message,
//           },
//         },
//       });
//     }
//   } else {
//     res.status(500).json({
//       errors: {
//         common: 'message text or attachment is required!',
//       },
//     });
//   }
// }
async function sendMessage(req, res, next) {
  console.log('req.body message', req.body);
  console.log('req.files message', req.files);

  // Check if there's a message or files to send
  if (req.body.message || (req.files && req.files.length > 0)) {
    try {
      // save message text/attachment in database
      let attachments = null;

      if (req.files && req.files.length > 0) {
        attachments = [];

        req.files.forEach((file) => {
          attachments.push(file.filename);
        });
        console.log('Processed attachments:', attachments);
      }

      const newMessage = new Message({
        text: req.body.message || '', // Use empty string if no message text
        attachment: attachments,
        sender: {
          id: req.user.userid,
          username: req.user.username,
          avatar: req.user.avatar || null,
        },
        receiver: {
          id: req.body.receiverId,
          username: req.body.receiverName,
          avatar: req.body.avatar || null,
        },
        conversation_id: req.body.conversationId,
      });
      console.log('new message object:', newMessage);

      const result = await newMessage.save();
      console.log('message saved result:', result);

      // emit socket event
      global.io.emit('new_message', {
        message: {
          conversation_id: req.body.conversationId,
          sender: {
            id: req.user.userid,
            username: req.user.username,
            avatar: req.user.avatar || null,
          },
          message: req.body.message || '',
          attachment: attachments,
          date_time: result.date_time,
        },
      });

      res.status(200).json({
        message: 'Successful!',
        data: result,
      });
    } catch (err) {
      console.log('message error', err);
      res.status(500).json({
        errors: {
          common: {
            msg: err.message,
          },
        },
      });
    }
  } else {
    res.status(500).json({
      errors: {
        common: 'message text or attachment is required!',
      },
    });
  }
}

module.exports = {
  getInbox,
  searchUser,
  addConversation,
  getMessages,
  sendMessage,
};
