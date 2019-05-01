const express = require ('Express');
const router = express.Router();

const User = require ('../models/user');
const Opinion = require ('../models/opinion');

const { isLoggedIn } = require('../helpers/middlewares');

router.get('/:id', async(req, res, next) => {
  const { id: user } = req.params;
  console.log('user: ', user);
  
  try{
    const { username, description, avatar, role} = await User.findById(user);
    const opinions = await Opinion.find({ author: { $in: [user] } }).select("response category question -_id");

    res.status(200).json({
      message: "User data returned succesfully",
      user: {
        username,
        description,
        avatar,
        role,
        opinions,
        request: {
            type: 'GET',
            url: `${process.env.HEROKU}/users/` + user,
        }
      }
    });
  } catch (error) {
    next(error);
  }
});


module.exports = router;
