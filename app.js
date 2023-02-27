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

app.get('/', async (req, res, next) => {
  res.send({ message: 'root path Awesome it works 🐻' });
});

app.use('/api', require('./routes/api.route'));


// not use
app.use((req, res, next) => {
  next(createError.NotFound());
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'domain-a.com')
  res.header('Access-Control-Allow-Methods','POST, GET, PUT, PATCH, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers','Content-Type, Option, Authorization')
  return next()
})

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
app.listen(4000, () => {
  console.log('running on port 4000');
});

// server.listen(4000,()=>{
//   console.log('listening on port 4000')
// })