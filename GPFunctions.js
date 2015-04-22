var google = require('googleapis');

exports.GPpullAllPosts = function(clientID, clientSecret, accessToken, callback) {

  var plus = google.plus('v1');
  var oauth2Client = new google.auth.OAuth2(clientID, clientSecret);

  oauth2Client.setCredentials({'access_token': accessToken});

  plus.activities.list({'userId': 'me', 'maxResults': 50, 'collection': 'public', 'auth':oauth2Client}, function(err, res) {

    callback(err, res.items);
  });
};

exports.GPpullComments = function(activityID, clientID, clientSecret, accessToken, callback) {
  var plus = google.plus('v1');
  var oauth2Client = new google.auth.OAuth2(clientID, clientSecret);

  oauth2Client.setCredentials({'access_token': accessToken});

  plus.comments.list({'activityId': activityID, 'auth':oauth2Client}, function(err, res) {
    var temp = callback(err, res);
    return temp;
  });
};


/*
       var plus = google.plus('v1');
     var oauth2Client = new google.auth.OAuth2(passport._strategies.google._oauth2._clientId, pas    sport._strategies.google._oauth2._clientSecret);
 
        oauth2Client.setCredentials({access_token: passport._strategies.google._oauth2.accessToken})    ;
        
      plus.activities.list({userId: 'me', collection: 'public', auth: oauth2Client}, function(err,     user) {
         console.log("user:"+JSON.stringify(user)); 
         gpasynccallback();
        });
    /* 
       plus.activities.list({userId: passport._strategies.google._oauth2._clientId, collection: 'us    er', auth:oauth2Client}, function(err, res) {
      //console.log(err);
        //console.log("I'm here" + res);
        gpasynccallback();
      });*/
