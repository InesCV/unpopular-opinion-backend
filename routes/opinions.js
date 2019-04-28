const express = require('express');
// const createError = require('http-errors');
const router = express.Router();

const Opinion = require('../models/opinion');

const { isLoggedIn } = require('../helpers/middlewares');

router.get('/', isLoggedIn(), async (req, res) => {
  const opinions = await Opinion.find();
  res.status(200).json(opinions);
});

router.get('/categories', isLoggedIn(), (req, res) => {
  res.status(200).json(Opinion.schema.path('category').enumValues);
});

router.post('/', isLoggedIn(), async (req, res, next) => {
  console.log('Back-currentUser: ', req.session.currentUser);
  const { _id: author } = req.session.currentUser;
  const { category, question, response } = req.body;
  try {
    const newOpinion = await Opinion.create({
      author, category, question, response,
    });
    res.status(200).json(newOpinion);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
