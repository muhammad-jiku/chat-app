//external import
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');

// internal import
const User = require('../models/People');

// get Log In Page
function getLogIn(req, res, next) {
  res.render('index');
}

// do login
async function logIn(req, res, next) {
  try {
    console.log('logIn body', req.body);
    // find user with this email/username
    const user = await User.findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.username },
        { mobile: req.body.username },
      ],
    });
    console.log('user', user);

    if (user && user._id) {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      console.log('isValidPassword', isValidPassword);

      if (isValidPassword) {
        // prepare the user object to generate token
        const userObject = {
          userid: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar || null,
          role: user.role || 'user',
        };

        // generate token
        const token = jwt.sign(userObject, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRY,
        });
        console.log('token', token);

        // set cookie
        res.cookie(process.env.COOKIE_NAME, token, {
          maxAge: process.env.COOKIE_MAX_AGE,
          httpOnly: true,
          signed: true,
        });

        // set logged in user local identifier
        res.locals.loggedInUser = userObject;
        console.log('res.locals.loggedInUser', res.locals.loggedInUser);

        res.redirect('inbox');
      } else {
        throw createError('Sorry! Failed to log in!');
      }
    } else {
      throw createError('Sorry! Failed to log in!');
    }
  } catch (err) {
    res.render('index', {
      data: {
        username: req.body.username,
      },
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

// do logout
function logOut(req, res) {
  // Apply the same options used when setting the cookie
  res.clearCookie(process.env.COOKIE_NAME, {
    httpOnly: true,
    signed: true,
    // If your cookie was set with a specific path
    path: '/',
  });

  console.log('Clearing cookie:', process.env.COOKIE_NAME);

  // Redirect to login page instead of just sending text
  res.redirect('/');
}

module.exports = {
  getLogIn,
  logIn,
  logOut,
};
