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
// const socketIO = require('socket.io');
const { disconnect } = require('process');
const PORT = 4000

const server = http.createServer(app);
// const io = socketIO(server)

// const TOKEN = 'AAAAAAAAAAAAAAAAAAAAAOmfggEAAAAAVUwVxCz0gTPEfEwpN7%2BwKZ5zst8%3DZLkIGJFA89LW0okCZZhEwhMCXm1ZpSyjufJlyaadkUFVblH7ii';
const TOKEN = 'AAAAAAAAAAAAAAAAAAAAAPqPiwEAAAAAgE5PZHyvxwRbRn0sQ4T4vBY2%2FG8%3DFlYzmplCpHrpGOYGzTYUfvLzEA5k3uaJG9fNgaGoUDux67qNwC'
const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
// const streamURL = 'https://api.twitter.com/2/tweets/search/stream';
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=created_at,entities,lang&expansions=author_id';


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


// // ========================================================  
// //socket zone
// let rules = [{ value: 'dog' }]
// let stream

// // Get stream rules
// async function getRules() {
//   const response = await needle('get', rulesURL, {
//     headers: {
//       Authorization: `Bearer ${TOKEN}`,
//     },
//   })
//   console.log("here?",response.body)
//   return response.body
// }

// // Set stream rules
// async function setRules() {
//   const data = {
//     add: rules,
//   }

//   const response = await needle('post', rulesURL, data, {
//     headers: {
//       'content-type': 'application/json',
//       Authorization: `Bearer ${TOKEN}`,
//     },
//   })
//   console.log("set",response.body)
//   return response.body
// }

// // Delete stream rules
// async function deleteRules(rules) {
//   if (!Array.isArray(rules.data)) {
//     return null
//   }

//   const ids = rules.data.map((rule) => rule.id)

//   const data = {
//     delete: {
//       ids: ids,
//     },
//   }
//   const response = await needle('post', rulesURL, data, {
//     headers: {
//       'content-type': 'application/json',
//       Authorization: `Bearer ${TOKEN}`,
//     },
//   })

//   return response.body
// }

// let count =0
// let re_count=0
// let hashtag=[]

// function streamTweets(socket) {
//   stream = needle.get(streamURL, {

//     headers: {
//       Authorization: `Bearer ${TOKEN}`,
//     },
//   })
//   console.log("starting...")

//   stream.on('data', (data) => {
//     try {
//       const json = JSON.parse(data)
//       socket.emit('tweet', json)
//       socket.emit('no', count)
//       // console.log(count,">",json)

//       const regexRetweet = /^RT\s+@/;
//       let matches = json.data.text.match(regexRetweet);
//       if (matches) {re_count++;}
//       socket.emit('re', re_count)

//       if(json.data.entities?.hashtags){
//         for (let i = 0; i < json.data.entities.hashtags.length; i++) {
//           let tag = json.data.entities.hashtags[i].tag;
//           hashtag.push(`#${tag}`);
//         }
//       }

//       let hashtagCount = hashtag.reduce((acc, hashtag) => {
//         let existingHashtag = acc.find(obj => obj.text === hashtag);
//         if (existingHashtag) {
//             existingHashtag.value++;
//         } else {
//             acc.push({text: hashtag, value: 1});
//         }
//         return acc;
//       }, []);
//       hashtagCount.sort((a, b) => b.value - a.value);
//       socket.emit('hashtag', hashtagCount[0])

//       count++;
//     } catch (error) {
//       if (data.detail === "This stream is currently at the maximum allowed connection limit.") {
//         console.log(data.detail)
//         // process.exit(1)
//       } else {
//         // Keep alive signal received. Do nothing.
//     }
//     }
//   })
//   return stream
// }


// async function start(io) {
//   console.log("=>>>>>>>>>>>>>")
//   let currentRules
//   try {
//     currentRules = await getRules()
//     await deleteRules(currentRules)
//     await setRules()
//   } catch (error) {
//     console.error(error)
//     process.exit(1)
//   }
//   const filteredStream = streamTweets(io)
//   let timeout = 0
//   filteredStream.on('timeout', () => {
//     // Reconnect on error
//     console.warn('A connection error occurred. Reconnecting…')
//     setTimeout(() => {
//       timeout++
//       start(io)
//     }, 2 ** timeout)
//     start(io)
//   })
// }

// io.on('connection', async (socket) => {
//   console.log('Client connected...')

//   socket.on('message', (data) => {
//     if(data){
//       console.log("start:")
//       rules = [{value:data}]
//       // rules = [{value:`${data} -is:retweet`}]
//       start(io)
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('disconnected')
//     if (stream) {
//       stream.destroy()
//     }
//   });
// })

server.listen(PORT,()=> {
  console.log(`Listening on ${PORT}`)
})


