var Post = require('./CLSPost.js');
var gpFunctions = require('./GPFunctions.js');

module.exports = function(input, clientID, clientSecret, accessToken, retCallback) {
  var messageArray = new Array();
  var ctr = 0;

  for (var index in input) {
    if (input[index].object.replies.totalItems) {
      gpFunctions.GPpullComments(input[index].id, clientID, clientSecret, accessToken, (function() { 
        var dex = index;
        return function(err, res){
          console.log(JSON.stringify(res));
          ctr++;
          if (err) {
            messageArray[dex] = {};
            console.log(err);
          }
          else {
            var temp = {'from':{'name':input[dex].actor.displayName}, 'message':input[dex].object.content, 'id':input[dex].actor.id, 'like_count':input[dex].object.plusoners.totalItems,'createdTimeString':input[dex].published, 'updatedTimeString':input[dex].updated, 'comments':input[dex].object.replies.totalItems, 'socialMedia':3, 'theCommentArray':input[dex]};
            messageArray[dex] = new Post(temp);
          }
          console.log(ctr == input.length);
          if (ctr == input.length) {
            retCallback(messageArray);
          }                         
        };
      })());

    } else {
console.log('else:', ctr);
      ctr++;
      var temp = {'from':{'name':input[index].actor.displayName}, 'message':input[index].object.content, 'id':input[index].actor.id, 'like_count':input[index].object.plusoners.totalItems,'createdTimeString':input[index].published, 'updatedTimeString':input[index].updated, 'comments':input[index].object.replies.totalItems, 'socialMedia':3, 'theCommentArray':input[index]}
      messageArray[index] = new Post(temp);
    }
  }
};


