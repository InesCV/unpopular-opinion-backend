const express = require('express');
const createError = require('http-errors');

const router = express.Router();

const User = require('../models/user');
const Opinion = require('../models/opinion');

const { isLoggedIn } = require('../helpers/middlewares');

router.use(isLoggedIn('user'));

router.get('/:id?', async (req, res, next) => {
  let user = null;

  if (req.params.id) {
    user = req.params.id;
  } else {
    user = req.session.currentUser._id;
  }
  try {
    const { username, description, avatar, _id } = await User.findById(user);
    const opinions = await Opinion.find({ author: { $in: [user] } }).select('question response');
    res.status(200).json({
      message: 'User data returned successfully',
      user: {
        username,
        _id,
        description,
        avatar,
        opinions,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  const userId = req.session.currentUser._id;
  const { username, description, avatar } = req.body;

  if (!username || !description) {
    next(createError(422, 'Empty files not allowed.'));
  } else {
    try {
      // i: case insensitive
      // s: dot (.), blank spaces or new line
      // \b ... \b: solo permite cadenas que sean igual a "username"
      let user = await User.findOne({ username: new RegExp('\\b' + username + '\\b', 'is') }, 'username');
      if (user && (user.username !== req.session.currentUser.username)) {
        return next(createError(422, 'Username already exist.'));
      }
      user = await User.findByIdAndUpdate(userId, { username, description, avatar }, { new: true });
      res.status(200).json({
        message: 'User profile updated successfully',
        user,
      });
    } catch (error) {
      next(error);
    }
  }
});

module.exports = router;
