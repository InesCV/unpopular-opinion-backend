const express = require('express');

const router = express.Router();

const User = require('../models/user');
const Opinion = require('../models/opinion');
const Response = require('../models/response');

// const { isLoggedIn } = require('../helpers/middlewares');

// router.use(isLoggedIn('user'));

router.get('/:id', async (req, res, next) => {
  let user = null;
  console.log(req.session);

  if (req.params.id) {
    user = req.params.id;
  } else {
    user = req.session.currentUser._id;
  }

  try {
    const { username, description, avatar } = await User.findById(user);
    const opinions = await Opinion.find({ author: { $in: [user] } }).select('question response -_id');
    res.status(200).json({
      message: 'User data returned succesfully',
      user: {
        username,
        description,
        avatar,
        opinions,
      },
    });
  } catch (error) {
    next(error);
  }
});

// router.put('/user', async(req, res, next) => {
//   const newData = req.body;
//   try{
//     const userModifiedData = await User.findByIdAndUpdate(userID, { name, description }, { new:true });
//     res.status(200).json({message: 'hola'})
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = router;
