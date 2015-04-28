var moment =require('moment');

function Mention(obj) {
  this.author = obj.user.name;
  this.message = obj.text;
  this.postID = obj.id;
  this.updatedTimeValue = Date.parse(obj.created_at);
  this.createdTimeString = obj.created_at;
  this.updatedTimeString = moment(obj.created_at).format("ddd MMM D, YYYY h:mm A");
  this.socialMedia = [2];
  this.like_count=obj.favorite_count;
}

module.exports = Mention;
