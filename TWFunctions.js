var Twitter = require('twitter');
var fs = require('fs');
var creds = require('./creds');
var Tiny =require('nj-tinyurl');
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

exports.TWComment = function(message, tweetID, accessKey, accessSecret, callback) {
  var client = new Twitter({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    access_token_key: accessKey,
    access_token_secret:accessSecret
  });

  params = {'status':message, 'in_reply_to_status_id': tweetID};
  client.post('statuses/update.json', params, function(error, res) {
    callback(error, res);
  });
}

exports.TWtrunk = function(message, url){
  var shortURL= Tiny.shorten(url, function(err, TheURL){console.log(TheURL)});
  var truncateLength =140-(shortURL.length+4);
  message = message.substring(0,truncateLength);
  mesage+="... ";
  message+=shortURL;
return message;
}
