// external import
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// internal import
const User = require('../models/People');

async function getRegister(req, res) {
  res.render('register');
}

async function registerUser(req, res) {
  try {
    console.log('registerUser body', req.body);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log('hashedPassword', hashedPassword);

    const newUser = new User({
      ...req.body,
      password: hashedPassword,
      avatar: req.files?.[0]?.filename || null,
    });

    console.log('newUser', newUser);
    await newUser.save();

    // After successful registration, generate a token just like in login
    // Prepare the user object to generate token
    const userObject = {
      userid: newUser._id,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar || null,
      role: newUser.role || 'user',
    };
    console.log('userObject', userObject);

    // Extract the proper value from JWT_EXPIRY (it might contain comments)
    let jwtExpiry = '30d'; // Default fallback

    if (process.env.JWT_EXPIRY) {
      // Extract just the value part before any comments
      const expiry = process.env.JWT_EXPIRY.trim().split('#')[0].trim();
      console.log('Raw JWT_EXPIRY:', process.env.JWT_EXPIRY);
      console.log('Parsed JWT_EXPIRY:', expiry);
      jwtExpiry = expiry;
    }

    console.log('Using final JWT_EXPIRY value:', jwtExpiry);

    // Generate token with proper expiry handling
    const token = jwt.sign(userObject, process.env.JWT_SECRET, {
      expiresIn: jwtExpiry,
    });

    console.log('token generated successfully');

    // Calculate cookie max age properly - extract just the value before any comments
    let cookieMaxAge = 30 * 24 * 60 * 60 * 1000; // Default: 30 days in milliseconds

    if (process.env.COOKIE_MAX_AGE) {
      const maxAgeStr = process.env.COOKIE_MAX_AGE.trim().split('#')[0].trim();
      cookieMaxAge = parseInt(maxAgeStr, 10);
      console.log('Raw COOKIE_MAX_AGE:', process.env.COOKIE_MAX_AGE);
      console.log('Parsed COOKIE_MAX_AGE:', cookieMaxAge);
    }

    // Set cookie
    res.cookie(process.env.COOKIE_NAME, token, {
      maxAge: cookieMaxAge,
      httpOnly: true,
      signed: true,
    });

    // Set logged in user local identifier
    res.locals.loggedInUser = userObject;
    console.log('res.locals.loggedInUser', res.locals.loggedInUser);

    // Send success response with redirect
    res.status(200).json({
      message: 'Registration successful!',
      user: userObject,
      redirect: '/inbox',
    });
  } catch (err) {
    console.error('Registration error:', err);
    console.error('Error details:', err.message);
    console.error('JWT_SECRET:', process.env.JWT_SECRET);
    console.error('JWT_EXPIRY raw:', process.env.JWT_EXPIRY);
    res.status(500).json({
      errors: {
        common: {
          msg: 'Registration failed! ' + err.message,
        },
      },
    });
  }
}

module.exports = {
  getRegister,
  registerUser,
};
