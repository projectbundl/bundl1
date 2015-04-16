$(document).ready(function() {
var timer;
  $("input[value='2']").click(function() {
    if($("input[value='2']"))
      {
    timer=setInterval(function() {
      if ($('textarea[name="postMessage"]').val().length > 140) {
        $('#errors').show();
        $('#errors').text("The input is over the character limit to submit to Twitter.");
      } else{
        $('#errors').hide();
      }
    }, 500); 
   }
 else{
  $('#errors').hide();
  clearInterval(timer);
 } 

  });
});
