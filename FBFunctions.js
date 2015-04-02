var graph = require('fbgraph');

exports.FBpostToFeedMessageAccessToken = function (mess, accessToken, callback) {
  graph.setAccessToken(accessToken);
  var temp = {'message':mess};
  console.log('this is a warning message!');
  graph.post("/feed", temp , function(err, res) {
    if (res) {
      callback(err, res);
    } else {
      console.log('2',err);
    }
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
