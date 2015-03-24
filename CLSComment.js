// Constructor
function Comment(obj) {
  this.author = obj.from.name;
  this.message = obj.message;
  this.postID = obj.id;
  this.likes = obj.like_count;
  this.time = obj.created_time;
  this.mediaType = 1;

}

module.exports = Comment;
