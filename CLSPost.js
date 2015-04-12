var Comment = require('./CLSComment.js');

// Constructor
function Post(obj) {
  this.author = obj.from.name;
  this.message = obj.message;
  this.commentCount = commentCountFunction(obj);
  this.postID = obj.id;
  this.updatedTimeValue = Date.parse(obj.updated_time);
  this.createdTimeString = obj.created_time||obj.updated_time;
  this.updatedTimeString = obj.updated_time;
  this.socialMedia = obj.socialMedia;
  this.comments = createCommentList(obj, obj.socialMedia);
  this.like_count=obj.like_count ;
}

function commentCountFunction(list) {
  if (typeof list.comments !== "undefined") {
    return list.comments.data.length;
  } else {
    return 0;
  }
}

function createCommentList(commentList, socialMedia){
  if (typeof commentList.comments ==="undefined") {return [];}
  else {
    var commentArray = [];

    for (var i in commentList.comments.data){
      commentList.comments.data[i].socialMedia = socialMedia;
      commentArray.push(new Comment(commentList.comments.data[i]));
    } 
    return commentArray;
  }
}

module.exports = Post;
