var Post = require('./CLSPost.js') 
  , gpFunctions = require('./GPFunctions.js');

module.exports = function(input, clientID, clientSecret, accessToken, retCallback) {
  var messageArray = new Array();
  var ctr = 0;

  for (var index in input) {
    if (input[index].object.replies.totalItems) {
      gpFunctions.GPpullComments(input[index].id, clientID, clientSecret, accessToken, (function() { 
        var dex = index;
        return function(err, res){
          ctr++;
          if (err) {
            messageArray[dex] = {};
            console.error(err);
          } else {
            var temp = name(input, dex, res.items);
            messageArray[dex] = new Post(temp);
          }
          if (ctr == input.length) {
            retCallback(messageArray);
          }                         
        };
      })());

    } else {
      ctr++;
      var temp = name(input, index, {});
      messageArray[index] = new Post(temp);
    }
  }
};

function name (input, index, commentList){
  var commentArray;
  if (input[index].object.replies.totalItems) {
      commentArray = {'data': commentParse(commentList)}
  } else {
    commentArray = undefined;
  }

  return {'from':{'name':input[index].actor.displayName}, 
  'message':input[index].object.content, 
  'id':input[index].actor.id, 
  'like_count':input[index].object.plusoners.totalItems,
  'created_time':input[index].published, 
  'updated_time':input[index].updated, 
  'comments':input[index].object.replies.totalItems, 
  'socialMedia':3, 
  'comments':commentArray };
}

function commentParse (commentArray) {
  var newComments = new Array();

  for(var index in commentArray) {
    var comment = {};
    comment.from = {'name':commentArray[index].actor.displayName};
    comment.message = commentArray[index].object.content;
    comment.id = commentArray[index].id;
    comment.like_count = commentArray[index].plusoners.totalItems;
    comment.created_time = commentArray[index].updated;
    comment.socialMedia = 3;
    newComments.push(comment);
  }

  return newComments;
}
