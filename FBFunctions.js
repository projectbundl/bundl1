var graph = require('fbgraph');
var FormData = require('form-data');
var fs = require('fs');
var https = require('https');
var request = require('request');

exports.FBpostToFeedMessageAccessToken = function (mess, link, accessToken, callback) {
  graph.setAccessToken(accessToken);
  var temp;
  if (link) {
    temp = {'message':mess, 'picture':link};
  } else {
    temp = {'message':mess};
  }
  graph.post("/feed", temp , function(err, res) {
      callback(err, res);
  });
};


exports.FBaddPicURL = function(mess, picURL, accessToken, callback){
  /*
  var fburl = 'https://graph.facebook.com/me/photos?access_token=' + accessToken;
  var req = request.post(fburl, function(err, res, body) {
    console.log(__dirname, 'bloggr.png');
    if (err) {
      return console.log("error uploading file", err);
    } else {
      console.log("upload successful", body);
    }
    callback();
  });

  var form = req.form();
  form.append('message', mess);
  form.append('source', fs.createReadStream(__dirname + '/public/images/bloggr.png'));
*/

 
  var temp1 = '@' + __dirname + '/public/images/bloggr.png';
  var temp = {'message':mess, link:"https://babbage.hbg.psu.edu:6395/images/bloggr.png"};
  //var temp = {'message':mess, 'source':{'baseDir':__dirname + '/public/images/', 'filename':'bloggr.png', 'type':'image'} , 'no_story':true};
  graph.setAccessToken(accessToken);
  graph.post("/me/photos", temp,  function(err, res){
    console.log(err);
    console.log(res);
    callback(err, res);
  });
};


exports.FBpullAllPosts = function(accessToken, userID, callback) {
  graph.setAccessToken(accessToken);
  var post = "/" + userID + "/posts";
  graph.get(post, function(err, res) {
    callback(err, res);
  });
};


exports.FBcommentToPost = function (message, postID, token, callback) {
  graph.setAccessToken(token);
  graph.post("/" + postID + "/comments", {'message':message}, function(err, res) {
    callback(err, res);
  });
};

exports.FBGetCommentURL = function(commentID, token, callback) {
  graph.setAccessToken(token);
  graph.get('/' + commentID, function(err, res) {
    console.log('err:', err);
    console.log('res', res);
  });
};
