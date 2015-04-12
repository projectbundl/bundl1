// Constructor
function Comment(obj) {
  this.author = obj.from.name;
  this.message = obj.message;
  this.postID = obj.id;
  this.timeString = obj.created_time;
  this.timeValue = Date.parse(obj.created_time);
  this.socialMedia = obj.socialMedia;
  this.like_count = obj.like_count;
}

module.exports = Comment;
