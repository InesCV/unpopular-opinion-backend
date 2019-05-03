const express = require('express');

const router = express.Router();

const User = require('../models/user');
const Opinion = require('../models/opinion');
const Response = require('../models/response');

const { isLoggedIn } = require('../helpers/middlewares');

router.post('/', (req, res, next) => {
  const query = req.body;
  console.log(query);
  const result = { estado: 'todo chachi' };
  res.status(200).json(result);
});

// router.get('/opinions', async (req, res, next)=> {

// });

// router.get('/opinions/opinion/:id', async (req, res, next) => {
//   const { id: user } = req.params;

//   try {
//     const { username, description, avatar, role } = await User.findById(user);
//     const opinions = await Opinion.find({ author: { $in: [user] } }).select('category question response -_id');
//     // const responses = await Response.find({ author: { $in: [user] } }).select('category question response -_id');


//     res.status(200).json({
//       message: 'User data returned succesfully',
//       user: {
//         username,
//         description,
//         avatar,
//         role,
//         opinions,
//         request: {
//           type: 'GET',
//           url: `${process.env.HEROKU}/users/${user}`,
//         },
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// router.get('/opinions/categories', async (req, res, next)=> {

// });

// router.get('/opinions/categories/:id', async (req, res, next)=> {

// });

module.exports = router;
