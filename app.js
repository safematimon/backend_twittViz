const express = require('express');
const app = express()
const createError = require('http-errors');
const morgan = require('morgan');
const mongoose = require('mongoose')
const cors = require('cors')
const needle = require('needle')
require('dotenv').config();

const http = require('http')
const path = require('path')
const socketIO = require('socket.io')
const PORT = 4000

// const server = http.createServer(app)
// const io = socketIO(server)
const server = http.createServer(app);
const io = socketIO(server)

const token = process.env.BEARER_TOKEN;
const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL = 'https://api.twitter.com/2/tweets/search/stream';


// // mongoose
mongoose.Promise = global.Promise;
mongoose.set('strictQuery', false);
// // old
// // mongoose.connect('mongodb+srv://admin:1234@cluster0.hv7pxi6.mongodb.net/test?retryWrites=true&w=majority')
// // new 
mongoose.connect('mongodb+srv://admin:1234@cluster0.yzkibdo.mongodb.net/?retryWrites=true&w=majority')
        .then(() => console.log('connect dai leaw'))
        .catch((err) => console.error(err));

// const app = express();

app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.get('/', async (req, res, next) => {
  res.send({ message: 'root path Awesome it works 🐻' });
});

app.use('/api', require('./routes/api.route'));

// // test zone

// // // app.use((err, req, res, next) => {
// // //   res.status(err.status || 500);
// // //   res.send({
// // //     status: err.status || 500,
// // //     message: err.message,
// // //   });
// // // });

// // app.listen(4000, () => {
// //   // api 
// //   // console.log('running on port 4000');
// // });

// // ====
// // The code below sets the bearer token from your environment variables
// // To set environment variables on macOS or Linux, run the export command below from the terminal:
// // export BEARER_TOKEN='YOUR-TOKEN'
// // const http = require('http')
// // const path = require('path')
// // const socketIO = require('socket.io')
// // const PORT = 5000

// // const server = http.createServer(app)
// // const io = socketIO(server)

// // const token = process.env.BEARER_TOKEN;
// // const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
// // const streamURL = 'https://api.twitter.com/2/tweets/search/stream';

// // Edit rules as desired below
// const rules = [{
//         'value': 'Blackpink -is:retweet',
//         // 'tag': 'dog pictures'
//     },
// ];

// async function getAllRules() {
//     const response = await needle('get', rulesURL, {
//         headers: {
//             "authorization": `Bearer ${token}`
//         }
//     })
//     if (response.statusCode !== 200) {
//         console.log("Error:", response.statusMessage, response.statusCode)
//         throw new Error(response.body);
//     }
//     return (response.body);
// }

// async function deleteAllRules(rules) {
//   if (!Array.isArray(rules.data)) {
//       return null;
//   }
//   const ids = rules.data.map(rule => rule.id);
//   const data = {
//       "delete": {
//           "ids": ids
//       }
//   }
//   const response = await needle('post', rulesURL, data, {
//       headers: {
//           "content-type": "application/json",
//           "authorization": `Bearer ${token}`
//       }
//   })
//   if (response.statusCode !== 200) {
//       throw new Error(response.body);
//   }
//   return (response.body);
// }

// async function setRules() {
//     const data = {
//         "add": rules
//     }
//     const response = await needle('post', rulesURL, data, {
//         headers: {
//             "content-type": "application/json",
//             "authorization": `Bearer ${token}`
//         }
//     })
//     if (response.statusCode !== 201) {
//         throw new Error(response.body);
//     }
//     return (response.body);
// }

// function streamConnect(retryAttempt) {
//   const stream = needle.get(streamURL, {
//     // config here
//     // const stream = needle.get(`${streamURL}?tweet.field`, {
//   headers: {
//           "User-Agent": "v2FilterStreamJS",
//           "Authorization": `Bearer ${token}`
//       },
//       timeout: 20000
//   });
//   stream.on('data', data => {
//       try {
//           const json = JSON.parse(data);
//           // print data here
//           console.log(">>>>",json);
//           retryAttempt = 0;
//       } catch (e) {
//           if (data.detail === "This stream is currently at the maximum allowed connection limit.") {
//               console.log(data.detail)
//               process.exit(1)
//           } else {
//           }
//       }
//   }).on('err', error => {
//       if (error.code !== 'ECONNRESET') {
//           console.log(error.code);
//           process.exit(1);
//       } else {
//           setTimeout(() => {
//               console.warn("A connection error occurred. Reconnecting...")
//               streamConnect(++retryAttempt);
//           }, 2 ** retryAttempt)
//       }
//   });
//   return stream;
// }


// // (async () => {
// //     let currentRules;
// //     try {
// //         currentRules = await getAllRules();
// //         await deleteAllRules(currentRules);
// //         await setRules();
// //     } catch (e) {
// //         console.error(e);
// //         process.exit(1);
// //     }
// //     streamConnect(0);
// // })();

io.on('connection', (socket) => {
  console.log(`New client connected ${socket.id}`);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('message', (message) => {
    console.log(`Message received: ${message}`);
    // io.emit('message', message);
  });
});


server.listen(PORT,()=> {
  console.log(`Listening on ${PORT}`)
})


