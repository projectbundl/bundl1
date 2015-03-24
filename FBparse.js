var Post = require('./CLSPost.js');
//module that parses facebook data for messages
module.exports = function (input){
  var messageArray= new Array();
  //messageArray[0]='hello'; 
  //console.log(input);
  var aryMess = input.data;
  //console.log(aryMess);
  //console.log('working module data:');
  //console.log(input.length);  
  console.log(input.data[1]);
  for (var i in aryMess) {
    messageArray.push(new Post(aryMess[i]));
    //messageArray.push(input.data[i].message);
  }
  return messageArray;
};
