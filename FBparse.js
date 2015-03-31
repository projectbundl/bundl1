var Post = require('./CLSPost.js');
//module that parses facebook data for messages
module.exports = function (input){
  var messageArray= new Array();
  var aryMess = input.data;

  for (var i in aryMess) {
    aryMess[i].socialMedia = 1;
    messageArray.push(new Post(aryMess[i]));
  }
  return messageArray;
};


