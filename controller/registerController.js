const bcrypt = require('bcrypt');
const User = require('../models/People');

async function getRegister(req, res) {
  res.render('register');
}

async function registerUser(req, res) {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      ...req.body,
      password: hashedPassword,
      avatar: req.files?.[0]?.filename || null,
    });

    await newUser.save();
    res.status(200).json({ message: 'Registration successful!' });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: 'Registration failed!',
        },
      },
    });
  }
}

module.exports = {
  getRegister,
  registerUser,
};
