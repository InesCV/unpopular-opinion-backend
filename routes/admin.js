const express = require('express');

const router = express.Router();

const User = require('../models/user');
const Opinion = require('../models/opinion');
const Response = require('../models/response');

const reported = require('./reported');

const { isLoggedIn } = require('../helpers/middlewares');

router.use(isLoggedIn('admin'));

router.use('/reported', reported);

router.get('/', async (req, res, next) => {
  
});

module.exports = router;
