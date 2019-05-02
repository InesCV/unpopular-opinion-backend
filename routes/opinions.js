const express = require('express');
const router = express.Router();

const Opinion = require('../models/opinion');
const { isLoggedIn } = require('../helpers/middlewares');

router.use(isLoggedIn("user"));

router.get('/', async (req, res, next) => {
  try {
    const opinions = await Opinion.find().populate('author');
    res.status(200).json(opinions);
  } catch(error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const { _id: author } = req.session.currentUser;
  const { category, question, response } = req.body;
  try {
    const newOpinion = await Opinion.create({
      author, category, question, response,
    });
    res.status(200).json(newOpinion);
  } catch(error) {
    next(error);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    res.status(200).json(Opinion.schema.path('category').enumValues);
  } catch(error) {
    next(error);
  }
});

router.get('/response', async (req, res, next) => {
  try {
    

  } catch(error) {
    next(error);
  }
});

module.exports = router;
