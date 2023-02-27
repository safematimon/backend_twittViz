const express = require('express');
const createError = require('http-errors');
const morgan = require('morgan');
const mongoose = require('mongoose')
require('dotenv').config();

// mongoose
mongoose.Promise = global.Promise;

mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://admin:1234@cluster0.hv7pxi6.mongodb.net/?retryWrites=true&w=majority')
        .then(() => console.log('connect dai leaw'))
        .catch((err) => console.error(err));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
// add
// const http = require('http');
// const server = http.createServer(app);
// const { Server } = require('socket.io')
// const io = new Server(server)

// app.get('/socket', async (req, res, next) => {
//   res.send('<h1>Hello socket<h1>');
// });

// io.on('connection',(socket)=>{
//   console.log()
// })
// 
app.get('/', async (req, res, next) => {
  res.send({ message: 'Awesome it works 🐻' });
});

app.use('/api', require('./routes/api.route'));
// moongose here

app.use((req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));

// server.listen(4000,()=>{
//   console.log('listening on port 4000')
// })