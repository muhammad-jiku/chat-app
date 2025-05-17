// internal imports
const fs = require('fs');
const path = require('path');

// 404 not found handler
function notFoundErrorHandler(req, res, next) {
  next({
    status: 404,
    message: 'Your requested content was not found!',
  });
}

// default error handler with enhanced Vercel compatibility
function errorHandler(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

  const status = err.status || 500;

  // First, check if we're on Vercel
  const isVercel = process.env.VERCEL || false;

  // Debug logging for troubleshooting
  console.error(`Error occurred: ${err.message}`);
  console.error(`Status code: ${status}`);
  console.error(`Environment: ${process.env.NODE_ENV}`);

  // Check if views directory and error template exist
  const viewsPath = path.join(__dirname, '..', 'views');
  const errorViewPath = path.join(viewsPath, 'error.ejs');

  let viewExists = false;
  try {
    viewExists = fs.existsSync(errorViewPath);
    console.log(`Error view exists: ${viewExists}`);
  } catch (e) {
    console.error('Error checking for view file:', e);
  }

  // Try to render the view if it exists
  if (viewExists && !isVercel) {
    try {
      return res.status(status).render('error', {
        title: 'Error page',
        error: {
          message: err.message,
          status: status,
          stack: process.env.NODE_ENV === 'development' ? err.stack : '',
        },
      });
    } catch (renderError) {
      console.error('Error rendering view:', renderError);
      // Fall through to the HTML response below
    }
  }

  // Fallback HTML response - always used on Vercel or if rendering fails
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${status === 404 ? 'Page Not Found' : 'Error'} - Chat Now</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f7f7f7;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .error-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          text-align: center;
        }
        .error-code {
          font-size: 6rem;
          font-weight: bold;
          color: #e74c3c;
          margin: 0;
          line-height: 1;
        }
        .error-title {
          font-size: 1.8rem;
          margin-top: 0.5rem;
          margin-bottom: 1.5rem;
          color: #2c3e50;
        }
        .error-message {
          margin-bottom: 2rem;
          color: #555;
        }
        .back-button {
          display: inline-block;
          padding: 0.8rem 1.5rem;
          background-color: #3498db;
          color: white;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        .back-button:hover {
          background-color: #2980b9;
        }
        .stack-trace {
          margin-top: 2rem;
          padding: 1rem;
          background-color: #f1f1f1;
          border-radius: 4px;
          font-family: monospace;
          text-align: left;
          overflow: auto;
          max-height: 200px;
          font-size: 0.9rem;
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <h1 class="error-code">${status}</h1>
        <h2 class="error-title">${
          status === 404 ? 'Page Not Found' : 'Something Went Wrong'
        }</h2>
        <p class="error-message">${
          err.message || 'An unexpected error occurred'
        }</p>
        <a href="/" class="back-button">Go Back to Home</a>
        ${
          isDevelopment && err.stack
            ? `
          <div class="stack-trace">
            <pre>${err.stack}</pre>
          </div>
        `
            : ''
        }
      </div>
    </body>
    </html>
  `;

  res.status(status).send(errorHTML);
}

module.exports = {
  notFoundErrorHandler,
  errorHandler,
};
