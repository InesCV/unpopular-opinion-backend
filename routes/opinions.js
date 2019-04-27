const express = require('express');
// const createError = require('http-errors');
const router = express.Router();

const Opinion = require('../models/opinion');

// const { isLoggedIn } = require('../helpers/middlewares');

router.get('/', async (req, res) => {
  const opinions = await Opinion.find();
  res.status(200).json(opinions);
});

router.get('/categories', (req, res) => {
  console.log(Opinion.schema.path('category').enumValues);
  res.status(200).json(Opinion.schema.path('category').enumValues);
});

router.post('/', async (req, res, next) => {
  // const author = res.locals.currentUser._id;
  const { category, question, response } = req.body;
  console.log(req.body);
  try {
    const newOpinion = await Opinion.create({ category, question, response });
    res.status(200).json(newOpinion);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
