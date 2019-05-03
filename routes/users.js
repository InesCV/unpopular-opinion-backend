const express = require('express');

const router = express.Router();

const User = require('../models/user');
const Opinion = require('../models/opinion');
const Response = require('../models/response');

const { isLoggedIn } = require('../helpers/middlewares');

router.get('/:id', async (req, res, next) => {
  const { id: user } = req.params;

  try {
    const { username, description, avatar, role } = await User.findById(user);
    const opinions = await Opinion.find({ author: { $in: [user] } }).select('category question response -_id');
    const responses = await Response.find({ author: { $in: [user] } }).select('category question response -_id');


    res.status(200).json({
      message: 'User data returned succesfully',
      user: {
        username,
        description,
        avatar,
        role,
        opinions,
        request: {
          type: 'GET',
          url: `${process.env.HEROKU}/users/${user}`,
        },
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
