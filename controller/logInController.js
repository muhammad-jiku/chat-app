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
    // find user with this email/username
    const user = await User.findOne({
      $or: [{ email: req.body.username }, { phone: req.body.username }],
    });

    if (user && user._id) {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (isValidPassword) {
        // prepare the user object to generate token
        const userObject = {
          username: user.name,
          mobile: user.mobile,
          email: user.email,
          role: 'user',
        };

        // generate token
        const token = jwt.sign(userObject, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRY,
        });

        // set cookie
        res.cookie(process.env.COOKIE_NAME, token, {
          maxAge: process.env.JWT_EXPIRY,
          httpOnly: true,
          signed: true,
        });

        // set logged in user local identifier
        res.locals.loggedInUser = userObject;

        res.render('inbox');
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
  res.clearCookie(process.env.COOKIE_NAME);
  res.send('logged out');
}

module.exports = {
  getLogIn,
  logIn,
  logOut,
};
