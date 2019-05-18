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

  updateAllUserPositions: async (sockets) => {
    for (const userSocket of sockets) {
      updateUserPosition(userSocket.id, userSocket.position);
    }
  },

  findNearUopers: async (userId) => {
    const user = await User.findOne({ _id: userId });

    const uopers = await User.find({
      position: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [user.position.coordinates[0], user.position.coordinates[1]],
          },
          $maxDistance: 400,
          $minDistance: 0,
        },
      },
    });
    return uopers;
  },
};
