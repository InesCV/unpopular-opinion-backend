const SocketIO = require('socket.io');
const tools = require('../helpers/tools');

function socketService(server) {
  const io = SocketIO(server);

  // Array holding sockets associated with userIds and lastestPositions
  const sockets = [];

  io.on('connection', (socket) => {
    // Send custom welcome message to one client connected
    // io.to(`${socket.id}`).emit('message', `Welcome to UOP! ${socket.id}`);

    // Add user info to socket array
    socket.on('me', async (userId) => {
      let index = await tools.findUserSocket(userId, sockets);
      if (index < 0) {
        sockets.push({
          userId,
          socket: socket.id,
          position: null,
        });
      } else {
        sockets[index].socket = socket.id;
        // clearInterval(sockets[index].interval);
        // sockets[index].interval = null;
      }
      index = tools.findUserSocket(userId, sockets);
      if (sockets[index].position !== null) {
        tools.updateUserPosition(sockets[index].userId, sockets[index].position);
      }
      // const updatePositionInterval = setInterval(() => {
      //   tools.updateUserPosition(sockets[index].userId, sockets[index].position)
      //   io.to(`${socket.id}`).emit('message', 'Posicion actualizada en bbdd');
      // }, 30000);
      // sockets[index].interval = updatePositionInterval;
    });

    // User has update him position
    socket.on('update-position', async ({ userId, position }) => {
      const index = tools.findUserSocket(userId, sockets);
      if (index >= 0) {
        sockets[index].position = position;
      }
    });

    // Stop bdd update interval
    // socket.on('stopUpdateInterval', () => {
    //   clearInterval(updatePositionInterval);
    //   updatePositionInterval = null;
    // });

    // InMyZone
    socket.on('InMyZone', async (userId) => {
      // update users positions to the last updated
      for (const userSocket of sockets) {
        if (userSocket.position) {
          tools.updateUserPosition(userSocket.userId, userSocket.position);
        }
      }

      // find near users
      const nearUopers = await tools.findNearUopers(userId);

      // return nearUopers array
      io.to(`${socket.id}`).emit('NearUopers', nearUopers);
    });

    // User logout
    socket.on('logout', async (userId) => {
      // clearInterval(updatePositionInterval);
      // updatePositionInterval = null;
      // Search userId into socketsArray to get him information
      const index = await tools.findUserSocket(userId, sockets);

      // Updates lastest position of the user before logout
      if (sockets[index].position) {
        tools.updateUserPosition(sockets[index].userId, sockets[index].position);
      }

      // Delete user of sockets array
      sockets.splice(index, 1);
    });
  });
}

module.exports = socketService;
