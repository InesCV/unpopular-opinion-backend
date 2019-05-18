const SocketIO = require('socket.io');
const tools = require('../helpers/tools');

function socketService(server) {
  const io = SocketIO(server);

  // Array holding sockets associated with userIds and lastestPositions
  const sockets = [];

  io.on('connection', (socket) => {
    // Send custom welcome message to one client connected
    io.to(`${socket.id}`).emit('message', `Welcome to UOP! ${socket.id}`);

    // Add user info to socket array
    socket.on('me', async (userId) => {
      let index = await tools.findUserSocket(userId, sockets);
      if (index < 0) {
        sockets.push({
          userId,
          socket: socket.id,
          position: [],
          // interval: null,
        });
      } else {
        sockets[index].socket = socket.id;
        // clearInterval(sockets[index].interval);
        // sockets[index].interval = null;
      }
      index = tools.findUserSocket(userId, sockets);
      tools.updateUserPosition(sockets[index].userId, sockets[index].position);
      // const updatePositionInterval = setInterval(() => {
      //   tools.updateUserPosition(sockets[index].userId, sockets[index].position)
      //   io.to(`${socket.id}`).emit('message', 'Posicion actualizada en bbdd');
      // }, 30000);
      // sockets[index].interval = updatePositionInterval;
      io.to(`${socket.id}`).emit('message', `Sockets: ${sockets}`);
    });

    // User has update him position
    socket.on('update-position', async ({ userId, position }) => {
      io.to(`${socket.id}`).emit('message', `User: ${userId}, Position: ${position}`);
      const index = tools.findUserSocket(userId, sockets);
      if (index >= 0) {
        sockets[index].position = position;
      }
      console.log(`Sockets: ${sockets}`);
    });

    // Stop bdd update interval
    // socket.on('stopUpdateInterval', () => {
    //   clearInterval(updatePositionInterval);
    //   updatePositionInterval = null;
    // });

    // User logout
    socket.on('logout', async (userId) => {
      // clearInterval(updatePositionInterval);
      // updatePositionInterval = null;
      const index = await tools.findUserSocket(userId, sockets);
      sockets.splice(index, 1);
    });

    // InMyZone
    socket.on('InMyZone', async (userId) => {
      console.log(`Sockets: ${sockets}`);
      // Search userId into socketsArray to get him information
      const index = await tools.findUserSocket(userId, sockets);
      io.to(`${socket.id}`).emit('message', `InMyZone - index: ${index}`);

      // TODO: update users positions to the last updated
      await tools.updateAllUserPositions(sockets);

      // TODO: find near users
      const nearUopers = await tools.findNearUopers(userId);

      // TODO: return nearUopers array
      sockets[index].socket.emit('NearUopers', nearUopers);
    });
  });
}

module.exports = socketService;
