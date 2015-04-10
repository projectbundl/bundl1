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
            var temp = name(input, dex);
            messageArray[dex] = new Post(temp);
          }
          console.log(ctr == input.length);
          if (ctr == input.length) {
            retCallback(messageArray);
          }                         
        };
      })());

    } else {
      //console.log('else:', ctr);
      ctr++;
      messageArray[index] = new Post(temp);
      var temp = name(input, index);
    }
  }
};

function name (input, index){
 return 'from':{'name':input[index].actor.displayName}, 'message':input[index].object.content, 'id':input[index].actor.id, 'like_count':input[index].object.plusoners.totalItems,'createdTimeString':input[index].published, 'updatedTimeString':input[index].updated, 'comments':input[index].object.replies.totalItems, 'socialMedia':3, 'theCommentArray':commentParse(input[index]);
}

function commentParse (commentArray){
  var newComments = new Array();

  for(var comment in commentArray){
    newComments[comment].author = commentArray[comment].displayName;
    newComments[comment].message = commentArray[comment].object.content;
    newComments[comment].postID = commentArray[comment].inReplyTo[0].id;
    newComments[comment].likes = commentArray[comment].plusoners;
    newComments[comment].timeString = commentArray[comment].updated;
    newComments[comment].timeValue = Date.parse(commentArray[comment].updated);
    newComments[comment].socialMedia = 3;
  }

  return newComments;

}
