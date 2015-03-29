var Comment = require('./CLSComment.js');
var moment = require('moment');

// Constructor
function Post(obj) {
  this.author = obj.from.name;
  this.message = obj.message;
  this.commentCount = commentCount(obj);
  this.postID = obj.id;
  this.createdTimeString = moment(obj.created_time||obj.updated_time).format('MMMM Do YYYY, h:mm a');
  this.updatedTimeString = obj.updated_time;
  this.updatedTimeValue = Date.parse(obj.updated_time);
  this.mediaType = 1;
  this.comments = createCommentList(obj);
}

function commentCount(list) {
  if (typeof list.comments!=="undefined") {return list.comments.data.length;}
  else {return 0;}
}
function createCommentList(commentList){
  if(typeof commentList.comments ==="undefined") {return [];}
  else{
    var commentArray = new Array();
    for (var i in commentList.comments.data){
      commentArray.push(new Comment(commentList.comments.data[i]));
    }
    return commentArray;
  }
}

module.exports = Post;
