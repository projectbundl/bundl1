var Post = require('./CLSPost.js');

module.exports = function(input) {
  var messageArray = new Array();
  for (var index in input) {
    var temp = {'from':{'name':input[index].user.name}, 'message':input[index].text, 'id':input[index].id, updated_time:input[index].created_at, socialMedia: 2, 'like_count':input[index].favorite_count};
    messageArray.push(new Post(temp));
  }
  return messageArray;
};
