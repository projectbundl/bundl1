// set variables for environment
var express = require('express')
  , async = require('async')
  , https = require('https')
  , path = require('path')
  , graph = require('fbgraph')
  , creds = require("./creds")
  , engine = require('consolidate')
  , passport = require('passport')
  , util = require('util')
  , fs = require('fs')
  , FacebookStrategy = require('passport-facebook').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , logger = require('morgan')
  , session = require('express-session')
  , bodyParser = require("body-parser")
  , cookieParser = require("cookie-parser")
  , fbParser = require('./FBparse.js')
  , Twitter = require('twitter')
  , twParser = require('./TWparse.js')
  , methodOverride = require('method-override');

var FACEBOOK_APP_ID = creds.fb.id;
var FACEBOOK_APP_SECRET = creds.fb.secret;
var TWITTER_CONSUMER_KEY = creds.tw.id;
var TWITTER_CONSUMER_SECRET = creds.tw.secret;

// Express Configuration
var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));
app.set('view engine', 'jade');
app.use(cookieParser());

var sessionStore = session({secret:"ssh!!", cookie:{maxAge:3600000}, resave: true, saveUninitialized: true});
app.use(sessionStore);

app.use(passport.initialize());
app.use(passport.session());


// Log all server requests

app.use(function(req, res, next) {
  console.log('%s %s', req.method, req.url);
  var err = req.session.error, msg = req.session.notice, success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;

  next();
});
// configure Express
/*
  app.use(methodOverride());
  */
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
  
passport.use('twitter', new TwitterStrategy({
  consumerKey: TWITTER_CONSUMER_KEY,
  consumerSecret: TWITTER_CONSUMER_SECRET,
  callbackURL: "https://babbage.hbg.psu.edu:6395/auth/twitter/callback",
  oauth_authenticate_url: 'https://api.twitter.com/oauth/authenticate'
  },
  function(accessToken, tokenSecret, profile, done) {
    process.nextTick(function() {
      //console.log(accessToken);
      //console.log(JSON.stringify(profile));
      //User.findOrCreate(..., function(err, user) {
      //if (err) { return done(err); }
      
      // lookup user in DB
      passport._strategies.twitter._oauth.accessToken = accessToken;
      passport._strategies.twitter._oauth.tokenSecret = tokenSecret;
      return done(null, profile);
    //});
    });
  }
));

passport.use('facebook', new FacebookStrategy({
  passReqToCallBack: true,
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: "https://babbage.hbg.psu.edu:6395/auth/facebook/callback",
  scope: ['publish_stream','read_stream', 'publish_actions', 'public_profile'] },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
    // To keep the example simple, the user's Facebook profile is returned to
    // represent the logged-in user.  In a typical application, you would want
    // to associate the Facebook account with a user record in your database,
    // and return that user instead.
      
    // Can create our own cookie after user validation/ combine social media info from db
    // http://zipplease.tumblr.com/post/34169331215/node-js-session-management-with-express
    passport._strategies.facebook._oauth2.accessToken = accessToken;
    passport._strategies.facebook._oauth2.profileID = profile.id;
    return done(null, profile);
    });
  }
));
   
app.post('/bin/processComment', function(req, res) {
  // Ensure there is an access token for the SM that is having the social media post sent to
  if (req.body.commentMessage) {
    if (passport._strategies.facebook._oauth2.hasOwnProperty('accessToken')) {
      FBcommentToPost(req.body.commentMessage, req.body.id, passport._strategies.facebook._oauth2.accessToken, fbCommentCallback);

      function fbCommentCallback(response) {
        res.redirect('../main');
      }
    }
  }
});

app.route('/post')
  .get(function(req, res) {
    res.render('post');
  })
  .post(function(req, res) {
    if (req.body.postMessage) {
      // Ensure there is an access token for the SM that is having the social media post sent to
      var postMessage = req.body.postMessage;

      if (passport._strategies.facebook._oauth2.hasOwnProperty('accessToken')) {
        FBpostToFeedMessageAccessToken(postMessage, passport._strategies.facebook._oauth2.accessToken, fbcallback);

        // Need to add if failure redirect
        function fbcallback(facebook){
          res.redirect('main');
        }
      } if (passport._strategies.twitter._oauth.hasOwnProperty('accessToken')) {
        var comment = req.body.postMessage;
        var id = req.body.id;

        TWtweet(comment, passport._strategies.twitter._oauth.accessToken, passport._strategies.twitter._oauth.tokenSecret, twcallback);

        function twcallback(response) {
          res.redirect('main');
        }
      }
    }
  });

app.use('/error', function(req, res) {
  res.render('error');
});

app.use('/main', function(req, res){
  // Have both tokens combine post data
  if (passport._strategies.facebook._oauth2.hasOwnProperty('accessToken') && passport._strategies.twitter._oauth.hasOwnProperty('accessToken')) {
    var facebookResults;
    var twitterResults;
    // Array to hold async tasks
    var asyncTasks = [];
    
    // Push, pull FB post to async tasks
    asyncTasks.push(function(fbasynccallback) {
      FBpullAllPosts(passport._strategies.facebook._oauth2.accessToken, passport._strategies.facebook._oauth2.profileID, fbcallback)
       
      function fbcallback(facebook){
        facebookResults = fbParser(facebook);
        fbasynccallback();
      } 
    });

    // Push, pull TW post to async tasks
    asyncTasks.push(function(twasynccallback) {
      TWpullAllTweets(passport._strategies.twitter._oauth.accessToken, passport._strategies.twitter._oauth.tokenSecret, twcallback);

      function twcallback(twitter) {
        twitterResults = twParser(twitter);
        twasynccallback();
      }
    });

    // Excute all async tasks in the asyncTasks array
    async.parallel(asyncTasks, function() {
      // combine posts here!!!
      var output = twitterResults.concat(facebookResults);
      output.sort(function(a, b) { return b['updatedTimeValue'] - a['updatedTimeValue']});
      res.render('main', {index:{test: output}});
    });

  } else {
    if(passport._strategies.facebook._oauth2.hasOwnProperty('accessToken')) {
      FBpullAllPosts(passport._strategies.facebook._oauth2.accessToken, passport._strategies.facebook._oauth2.profileID, fbcallback)
       
      function fbcallback(facebook){
        facebook = fbParser(facebook);
        res.render('main', {index:{test: facebook}});
      } 
    } 
    else if (passport._strategies.twitter._oauth.hasOwnProperty('accessToken'))  {
      TWpullAllTweets(passport._strategies.twitter._oauth.accessToken, passport._strategies.twitter._oauth.tokenSecret, twcallback);

      function twcallback(twitter) {
        twitter = twParser(twitter);
        res.render('main', {index:{test:twitter}});
      }
    }
  }
});

app.use('/postInfo', function(req, res) {
  res.render('postInfo');
});

app.use('/reply', function(req, res) {
  res.render('reply');
});


// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'), function (req, res) {});

app.get('/auth/twitter' , passport.authenticate('twitter'), function(req, res) {});


// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback', 
   passport.authenticate('facebook', { failureRedirect: '/index', successRedirect:'/main'}));

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/main', failureRedirect: '/index' }));


app.get('/logout', function(req, res){
  req.session = null;
  res.redirect('index');
  //req.session.destroy(function(err) {
  //  res.redirect('index');
  //});
  //req.logout();
  //res.render('index');
});

// Server Setup
var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};
var server = https.createServer(options, app).listen(3000);

app.use('/', function(req, res) {
  res.render('index');
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('index')
}

var FBpostToFeedMessageAccessToken = function (mess, accessToken, callback) {
  graph.setAccessToken(accessToken);
  var temp = {'message':mess};
  graph.post("/feed", temp , function(err, res) {
    if (res) {
      callback(res);
    } else {
      console.log('2',err);
    }
  });
};


var FBpullAllPosts = function(accessToken, userID, callback) {
  graph.setAccessToken(accessToken);
  var post = "/" + userID + "/posts";
  graph.get(post, function(err, res) {
    callback(res);
  });
};


var FBcommentToPost = function (message, postID, token, callback) {
  graph.setAccessToken(token);
  graph.post("/" + postID + "/comments", {'message':message}, function(err, res) {
    callback(res);
  });
};

var TWtweet = function (message, accessKey, accessSecret, callback) {
  var client = new Twitter({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    access_token_key: accessKey,
    access_token_secret: accessSecret
  });

  client.post('statuses/update.json', {'status':message}, function(error, res) {
    callback(res);
  });

};

var TWpullAllTweets = function(accessKey, accessSecret, callback) {
  var client = new Twitter({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    access_token_key: accessKey,
    access_token_secret: accessSecret
  });

  client.get('statuses/user_timeline.json', {screen_name:'bundl_man', count:2}, function(error, tweets, res) {
  //client.get('statuses/home_timeline', {count:1}, function(error, tweets, res) {
    if (error) throw error;

    callback(JSON.parse(res.body));
  });
};
