// external import
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { urlencoded } = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const moment = require('moment');
const http = require('http');

// internal imports
const logInRouter = require('./router/logInRouter');
const usersRouter = require('./router/usersRouter');
const inboxRouter = require('./router/inboxRouter');

// internal import
const {
  notFoundErrorHandler,
  errorHandler,
} = require('./middleware/common/errorHandler');

const app = express();
const server = http.createServer(app);
dotenv.config();

// socket creation
const io = require('socket.io')(server);
global.io = io;

// set comment as app locals
app.locals.moment = moment;

// database connection
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connection succcessful!');
  })
  .catch((err) => {
    console.log(err);
  });

// request parser
app.use(express.json());
app.use(urlencoded({ extended: true }));

// set view engine to setup ejs
app.set('view engine', 'ejs');

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// parse cookies
app.use(cookieParser(process.env.COOKIE_SECRET)); // to create cookieParser safe= 1. goto wprdpress salt genrator 2. to decrypte go to sha1 online

// routing setup
app.use('/', logInRouter);
app.use('/users', usersRouter);
app.use('/inbox', inboxRouter);

// 404 not found url handling middleware
app.use(notFoundErrorHandler);

// common error handler middleware
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`server running at http://localhost:${process.env.PORT}`);
});
