var moment =require('moment');

function Moment(obj) {
  this.author = obj.user.name;
  this.message = obj.text;
  //this.commentCount = commentCountFunction(obj);
  this.postID = obj.id;
  this.updatedTimeValue = Date.parse(obj.created_at);
  this.createdTimeString = obj.created_at;
  this.updatedTimeString = moment(obj.created_at).format("ddd MMM D, YYYY h:m A");
  this.socialMedia = [2];
  this.like_count=obj.favorite_count;
}

module.exports = Moment;
