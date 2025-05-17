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
    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create new user with avatar filename if available
    const newUser = new User({
      ...req.body,
      password: hashedPassword,
      avatar: req.files && req.files.length > 0 ? req.files[0].filename : null,
    });

    await newUser.save();

    // Prepare the user object to generate token
    const userObject = {
      userid: newUser._id,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar || null,
      role: newUser.role || 'user',
    };

    // generate token
    const token = jwt.sign(userObject, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    // set cookie
    res.cookie(process.env.COOKIE_NAME, token, {
      maxAge: process.env.COOKIE_MAX_AGE,
      httpOnly: true,
      signed: true,
    });

    // Set logged in user local identifier
    res.locals.loggedInUser = userObject;

    // Send success response with redirect
    res.status(200).json({
      message: 'Registration successful!',
      user: userObject,
      redirect: '/inbox',
    });
  } catch (err) {
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
          ); // debugging log
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
