const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

// internal import
const User = require('../models/People');

async function getRegister(req, res) {
  res.render('register');
}

async function registerUser(req, res) {
  try {
    console.log('registerUser body', req.body);
    console.log('registerUser files', req.files);

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log('hashedPassword', hashedPassword);

    // Create new user with avatar filename if available
    const newUser = new User({
      ...req.body,
      password: hashedPassword,
      avatar: req.files && req.files.length > 0 ? req.files[0].filename : null,
    });

    await newUser.save();
    console.log('newUser', newUser);

    // Prepare the user object to generate token
    const userObject = {
      userid: newUser._id,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar || null,
      role: newUser.role || 'user',
    };
    console.log('userObject', userObject);

    // // Generate token with safer environment variable handling
    // let jwtExpiry = process.env.JWT_EXPIRY || '30d';
    // let cookieMaxAge =
    //   parseInt(process.env.COOKIE_MAX_AGE, 10) || 30 * 24 * 60 * 60 * 1000;

    // // Clean up potential comments or whitespace in env variables
    // if (typeof jwtExpiry === 'string' && jwtExpiry.includes('#')) {
    //   jwtExpiry = jwtExpiry.split('#')[0].trim();
    // }

    // // Generate token
    // const token = jwt.sign(userObject, process.env.JWT_SECRET, {
    //   expiresIn: jwtExpiry,
    // });

    // generate token
    const token = jwt.sign(userObject, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });
    console.log('token generated successfully', token);

    // // Set cookie
    // res.cookie(process.env.COOKIE_NAME, token, {
    //   maxAge: cookieMaxAge,
    //   httpOnly: true,
    //   signed: true,
    // });

    // set cookie
    res.cookie(process.env.COOKIE_NAME, token, {
      maxAge: process.env.COOKIE_MAX_AGE,
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
    console.log('Registration error:', err);

    // Delete uploaded avatar if registration fails
    if (req.files && req.files.length > 0) {
      const fs = require('fs');
      const filePath = path.join(
        __dirname,
        '../public/uploads/avatars/',
        req.files[0].filename
      );
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr)
          console.error(
            'Error deleting file after failed registration:',
            unlinkErr
          );
      });
    }

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
