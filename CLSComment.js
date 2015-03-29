var moment = require('moment');

// Constructor
function Comment(obj) {
  this.author = obj.from.name;
  this.message = obj.message;
  this.postID = obj.id;
  this.likes = obj.like_count;
  this.timeString = moment(obj.created_time).format('MMMM Do YYYY, h:mm a');
  this.timeValue = Date.parse(obj.created_time);
  this.mediaType = 1;

}

module.exports = Comment;
