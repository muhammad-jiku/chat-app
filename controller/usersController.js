// external import
const bcrypt = require('bcrypt');
const path = require('path');
const { unlink } = require('fs');

// internal import
const User = require('../models/People');

// get User Page
async function getUsers(req, res, next) {
  try {
    const users = await User.find();
    res.render('users', {
      users: users,
    });
  } catch (err) {
    next(err);
  }
}

// add users
async function addUsers(req, res, next) {
  let newUser;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  if (req.files && req.files.length > 0) {
    newUser = new User({
      ...req.body,
      avatar: req.files[0].filename,
      password: hashedPassword,
    });
  } else {
    newUser = new User({
      ...req.body,
      password: hashedPassword,
    });
  }

  // save user or send errors
  try {
    const result = await newUser.save();

    res.status(200).json({
      message: 'User was added successfully!',
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: 'Sorry!! Unknown error ocuured!',
        },
      },
    });
  }
}

// remove user
async function removeUsers(req, res, next) {
  try {
    const user = await User.findByIdAndDelete({
      _id: req.params.id,
    });

    //remove users avatar
    if (user.avatar) {
      unlink(
        path.join(__dirname, `/../public/uploads/avatars/${user.avatar}`),
        (err) => {
          if (err) console.log(err); // debugging log
        }
      );
    }

    res.status(200).json({
      message: 'User deleted successfully!',
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: 'Failed to delete!',
        },
      },
    });
  }
}

module.exports = {
  getUsers,
  addUsers,
  removeUsers,
};
