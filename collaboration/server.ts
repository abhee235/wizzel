import debug from 'debug';
import http from 'http';
import { Server as socketIO } from 'socket.io';

type UserToFollow = {
  socketId: string;
  username: string;
};
type OnUserFollowedPayload = {
  userToFollow: UserToFollow;
  action: 'FOLLOW' | 'UNFOLLOW';
};

const serverDebug = debug('server');
const ioDebug = debug('io');
const socketDebug = debug('socket');
let activeUsers = 0;
const clients = {}; // Object to store clients and their client IDs

const server = http.createServer();

// const broadcastClientUpdate = () => {
//   io.emit('updateClients', Array.from(new Set(Object.values(clients)))); // Broadcast updated clients to all clients
// };

try {
  const io = new socketIO(server, {
    transports: ['websocket', 'polling'],
    cors: {
      origin: '*', // Your client URL
      methods: ['GET', 'POST'], // Allowed methods
      allowedHeaders: ['my-custom-header'], // If you need custom headers
      credentials: true, // If you need to allow credentials (cookies, etc.)
    },
  });

  io.on('connection', (socket) => {
    console.log('New user connected', socket.id);
    activeUsers++;

    // // Check if the client passed a clientId
    // socket.on('registerClient', (data) => {
    //   let clientId;

    //   if (data.clientId) {
    //     clientId = data.clientId; // Use the existing clientId passed by the client
    //     console.log(`Client reconnected with clientId: ${clientId}`);
    //   } else {
    //     clientId = uuidv4(); // Generate a new clientId if none was provided
    //     socket.emit('clientRegistered', { clientId }); // Send the generated clientId to the client
    //     console.log(`New client registered with clientId: ${clientId}`);
    //   }

    //   // Store the clientId in memory (or in a database)
    //   clients[socket.id] = clientId;
    //   console.log('All clients:', clients);

    //   broadcastClientUpdate();
    // });

    io.to(`${socket.id}`).emit('init-room');
    socket.on('join-room', async (roomID) => {
      socketDebug(`${socket.id} has joined ${roomID}`);
      await socket.join(roomID);
      const sockets = await io.in(roomID).fetchSockets();
      if (sockets.length <= 1) {
        io.to(`${socket.id}`).emit('first-in-room');
      } else {
        console.log(`${socket.id} new-user emitted to room ${roomID}`);
        socketDebug(`${socket.id} new-user emitted to room ${roomID}`);
        socket.broadcast.to(roomID).emit('new-user', socket.id);
      }

      io.in(roomID).emit(
        'room-user-change',
        sockets.map((socket) => socket.id)
      );
    });

    socket.on(
      'server-broadcast',
      (roomID: string, encryptedData: ArrayBuffer, iv: Uint8Array) => {
        socketDebug(`${socket.id} sends update to ${roomID}`);
        socket.broadcast.to(roomID).emit('client-broadcast', encryptedData, iv);
      }
    );

    socket.on(
      'server-volatile-broadcast',
      (roomID: string, encryptedData: ArrayBuffer, iv: Uint8Array) => {
        socketDebug(`${socket.id} sends volatile update to ${roomID}`);
        socket.volatile.broadcast
          .to(roomID)
          .emit('client-broadcast', encryptedData, iv);
      }
    );

    socket.on('user-follow', async (payload: OnUserFollowedPayload) => {
      const roomID = `follow@${payload.userToFollow.socketId}`;

      switch (payload.action) {
        case 'FOLLOW': {
          await socket.join(roomID);

          const sockets = await io.in(roomID).fetchSockets();
          const followedBy = sockets.map((socket) => socket.id);

          io.to(payload.userToFollow.socketId).emit(
            'user-follow-room-change',
            followedBy
          );

          break;
        }
        case 'UNFOLLOW': {
          await socket.leave(roomID);

          const sockets = await io.in(roomID).fetchSockets();
          const followedBy = sockets.map((socket) => socket.id);

          io.to(payload.userToFollow.socketId).emit(
            'user-follow-room-change',
            followedBy
          );

          break;
        }
      }
    });

    socket.on('disconnecting', async () => {
      socketDebug(`${socket.id} has disconnected`);
      for (const roomID of Array.from(socket.rooms)) {
        const otherClients = (await io.in(roomID).fetchSockets()).filter(
          (_socket) => _socket.id !== socket.id
        );

        const isFollowRoom = roomID.startsWith('follow@');

        if (!isFollowRoom && otherClients.length > 0) {
          socket.broadcast.to(roomID).emit(
            'room-user-change',
            otherClients.map((socket) => socket.id)
          );
        }

        if (isFollowRoom && otherClients.length === 0) {
          const socketId = roomID.replace('follow@', '');
          io.to(socketId).emit('broadcast-unfollow');
        }
      }
    });

    socket.on('disconnect', () => {
      socket.removeAllListeners();
      socket.disconnect();
    });
  });
} catch (error) {
  console.error(error);
}

// socket.on('cursorMove', (data) => {
//   console.log('Received cursorMove from client:', data);
//   socket.broadcast.emit('cursorMove', data); // Broadcast to all other clients
// });

// socket.on('canvasObjects', (canvasData) => {
//   //console.log("Received canvasOject from client:", canvasData);
//   socket.broadcast.emit('canvasObjects', canvasData); // Emit only canvasObjects
// });

//   socket.on('disconnect', () => {
//     //activeUsers--;
//     console.log('User disconnected');
//     // io.emit("activeUsers", { activeUsers });
//     delete clients[socket.id]; // Clean up client information
//     //socket.broadcast.emit("removeCursor", socket.id);
//     broadcastClientUpdate();
//   });
// });

server.listen(3001, () => {
  console.log('WebSocket server running on port 3001');
});