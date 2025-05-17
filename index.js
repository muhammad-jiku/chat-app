// external imports
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { urlencoded } = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const moment = require('moment');
// internal imports
const http = require('http');
const fs = require('fs');
const logInRouter = require('./router/logInRouter');
const registerRouter = require('./router/registerRouter');
const usersRouter = require('./router/usersRouter');
const inboxRouter = require('./router/inboxRouter');
const {
  notFoundErrorHandler,
  errorHandler,
} = require('./middleware/common/errorHandler');
const socketSetup = require('./lib/socket');

// app initialization
const app = express();
dotenv.config();

// Check for Vercel environment
const isVercel = process.env.VERCEL || false;

// Create HTTP server (for both environments)
const server = isVercel ? http.createServer(app) : http.createServer(app);

// Socket.io setup with enhanced compatibility
global.io = socketSetup(server);

// set moment as app locals
app.locals.moment = moment;

// database connection with improved error handling
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connection successful!');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// request parser
app.use(express.json());
app.use(urlencoded({ extended: true }));

// set view engine to setup ejs
app.set('view engine', 'ejs');

// Enhanced views directory handling for Vercel
const viewsPath = path.join(__dirname, 'views');
app.set('views', viewsPath);

// Debug views directory for troubleshooting
console.log('Views directory set to:', viewsPath);
try {
  if (fs.existsSync(viewsPath)) {
    console.log('Views directory exists');
    const files = fs.readdirSync(viewsPath);
    console.log('Views directory contents:', files);
  } else {
    console.log('Views directory does not exist');
  }
} catch (err) {
  console.error('Error checking views directory:', err);
}

// set static folder with proper caching headers
app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: '1d', // Cache static assets for 1 day
    etag: true,
  })
);

// parse cookies
app.use(cookieParser(process.env.COOKIE_SECRET));

// Add basic security headers
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  next();
});

// Add environment flag for middleware
app.use((req, res, next) => {
  req.isVercelEnvironment = isVercel;
  next();
});

// Add placeholder for missing avatars
app.use((req, res, next) => {
  if (req.path.startsWith('/uploads/') && isVercel) {
    // For Vercel environment, serve a placeholder for missing uploads
    const placeholderImage = path.join(
      __dirname,
      'public',
      'images',
      'placeholder.png'
    );
    if (fs.existsSync(placeholderImage)) {
      return res.sendFile(placeholderImage);
    } else {
      // If even the placeholder doesn't exist, return a 204 No Content
      return res.status(204).end();
    }
  }
  next();
});

// routing setup
app.use('/', logInRouter);
app.use('/register', registerRouter);
app.use('/users', usersRouter);
app.use('/inbox', inboxRouter);

// Add a simple health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    vercel: isVercel ? 'true' : 'false',
  });
});

// 404 not found url handling middleware
app.use(notFoundErrorHandler);

// common error handler middleware
app.use(errorHandler);

// Export for Vercel serverless functions
if (isVercel) {
  // For Vercel, export the app
  module.exports = app;
} else {
  // Traditional server listening for local development
  server.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
  });
}
