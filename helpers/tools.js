const User = require('../models/user');

module.exports = {
  findUserSocket: (id, sockets) => sockets.findIndex(socket => socket.userId === id),

  updateUserPosition: async (userId, position) => {
    const user = await User.findOne({ _id: userId });
    if (!(user.position.coordinates[0] === position[0] && user.position.coordinates[1] === position[1])) {
      user.position = {
        type: 'Point',
        coordinates: position,
      };
      await user.save();
    }
  },

  findNearUopers: async (userId) => {
    try {
      const user = await User.findOne({ _id: userId });

      const uopers = await User.find({
        position: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [user.position.coordinates[0], user.position.coordinates[1]],
            },
            $maxDistance: 500,
            $minDistance: 0,
          },
        },
      });
      return uopers;
    } catch (error) {
      console.log(error);
    }
  },
};
