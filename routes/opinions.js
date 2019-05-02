const express = require('express');
const router = express.Router();

const Opinion = require('../models/opinion');
const Response = require('../models/response');
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

router.post('/response', async (req, res, next) => {
  const { _id: userId } = req.session.currentUser;
  const { opinionId, response } = req.body;

  try {
    let registeredQuestion = await Response.findOne({opinion: { $in: [opinionId] }});

    if (!registeredQuestion) {
      registeredQuestion = await Response.create({
        opinion: opinionId,
        response: [{user: userId, response}],
      })
    } else {
      registeredQuestion = await Response.findByIdAndUpdate(registeredQuestion._id, { $push: { responses: {user: userId, response}  } }, { new:true });
    }

    res.status(200).json({
      message: "Response registered succesfully",
      registeredQuestion,
    });
  } catch(error) {
    next(error);
  }
});

module.exports = router;
