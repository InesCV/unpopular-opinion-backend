const express = require('express');

const router = express.Router();

const User = require('../models/user');
const Opinion = require('../models/opinion');
const Response = require('../models/response');

const { isLoggedIn } = require('../helpers/middlewares');

router.use(isLoggedIn('user'));

router.post('/', async (req, res, next) => {
  const query = req.body;
  let data = null;
  let stat = 1;

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
      const responses = await Response.find({ 'opinion': query.opinion });
      const responseIndex = responses.findIndex((resp)=>{
        return resp.user.equals(query.user);
      });
      if (responseIndex > 0) {
        stat = responses.reduce((cont, resp) => {
          if (resp.response == responses[responseIndex].response) {
            return cont + 1;
          }
          return cont;
        }, 0);
      }
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
