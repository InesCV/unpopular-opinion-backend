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
    const reported = await Opinion.find({ isReported: true, isChecked: false }).populate('author');
    let data = {
      message: 'No reported Opinions to check.',
      reported: [],
    };
    if (reported.length > 0) {
      data = {
        message: 'Reported Opinions to check.',
        reported,
      };
    }
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  let { opinion, isChecked } = req.body;
  let data = null;

  if (opinion === '' || isChecked === '') {
    data = {
      message: 'No empty fields allowed.',
      updatedOpinion: [],
    };
  } else {
    try {
      await Reported.findOneAndUpdate({ opinion }, { isChecked }, { new: true });
      const updatedOpinion = await Opinion.findByIdAndUpdate(opinion, { isChecked }, { new: true });
      data = {
        message: 'Report succesfully updated.',
        updatedOpinion,
      };
    } catch (error) {
      next(error);
    }
  }
  res.status(200).json(data);
});

router.delete('/:opinionId', async (req, res, next) => {
  const { opinionId } = req.params;

  try {
    await Reported.remove({ opinion: opinionId });
    const deletedOpinion = await Opinion.findByIdAndDelete(opinionId);
    const data = {
      message: 'Deleted opinion succesfully.',
      deletedOpinion,
    };
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
