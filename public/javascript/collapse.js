$(document).ready(function () {
 $('div.SocialMedias').click(function(){
   if ($(this).parent().siblings('div.comment').is(':hidden')) 
     $(this).parent().siblings('div.comment').show();
   else
     $(this).parent().siblings('div.comment').hide();
});
});

