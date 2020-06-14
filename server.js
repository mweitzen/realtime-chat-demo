const express = require('express');

const path = require('path');
const http = require('http');

// socket stuff to consider moving to separate file
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const botName = 'ChatCord Bot';

//
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder for html serving
app.use(express.static(path.join(__dirname, 'public')))

// Connect to socketio when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({username, room}) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit('message', formatMessage(botName, 'Welcome to my awesome shit'))

    // Broadcast when a user connects
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `'${user.username}' has joined the chat`))

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })

  })

  // Listen for chat message
  socket.on('chatMessage', (message) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, message))
  })

  // Broadcast when a user disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if(user) {
      io.to(user.room).emit('message', formatMessage(botName, `'${user.username}' has left the chat`))

      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    }
  })
})

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server is runing on PORT ${PORT}`))
