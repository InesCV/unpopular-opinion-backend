const express = require('express');

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
    const { username, description, avatar } = await User.findById(user);
    const opinions = await Opinion.find({ author: { $in: [user] } }).select('question response -_id');
    res.status(200).json({
      message: 'User data returned succesfully',
      user: {
        username,
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

  if (username === '' || description === '') {
    req.flash('error', 'No empty fields allowed.');
    res.status(400).json({
      message: 'No empty fields alowed.',
      user: null,
    });
  } else {
    try {
      const user = await User.findByIdAndUpdate(userId, { username, description, avatar }, { new: true });
      res.status(200).json({
        message: 'User profile updated succesfully',
        user,
      });
    } catch (error) {
      next(error);
    }
  }
});

module.exports = router;
