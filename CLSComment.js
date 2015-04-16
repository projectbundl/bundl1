var moment = require('moment');

// Constructor
function Comment(obj) {
  this.author = obj.from.name;
  this.message = obj.message;
  this.postID = obj.id;
  this.timeString =moment(obj.created_time).format("ddd MMM D, YYYY h:m A");
  this.timeValue = Date.parse(obj.created_time);
  this.socialMedia = [obj.socialMedia];
  this.like_count = obj.like_count;
}

module.exports = Comment;
