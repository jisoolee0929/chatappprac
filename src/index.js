const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
  generateMessage,
  generateLocationMessage,
} = require('./utils/messages');

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));
app.use(express.json());

app.get('/', (req, res) => {
  es.render('index.html');
});

io.on('connection', (socket) => {
  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed');
    }

    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit('message', generateMessage(user.username, message));
    }

    callback();
  });

  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(room);
    socket.emit('message', generateMessage('Admin', 'Welcome'));
    socket.broadcast
      .to(room)
      .emit('message', generateMessage('Admin', `${user.username} has joined`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on('sendLocation', (message, callback) => {
    const user = getUser(socket.id);

    if (user) {
      io.emit(
        'locationMessage',
        generateLocationMessage(
          user.username,
          `https://google.com/maps?q=${message.longitude},${message.latitude}`
        )
      );
    }
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage('Admin', `${user.username} has left`)
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log('started');
});
