const SocketIO = require('socket.io');
const tools = require('../helpers/tools');

function socketService (server) {
  const io = SocketIO(server);

  // Array holding sockets associated with userIds and lastestPositions
  const sockets = [];

  io.on('connection', (socket) => {
    let updatePositionInterval = null;

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
          interval: null,
        });
      } else {
        sockets[index].socket = socket.id;
        clearInterval(sockets[index].interval);
        sockets[index].interval = null;
      }
      index = tools.findUserSocket(userId, sockets);
      updatePositionInterval = setInterval(() => {
        tools.updateUserPosition(sockets[index].userId, sockets[index].position)
        io.to(`${socket.id}`).emit('message', 'Posicion actualizada en bbdd');
      }, 30000);
      sockets[index].interval = updatePositionInterval;
    });

    // User has update him position
    socket.on('update-position', async ({ userId, position }) => {
      io.to(`${socket.id}`).emit('message', `User: ${userId}, Position: ${position}`);
      const index = tools.findUserSocket(userId, sockets);
      if (index >= 0) {
        sockets[index].position = position;
      }
    });

    // Stop bdd update interval
    socket.on('stopUpdateInterval', () => {
      clearInterval(updatePositionInterval);
      updatePositionInterval = null;
    });

    // User logout
    socket.on('logout', async (userId) => {
      clearInterval(updatePositionInterval);
      updatePositionInterval = null;
      const index = await tools.findUserSocket(userId, sockets);
      sockets.splice(index, 1);
    });

    // InMyZone
    socket.on('InMyZone', async (id) => {
      // Search userId into socketsArray to get him information
      const index = tools.findUserSocket(id, sockets);

      // TODO: update users positions to the last updated
      await tools.updateUserPosition(sockets[index].userId, sockets[index].position);

      // TODO: find near users
      const nearOpiners = await tools.findNearOpiners(sockets[index].userId);

      // TODO: return nearOpiners array
      sockets[index].socket.emit('NearOpiners', nearOpiners);
    });
  });
}

module.exports = socketService;
