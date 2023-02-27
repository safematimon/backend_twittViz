const router = require('express').Router();
const twitter= require('twitter')
const twitterV2 = require('twitter-v2');
const {languagesCode} = require('../mapping/languagesCode')

// const mongoose = require('mongoose');
const Trend = require('../models/Trend');
var cron = require('node-cron');
// const { UNSAFE_convertRoutesToDataRoutes } = require('@remix-run/router');
// const { trusted } = require('mongoose');


// twitter v1 for trend
const client = new twitter({
  consumer_key:process.env.TWITTER_CONSUMER_API_KEY,
  consumer_secret:process.env.TWITTER_CONSUMER_API_SECRET,
  access_token_key:process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret:process.env.TWITTER_ACCESS_SECRET,
})
// twitter v2 for tweet lookup and recent
const clientV2 = new twitterV2({
  consumer_key:process.env.TWITTER_CONSUMER_API_KEY,
  consumer_secret:process.env.TWITTER_CONSUMER_API_SECRET,
  access_token_key:process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret:process.env.TWITTER_ACCESS_SECRET,
})
// twitter v3 for count
const clientV3 = new twitterV2({
  bearer_token: process.env.BEARER_TOKEN,
});

router.get('/trends', async (req, res, next) => {
  try{
    const id = req.query.woeid
    const data = await client.get('trends/place.json', {
      id,
    })
    res.send(data);
  }catch(error){
    next(error)
  }
});

// tweet ----------------------------------------------------------------------------------------------
router.get('/tweets', async (req, res, next) => {
  try{
    const query = req.query.query
    const type = req.query.type
    const queryTemp = query.replace(/[ ]/g,"+")
    // let params = {
      // 'query': queryTemp,
      // 'tweet.fields': "created_at,lang,public_metrics,source,context_annotations",
      // set result here
      // 'max_results': 100,
      // to find popular
      // 'sort_order': 'relevancy',
      // 'expansions': "geo.place_id",
    // }
    // let data = await clientV2.get(`tweets/search/recent`,params);

    let text = ''
    const public_metrics= {retweet_count: 0, reply_count: 0, like_count: 0, quote_count: 0};
    const source= {Twitter_for_iPhone: 0, Twitter_for_Android: 0, Twitter_Web_App: 0, Twitter_for_iPad: 0, else: 0};
    const tweeType= {size: 0,tweet: 0, retweet: 0, reply: 0,photosCount: 0,videosCount: 0};
    const lang= {}
    const context_domain= {}
    const context_entity= {}
    
    let data
    let relevancy_next
    let size = 0;
    let t1,t2,t3,t4

    let highestRetweetCountId = "";
    let highestLikeCountId = "";
    let highestReplyCountId = "";
    let highestImpressionCountId = "";
    let highestRetweetCount = 0;
    let highestLikeCount = 0;
    let highestReplyCount = 0;
    let highestImpressionCount =0;

    let latestTimestamp;
    let oldestTimestamp;

    let photosCount = 0;
    let videosCount = 0;
    let pureTextCount = 0;
    let hashtagCount = 0;
    let replyCount = 0;
    let retweetCount = 0;
    // let 

    let possibly_sensitive_count = 0;

    // default i=1
    if(type == 1){
      console.log("type : ",type)
        let params3 = {
          'query': queryTemp,
          'tweet.fields': "created_at,lang,public_metrics,source,context_annotations,possibly_sensitive,entities,in_reply_to_user_id",
          'max_results': 100,
          'sort_order': 'relevancy',
          'expansions': 'attachments.media_keys',
        }
        data = await clientV2.get(`tweets/search/recent`,params3);
        size = size + data.data.length

        for (let tweet of data.data){
          if(!tweet.attachments){
            pureTextCount++;
          }

          if(tweet.in_reply_to_user_id){
            tweeType.reply++;
          }
          
          const regexRT = /RT @/g;
          if(tweet.text.match(regexRT)){
            tweeType.retweet++;
          }

          // if(tweet.entities){
          //   hashtagCount++;
          // }

          text = text.concat(' ',tweet.text)
          public_metrics.retweet_count += tweet.public_metrics.retweet_count
          public_metrics.reply_count += tweet.public_metrics.reply_count
          public_metrics.like_count += tweet.public_metrics.like_count
          public_metrics.quote_count += tweet.public_metrics.quote_count
          // source not available no twitter api
          // if(tweet.source == "Twitter for Android"){
          //   source.Twitter_for_Android += 1
          // }
          // else if(tweet.source == "Twitter for iPhone"){
          //   source.Twitter_for_iPhone += 1
          // }
          // else if(tweet.source == "Twitter for iPad"){
          //   source.Twitter_for_iPad += 1
          // }
          // else if(tweet.source == "Twitter Web App"){
          //   source.Twitter_Web_App += 1
          // }
          // else{ source.else += 1}
          if(tweet.lang in lang){
            lang[tweet.lang] += 1
          }
          else{
            lang[tweet.lang] = 1
          }
          if(tweet.context_annotations != undefined){
            for(let y of tweet.context_annotations){
              if(y.domain.name in context_domain){
                context_domain[y.domain.name] += 1
              }
              else{
                context_domain[y.domain.name] = 1
              }
              if(y.entity.name in context_entity){
                context_entity[y.entity.name] += 1
              }
              else{
                context_entity[y.entity.name] = 1
              }
            }
          }
          if (tweet.public_metrics.retweet_count >= highestRetweetCount) {
            highestRetweetCount = tweet.public_metrics.retweet_count;
            highestRetweetCountId = tweet.id;
            t1=tweet.public_metrics;
          }
          if (tweet.public_metrics.like_count >= highestLikeCount) {
            highestLikeCount = tweet.public_metrics.like_count;
            highestLikeCountId = tweet.id;
            t2=tweet.public_metrics;
          }
          if (tweet.public_metrics.reply_count >= highestReplyCount) {
            highestReplyCount = tweet.public_metrics.reply_count;
            highestReplyCountId = tweet.id;
            t3=tweet.public_metrics;
          }
          if (tweet.public_metrics.impression_count >= highestImpressionCount) {
            highestImpressionCount = tweet.public_metrics.impression_count;
            highestImpressionCountId = tweet.id;
            t4=tweet.public_metrics;
          }
          // check time created_at
          let timestamp = new Date(tweet.created_at);
          if (timestamp > latestTimestamp) {
            latestTimestamp = timestamp;
          }
          if (timestamp < oldestTimestamp) {
            oldestTimestamp = timestamp;
          }
          
          if(tweet.possibly_sensitive == true){
            possibly_sensitive_count += 1;
          }
        }
        // for media
        for (let tweet of data.includes.media){
          if (tweet.type === "photo") {
            tweeType.photosCount++;
          } else if (tweet.type === "video") {
            tweeType.videosCount++;
          }
        }

    }
    else{
      console.log("type : ",type)
      for (let i = 1; i<=10; i++) {
        if(i==1){
          console.log('i = 1')
          let params = {
            'query': queryTemp,
            'tweet.fields': "created_at,lang,public_metrics,source,context_annotations,possibly_sensitive,entities,in_reply_to_user_id",
            'max_results': 100,
            'sort_order': 'relevancy',
            'expansions': 'attachments.media_keys',
          }
          data = await clientV2.get(`tweets/search/recent`,params); 
          size = size + data.data.length

          oldestTimestamp = new Date(data.data[0].created_at);
          latestTimestamp = new Date(data.data[0].created_at);

          highestRetweetCount = data.data[0].public_metrics.retweet_count;
          highestLikeCount = data.data[0].public_metrics.like_count;
          highestReplyCount = data.data[0].public_metrics.reply_count;
          highestImpressionCount = data.data[0].public_metrics.impression_count;
        }
        else if(relevancy_next){
          console.log('i =',i)
          let params = {
            'query': queryTemp,
            'tweet.fields': "created_at,lang,public_metrics,source,context_annotations,possibly_sensitive,entities,in_reply_to_user_id",
            'max_results': 100,
            'sort_order': 'relevancy',
            'expansions': 'attachments.media_keys',
            'next_token': relevancy_next
          }
          data = await clientV2.get(`tweets/search/recent`,params);
          size = size + data.data.length
          // console.log(data.data.length)
          // console.log(">>",data.includes.places)
        }
        else{
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> break; ",i)
          break;
        }
        
        relevancy_next = data.meta.next_token

        for (let tweet of data.data){

          if(!tweet.attachments){
            pureTextCount++;
          }

          if(tweet.in_reply_to_user_id){
            tweeType.reply++;
          }
          
          const regexRT = /RT @/g;
          if(tweet.text.match(regexRT)){
            tweeType.retweet++;
          }

          // if(tweet.entities){
          //   hashtagCount++;
          // }

          text = text.concat(' ',tweet.text)
          public_metrics.retweet_count += tweet.public_metrics.retweet_count
          public_metrics.reply_count += tweet.public_metrics.reply_count
          public_metrics.like_count += tweet.public_metrics.like_count
          public_metrics.quote_count += tweet.public_metrics.quote_count
          // source not available no twitter api
          // if(tweet.source == "Twitter for Android"){
          //   source.Twitter_for_Android += 1
          // }
          // else if(tweet.source == "Twitter for iPhone"){
          //   source.Twitter_for_iPhone += 1
          // }
          // else if(tweet.source == "Twitter for iPad"){
          //   source.Twitter_for_iPad += 1
          // }
          // else if(tweet.source == "Twitter Web App"){
          //   source.Twitter_Web_App += 1
          // }
          // else{ source.else += 1}
          if(tweet.lang in lang){
            lang[tweet.lang] += 1
          }
          else{
            lang[tweet.lang] = 1
          }
          if(tweet.context_annotations != undefined){
            for(let y of tweet.context_annotations){
              if(y.domain.name in context_domain){
                context_domain[y.domain.name] += 1
              }
              else{
                context_domain[y.domain.name] = 1
              }
              if(y.entity.name in context_entity){
                context_entity[y.entity.name] += 1
              }
              else{
                context_entity[y.entity.name] = 1
              }
            }
          }
          if (tweet.public_metrics.retweet_count >= highestRetweetCount) {
            highestRetweetCount = tweet.public_metrics.retweet_count;
            highestRetweetCountId = tweet.id;
            t1=tweet.public_metrics;
          }
          if (tweet.public_metrics.like_count >= highestLikeCount) {
            highestLikeCount = tweet.public_metrics.like_count;
            highestLikeCountId = tweet.id;
            t2=tweet.public_metrics;
          }
          if (tweet.public_metrics.reply_count >= highestReplyCount) {
            highestReplyCount = tweet.public_metrics.reply_count;
            highestReplyCountId = tweet.id;
            t3=tweet.public_metrics;
          }
          if (tweet.public_metrics.impression_count >= highestImpressionCount) {
            highestImpressionCount = tweet.public_metrics.impression_count;
            highestImpressionCountId = tweet.id;
            t4=tweet.public_metrics;
          }
          // check time created_at
          let timestamp = new Date(tweet.created_at);
          if (timestamp > latestTimestamp) {
            latestTimestamp = timestamp;
          }
          if (timestamp < oldestTimestamp) {
            oldestTimestamp = timestamp;
          }
          
          if(tweet.possibly_sensitive == true){
            possibly_sensitive_count += 1;
          }
        }
      }
      // for media
      for (let tweet of data.includes.media){
        if (tweet.type === "photo") {
          tweeType.photosCount++;
        } else if (tweet.type === "video") {
          tweeType.videosCount++;
        }
      }
    }
    // --------------------------------------------------------------------------------------------------------------------
    // text processing zone
    let texttemp = text.toLowerCase()
    // let textreplace = texttemp.replace(/[.,@#'":/]/g, '');
    let textreplace = texttemp.replace(/[.,@'":/#]/g, '');
    // let textreplace2 = textreplace.replace(/(https?\/\/[^\s]+)/g, '');
    let textreplace2 = textreplace.replace(/\bhttp\S*/g, '');

    function wordFreq(string) {
      return string
        .split(/\s/)
        .reduce((map, word) =>
          Object.assign(map, {
            [word]: (map[word])
              ? map[word] + 1
              : 1,
          }),
          {}
        );
    }
    let wordCount = wordFreq(textreplace2)

    let sortable = [];
    for (var item in wordCount) {sortable.push([item, wordCount[item]]);}
    sortable.sort(function(b, a) {
        return a[1] - b[1];
    });

    const cutoff = [
      '-','_','','|','.','=','–','—','(',')','+',';','•','!',
      // '1','2','3','4','5','6','7','8','9','0',
      'this','that','those','these',
      'be', 'is', 'am', 'are', 'was', 'were', //verb to be
      'a', 'an', 'the', // articles
      'i', 'you','u', 'he', 'she', 'it', 'we', 'they', 'me','my', 'your', 'him','his','her', 'its', 'us','our', 'them', // pronouns
      'on', 'in', 'at', 'to', 'of', 'for', 'with', 'by', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out', 'against', 'during', 'without', 'from', // prepositions
      'and', 'but', 'or', 'so', 'because', 'while', 'if', 'though', 'although', 'even though', 'as if', 'as though', // conjunctions
      'who', 'whom', 'whose', 'that', 'which', // relative pronouns
      'have','has','do','does','just','most','more','will','here','there','their',
      'rt'];
    let filteredArray = sortable.filter(([item]) => !cutoff.includes(item));
    let top = filteredArray.slice(0,100)
    let output = top.map(([text, value]) => ({ text, value }));
    // --------------------------------------------------------------------------------------------------------------------
    // hashtag zone
    let hashtags = text.match(/#\w+/g);
    const hashtagCounts = {};
    hashtags.forEach((hashtag) => {
      if (hashtagCounts.hasOwnProperty(hashtag)) {
        hashtagCounts[hashtag]++;
      } else {
        hashtagCounts[hashtag] = 1;
      }
    });
    const hashtagArray = Object.keys(hashtagCounts).map((hashtag) => {
      return { text: hashtag, value: hashtagCounts[hashtag] };
    });
    hashtagArray.sort((a, b) => b.value - a.value);
    const hashtagtop = hashtagArray.slice(0, 10);
    // --------------------------------------------------------------------------------------------------------------------
    // lang zone
    let langArr = Object.entries(lang).map(([lang, value]) => ({ lang, value }));
    const langArrMapping = langArr.map(item => {
      const langName = languagesCode[item.lang] || 'unknown';
      return { lang: langName, value: item.value };
    });
    // --------------------------------------------------------------------------------------------------------------------
    // context zone
    let context_DomainArr = Object.entries(context_domain).map(([domain, value]) => ({ domain, value }));
    // Unified to undefined
    for (let i = 0; i < context_DomainArr.length; i++) {
      if (context_DomainArr[i].domain === 'Unified Twitter Taxonomy') {
        context_DomainArr[i].domain = 'Undefined';
        break;
      }
    }
    // --------------------------------------------------------------------------------------------------------------------
    // tweet id zone
    let arr = [highestRetweetCountId, highestLikeCountId, highestReplyCountId ,highestImpressionCountId];
    // --------------------------------------------------------------------------------------------------------------------
    // console.log Zone
    tweeType.size=size
    tweeType.tweet=size-tweeType.retweet-tweeType.reply
    if(type==2){
      console.log(`Latest created_at: ${latestTimestamp}`);
      console.log(`Oldest created_at: ${oldestTimestamp}`);

      console.log("pureTextCount:",pureTextCount)
      console.log(arr)
      console.log("1:",t1)
      console.log("2:",t2)
      console.log("3:",t3)
      console.log("4:",t4)
      console.log(">",tweeType)
      // console.log(hashtagArray);
    }
    // --------------------------------------------------------------------------------------------------------------------
    let possibly_sensitive_arr = [size,possibly_sensitive_count]
    // --------------------------------------------------------------------------------------------------------------------
    let dataplus = {}
    dataplus = data
    dataplus['public_metrics'] = public_metrics
    dataplus['source'] = source
    dataplus['lang'] = langArrMapping
    dataplus['word'] = output
    dataplus['hashtag'] = hashtagtop
    dataplus['context'] = context_DomainArr
    dataplus['popular3'] = arr
    dataplus['tweettype'] = tweeType
    dataplus['sensitive'] = possibly_sensitive_arr
    res.send(dataplus);
  }catch(error){
    next(error)
  }
});

// count -----------------------------------------------------------------------------------------------
router.get('/counts', async (req, res, next) => {
  try{
    const query = req.query.query
    const granularity = req.query.granularity
    const params = {
      'query': query,
      'granularity' : granularity,
    }
    const data = await clientV3.get(`tweets/counts/recent`,params);
    res.send(data);
  }catch(error){
    next(error)
  }
});

// test pop 
// router.get('/counts', async (req, res, next) => {
//   try{
//     const query = req.query.query
//     const params = {
//       'query': query,
//       'granularity' : 'day',
//     }
//     const data = await clientV3.get(`tweets/counts/recent`,params);
//     res.send(data);
//   }catch(error){
//     next(error)
//   }
// });

router.get('/', async (req, res, next) => {
  res.send({ message: 'path api OK is working 🚀' });
});

router.get('/test', async (req, res, next) => {
  res.send({ message: 'test api OK is working 🚀' });
});

cron.schedule('0 * * * *', async () => {
  // console.log('running a task every hour');
  // cron.schedule('*/10 * * * *', async () => {
  const id = 1
  const data = await client.get('trends/place.json', {id})

  const date = new Date();
  const hours = date.getHours().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const formattedDate = `${hours}/${day}/${month}/${year}`;

  data[0].trends.forEach((trend, index) => {
    Trend.create({ no: index+1,name:trend.name,tweet_volume: trend.tweet_volume,time: formattedDate},(err) =>{
      if(err) return next(err);
    });
  });
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>tick',new Date(),">",formattedDate)
});


router.get('/past', async (req, res) => {
  try{
    const timeframe = req.query.timeframe
    // defalut
    const formatLastDate = (hours) => {
      const last = new Date(Date.now() - hours * 60 * 60 * 1000);
      const hoursStr = last.getHours().toString().padStart(2, '0');
      const dayStr = last.getDate().toString().padStart(2, '0');
      const monthStr = (last.getMonth() + 1).toString().padStart(2, '0');
      const yearStr = last.getFullYear().toString();
      return `${hoursStr}/${dayStr}/${monthStr}/${yearStr}`;
    };
    let formattedDate = formatLastDate(timeframe)

    // if(timeframe == '12'){
    //   formattedDate = formatLastDate(12)
    // } else if(timeframe == '6'){
    //   formattedDate = formatLastDate(6)
    // } else if(timeframe == '3'){
    //   formattedDate = formatLastDate(3)
    // } else if(timeframe == '2'){
    //   formattedDate = formatLastDate(2)
    // } else if(timeframe == '1'){
    //   formattedDate = formatLastDate(1)
    // }else{
    //   formattedDate = formatLastDate(24)
    // }

    // console.log(formattedDate)
    const data = await Trend.find({ time: formattedDate });
    data.sort((a, b) => parseInt(a.no) - parseInt(b.no));

    const responseData = {
      data: data,
      time: formattedDate
    }
    res.send(responseData);
  }catch(error){
    next(error)
  }
});

router.get('/all', async (req, res) => {
  const data = await Trend.find();
  res.send(data);
});

module.exports = router;
