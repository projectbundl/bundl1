// Constructor
function Post(obj) {
  this.author = obj.from.name;
  this.message = obj.message;
  this.commentCount = commentCount(obj.actions);
  this.postID = obj.id;
  this.time = obj.updated_time;


}

function commentCount(list) {
  var ctr = 0;
  for (var i in list) {
    if (list[i].name == 'Comment') ctr++;
  }
  return ctr;
}

module.exports = Post;
