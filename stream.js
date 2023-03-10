const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Define your existing API routes here...

// Set up Socket.io listeners
io.on('connection', socket => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
server.listen(5000, () => {
  console.log('Server is running on port 5000');
});