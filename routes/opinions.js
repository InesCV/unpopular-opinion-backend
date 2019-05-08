/* eslint-disable no-underscore-dangle */
const express = require('express');

const router = express.Router();

const Opinion = require('../models/opinion');
const Response = require('../models/response');
const { isLoggedIn } = require('../helpers/middlewares');

router.use(isLoggedIn('user'));


router.get('/', async (req, res, next) => {
  const { _id: userId } = req.session.currentUser;
  try {
    const responsed = await Response.find({ user: userId }).select('opinion -_id');
    const filter = responsed.map(e => e.opinion);
    const filteredOpinions = await Opinion.find({ _id: { $nin: filter } });
    res.status(200).json(filteredOpinions);
  } catch (error) {
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
  } catch (error) {
    next(error);
  }
});

router.get('/all', async (req, res, next) => {
  try {
    const opinions = await Opinion.find().populate('author');
    res.status(200).json(opinions);
  } catch (error) {
    next(error);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    res.status(200).json(Opinion.schema.path('category').enumValues);
  } catch (error) {
    next(error);
  }
});

router.post('/response', async (req, res, next) => {
  const { _id: user } = req.session.currentUser;
  const { opinion, response } = req.body;
  try {
    const registeredResponse = await Response.create({ opinion, user, response });
    res.status(200).json({
      message: 'Response registered succesfully',
      registeredResponse,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
