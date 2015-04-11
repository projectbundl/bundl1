var Post = require('./CLSPost.js');
var async = require('async');
var gpFunctions = require('./GPFunctions.js');

module.exports = function(input, clientID, clientSecret, accessToken) {
  var asyncCommentCalls = [];
  var messageArray = new Array();
  for (var index in input) {
    if (input[index].object.replies.totalItems) {
 console.log('outside:', index, 'id', input[index].id);
      asyncCommentCalls.push(function(gpCommentCallback) {
console.log('index:',index, 'replies', input[index].id);

        gpFunctions.GPpullComments(input[index].id, clientID, clientSecret, accessToken, function(err, res) { var j = index; commentCallback(err, res, j);});

        function commentCallback(err, res, ind) {
          //if (err) console.log(err);
          console.log('ind', ind);
          //console.log(res);
          messageArray[ind] = {};//create post
          gpCommentCallback();
        }
      });
      // api call with callback
    //   function callback
          // build temp
    } else {
     var temp = {'from':{'name':input[index].actor.displayName}, 'message':input[index].object.content, 'id':input[index].actor.id, 'like_count':input[index].object.plusoners.totalItems,'createdTimeString':input[index].published, 'updatedTimeString':input[index].updated, 'comments':input[index].object.replies.totalItems, 'socialMedia':3, 'theCommentArray':input[index]}
      messageArray[index] = new Post(temp);
    }
  }


  async.parallel(asyncCommentCalls, function() {
    return messageArray;
  });
};
