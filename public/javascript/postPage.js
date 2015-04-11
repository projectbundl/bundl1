$(document).ready(function() {

  $("input[value='2']").click(function() {
    setInterval(function() {
      if ($('textarea[name="postMessage"]').val().length > 10) {
        $('#errors').show();
        $('#errors').text("The input is over the character limit to submit to Twitter.");
      } else {
        $('#errors').hide();
      }
    }, 1000);
  });
});
