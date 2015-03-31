var Twitter = require('twitter');
var fs = require('fs');
var creds = require('./creds');

var TWITTER_CONSUMER_KEY = creds.tw.id;
var TWITTER_CONSUMER_SECRET = creds.tw.secret;


exports.TWpullAllTweets = function(accessKey, accessSecret, callback) {
  var client = new Twitter({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    access_token_key: accessKey,
    access_token_secret: accessSecret
  });

  client.get('statuses/user_timeline.json', {screen_name:'bundl_man'}, function(error, tweets, res) {
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

  client.post('statuses/update.json', {'status':message}, function(error, res) {
    callback(error, res);
  });

};
