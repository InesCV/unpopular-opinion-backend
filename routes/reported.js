const express = require('express');

const router = express.Router();

const User = require('../models/user');
const Opinion = require('../models/opinion');
const Response = require('../models/response');
const Reported = require('../models/reported');

const { isLoggedIn } = require('../helpers/middlewares');

router.use(isLoggedIn('admin'));

router.get('/', async (req, res, next) => {
  const { _id: adminId } = req.session.currentUser;
  try {
    const reported = Reported.find({ isChecked: 'false' }).populate('reportedBy');
    res.status(200).json({
      data: {
        message: "Reported Opinions to check.",
        reported,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  const { _id: adminId } = req.session.currentUser;
  const { reportedId } = req.params;

  try {
    const reported = Reported.find({ isChecked: 'false' }).populate('reportedBy');
    res.status(200).json({
      data: {
        message: "Reported Opinions to check.",
        reported,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
