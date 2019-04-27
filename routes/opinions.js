const express = require('express');
// const createError = require('http-errors');
const router = express.Router();

const Opinion = require('../models/opinion');

// const { isLoggedIn } = require('../helpers/middlewares');

router.get('/', async (req, res) => {
  console.log(req.session.currentUser);
  const opinions = await Opinion.find();
  res.status(200).json(opinions);
});

router.get('/categories', (req, res) => {
  res.status(200).json(Opinion.schema.path('category').enumValues);
});

router.post('/', async (req, res, next) => {
  const author = req.session.currentUser;
  console.log(req.session);
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
