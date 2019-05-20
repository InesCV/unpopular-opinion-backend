const express = require('express');
const createError = require('http-errors');

const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');

const {
  isLoggedIn,
  isNotLoggedIn,
  validationLoggin,
  validationSignup,
} = require('../helpers/middlewares');

router.get('/me', isLoggedIn('user'), (req, res, next) => {
  res.json(req.session.currentUser);
});

router.post(
  '/login',
  isNotLoggedIn(),
  validationLoggin(),
  async (req, res, next) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user) {
        next(createError(404, "User doesn't exist"));
      } else if (bcrypt.compareSync(password, user.password)) {
        req.session.currentUser = user;
        return res.status(200).json(user);
      } else {
        next(createError(401, "User couldn't be created"));
      }
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/signup',
  isNotLoggedIn(),
  validationSignup(),
  async (req, res, next) => {
    const { username, password, email } = req.body;
    try {
      // i: case insensitive
      // s: dot (.), blank spaces or new line
      // \b ... \b: solo permite cadenas que sean igual a "username"
      const user = await User.findOne({ $or: [{ username: new RegExp('\\b' + username + '\\b', 'is') }, { email: new RegExp('\\b' + email + '\\b', 'is') }] }, 'username');

      if (user) {
        return next(createError(422, 'User or email already exist'));
      }
      const salt = bcrypt.genSaltSync(10);
      const hashPass = bcrypt.hashSync(password, salt);
      const position = {
        type: 'Point',
        coordinates: [0, 0],
      };
      const newUser = await User.create({ username, password: hashPass, email, position });
      req.session.currentUser = newUser;
      res.status(200).json(newUser);
    } catch (error) {
      next(error);
    }
  },
);

router.post('/logout', isLoggedIn('user'), (req, res, next) => {
  req.session.destroy();
  return res.status(204).send();
});

router.get('/private', isLoggedIn('user'), (req, res, next) => {
  res.status(200).json({
    message: 'This is a private message',
  });
});

module.exports = router;
