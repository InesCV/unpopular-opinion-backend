const express = require('express');

const router = express.Router();

const User = require('../models/user');
const Opinion = require('../models/opinion');
const Response = require('../models/response');
const Reported = require('../models/reported');

const { isLoggedIn } = require('../helpers/middlewares');

router.use(isLoggedIn('admin'));

router.get('/', async (req, res, next) => {
  res.status(200).json({ message: 'Da real admin!' });
});

module.exports = router;
