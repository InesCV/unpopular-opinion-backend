const express = require('express');

const router = express.Router();

const User = require('../models/user');

const reported = require('./reported');

const { isLoggedIn } = require('../helpers/middlewares');

router.use(isLoggedIn('admin'));

router.use('/reported', reported);

router.delete('/user/:userId', async (req, res, next) => {
  const { userId } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    const data = {
      message: 'Deleted user succesfully.',
      deletedUser,
    };
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
