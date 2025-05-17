// external import
const createError = require('http-errors');

// 404 not found error handler
function notFoundErrorHandler(req, res, next) {
  next(createError(404, 'Ooops! SORRY ;-; Your requested url is not found! '));
}

// error handling middleware
function errorHandler(err, req, res, next) {
  res.locals.error =
    process.env.NODE_ENV === 'development' ? err : { message: err.message };

  res.status(err.status || 500);

  if (res.locals.html) {
    // html response
    res.render('error', {
      title: 'Error Page',
    });
  } else {
    res.json(res.locals.error);
  }
  /* 
  {res.locals.title = 'Error' 
  res.render('error')} or {
  res.render('error', {
     title: 'Error Page' 
  })
  }
  */
}

module.exports = {
  notFoundErrorHandler,
  errorHandler,
};
