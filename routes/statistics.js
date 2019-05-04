const express = require('express');

const router = express.Router();

// const User = require('../models/user');
// const Opinion = require('../models/opinion');
const Response = require('../models/response');

const { isLoggedIn } = require('../helpers/middlewares');

router.use(isLoggedIn('user'));

router.post('/', async (req, res, next) => {
  const query = req.body;
  let data = null;
  let stat = 0;
  let responses = null;
  let responseIndex = null;

  if (!Object.prototype.hasOwnProperty.call(query, 'user')) {
    query.user = req.session.currentUser._id;
  }

  switch (query.type) {
    case 'category':
      console.log('category');
      break;
    case 'user':
      console.log('user');
      break;
    case 'opinion':
      break;
    case 'opinionRate':
      // Find all responses to an specific opinion
      responses = await Response.find({ opinion: query.opinion });
      // Find what the user has responded to that specific opinion
      responseIndex = responses.findIndex(resp => resp.user.equals(query.user));
      // Count how many people have responded the same as the user
      if (responseIndex >= 0) {
        stat = responses.reduce((cont, resp) => {
          if (resp.response == responses[responseIndex].response) {
            return cont + 1;
          }
          return cont;
        }, 0);
      }
      // Calculate the % of the people that has responded the same as the user
      stat = (stat / responses.length) * 100;
      data = {
        message: 'Opinion statistics',
        stat,
      };
      break;
    default:
  }

  res.status(200).json(data);
});

module.exports = router;
