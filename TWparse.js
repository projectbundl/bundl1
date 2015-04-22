var Post = require('./CLSPost.js');
var Mention = require('./CLSMentions.js');

exports.parse = function(input) {
  var messageArray = new Array();
  for (var index in input) {
    var temp = {'from':{'name':input[index].user.name}, 'message':input[index].text, 'id':input[index].id, updated_time:input[index].created_at, socialMedia: 2, 'like_count':input[index].favorite_count};
    messageArray.push(new Post(temp));
  }
  return messageArray;
};

exports.mentionParse = function(input) {
  var messageArray = new Array();
  for (var index in input) {
    messageArray.push(new Mention(input[index]));
  }
  return messageArray;
};
