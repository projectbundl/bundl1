var Post = require('./CLSPost.js');
//module that parses facebook data for messages
module.exports = function (input){
  var messageArray= new Array();
  var aryMess = input.data;

  for (var i in aryMess) {
    aryMess[i].socialMedia = 1;
    if (aryMess[i].hasOwnProperty('likes')) {
      aryMess[i].like_count = aryMess[i].likes.data.length; 
    } else {
      aryMess[i].like_count = 0;
    }
    messageArray.push(new Post(aryMess[i])); 
  }
  return messageArray;
};
