const express = require('express');

const router = express.Router();

const User = require('../models/user');
const Opinion = require('../models/opinion');
const Response = require('../models/response');

const { isLoggedIn } = require('../helpers/middlewares');

router.use(isLoggedIn('user'));

router.post('/', async (req, res, next) => {
  const query = req.body;

  switch (Object.keys(query)[0]) {
    case 'category':
      console.log('category');
      break;
    case 'user':
      console.log('user');
      break;
    case 'opinion':
      const responses = await Response.find();
      console.log(responses);
      break;
    default:
  }

  const result = { estado: 'todo chachi' };
  res.status(200).json(result);
});

module.exports = router;
