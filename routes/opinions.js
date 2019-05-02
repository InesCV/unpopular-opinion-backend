/* eslint-disable no-underscore-dangle */
const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');

const Opinion = require('../models/opinion');
const Response = require('../models/response');
const { isLoggedIn } = require('../helpers/middlewares');

router.use(isLoggedIn('user'));

router.get('/', async (req, res, next) => {
  try {
    const opinions = await Opinion.find().populate('author');
    res.status(200).json(opinions);
  } catch (error) {
    next(error);
  }
  // const { _id: userId } = req.session.currentUser;
  // try {
  //   console.log(userId);
  //   const opinions = await Response.find({ responses: { $nin: [mongoose.Types.ObjectId(userId)] } });
  //   console.log(opinions);
  //   res.status(200).json(opinions);
  // } catch (error) {
  //   next(error);
  // }
});

router.get('/all', async (req, res, next) => {
  try {
    const opinions = await Opinion.find().populate('author');
    res.status(200).json(opinions);
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

router.get('/categories', async (req, res, next) => {
  try {
    res.status(200).json(Opinion.schema.path('category').enumValues);
  } catch (error) {
    next(error);
  }
});

router.post('/response', async (req, res, next) => {
  const { _id: userId } = req.session.currentUser;
  const { opinionId, responseBody } = req.body;
  try {
    let registeredResponse = await Response.findOne({ opinion: { $in: [opinionId] } });
    if (!registeredResponse) {
      registeredResponse = await Response.create({
        opinion: opinionId,
        responses: [{ user: userId, response: responseBody }],
      });
    } else {
      const indexHasResponded = registeredResponse.responses.findIndex((resp) => {
        return resp.user.equals(userId);
      });
      if (indexHasResponded === -1) {
        registeredResponse = await Response.findByIdAndUpdate(registeredResponse._id, { $push: { responses: { user: userId, responseBody } } }, { new: true });
      }
    }

    res.status(200).json({
      message: 'Response registered succesfully',
      registeredResponse,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
