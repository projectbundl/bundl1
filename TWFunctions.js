var Twitter = require('twitter');
var TwitterClient = require('twitter-js-client').Twitter;
var TwitterPhoto = require('node-twitter');
var fs = require('fs');
var creds = require('./creds');
var Tiny =require('nj-tinyurl');
var request = require('request');
var https = require('https');
var FormData = require('form-data');
var TWITTER_CONSUMER_KEY = creds.tw.id;
var TWITTER_CONSUMER_SECRET = creds.tw.secret;


exports.TWpullAllTweets = function(accessKey, accessSecret, callback) {
  var client = new Twitter({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    access_token_key: accessKey,
    access_token_secret: accessSecret
  });

  client.get('statuses/user_timeline.json', function(error, tweets, res) {
  //client.get('statuses/home_timeline', {count:1}, function(error, tweets, res) {
    if (error) throw error;

    callback(error, JSON.parse(res.body));
  });
};

exports.TWtweet = function (message, accessKey, accessSecret, callback) {
  var client = new Twitter({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    access_token_key: accessKey,
    access_token_secret: accessSecret
  });
  
  if(message.length>140){
    message= message.substring(0,137);
    message+="...";
  }
    
  client.post('statuses/update.json', {'status':message}, function(error, res) {
    callback(error, res);
  });

};

exports.twitter_image = function(message,  file_path, accessKey, accessSecret, callback) {
  var client = new Twitter({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    access_token_key: accessKey,
    access_token_secret: accessSecret
  });

  //var b = new Buffer(fs.readFileSync(file_path.fileName.path));
  //var s = b.toString('base64');
  fs.readFile(file_path.fileName.path, {encoding: 'base64'}, function(err, imageB64) {
    var form = new FormData();
    form.append('media[]', imageB64);
    console.log(imageB64);
    form.append('status', message);

    form.getLength(function(err, flength) {
      if (err) {
        return requestCallback(err);
      }
      var req = request.post({url:"https://upload.twitter.com/1.1/media/upload.json", oauth: client, host: "upload.twitter.com", protocol: "https:"}, function (err, res) {
        console.log(res);
        //console.log(err);

        requestCallback(err, res);
      });
      req._form = form;
      req.setHeader('content-length', flength);

    });

  });

  function requestCallback(err, res, body) {
    if (err) {
      console.log(err);
    } else {
      callback();
    }
  }
};
/*
  var form = new FormData();
  form.append('status', message);
  form.append('media', base64_encode(file_path.fileName.path));

  var req = request.post({url:"https://upload.twitter.com/1.1/media/upload.json", oauth: client, host: "upload.twitter.com", protocol: "https:"}, twcallback);

  function twcallback(err, res) {
    console.log(res);
    console.log(err);

    callback(err, res);
  }*/

exports.TWComment = function(message, tweetID, accessKey, accessSecret, callback) {
  var client = new Twitter({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    access_token_key: accessKey,
    access_token_secret: accessSecret
  });

  params = {'status':message, 'in_reply_to_status_id': tweetID};
  client.post('statuses/update.json', params, function(error, res) {
    callback(error, res);
  });
}

exports.TWtrunk = function(message, url, hollerback){
  Tiny.shorten(url, function(err, TheURL){
    var truncateLength = 140 - TheURL.length + 4 ;

    message = message.substring(0,truncateLength);
    message += "... ";
    message += TheURL;
    hollerback(message);
  });
}

exports.TWGetMentions = function(accessKey, accessSecret, callback) {
  var client = new Twitter({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    access_token_key: accessKey,
    access_token_secret: accessSecret
  });

  params = {count: 20};
  client.get('statuses/mentions_timeline.json', params, function(error, res) {
    callback(error, res);
  });
}

function base64_encode(file) {
      // read binary data
  var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString('base64');
}
