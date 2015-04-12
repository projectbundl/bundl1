// set variables for environment
var express = require('express')
  , compression = require('compression')
  , async = require('async')
  , fs = require('fs')
  , https = require('https')
  , creds = require("./creds")
  , passport = require('passport')
  , google = require('googleapis')
  , fbGraph = require('fbgraph')
  , OAuth2 = google.OAuth2Client
  , FacebookStrategy = require('passport-facebook').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
  , session = require('express-session')
  , bodyParser = require("body-parser")
  , cookieParser = require("cookie-parser")
  , morgan = require('morgan')
  , logout = require('express-passport-logout')
  , fbParser = require('./FBparse.js')
  , twParser = require('./TWparse.js')
  , gpParser = require('./GPparse.js')
  , fbFunctions = require('./FBFunctions.js')
  , twFunctions = require('./TWFunctions.js')
  , gpFunctions = require('./GPFunctions.js')
  , combineLists = require('./combineFunctions.js');

var FACEBOOK_APP_ID = creds.fb.id;
var FACEBOOK_APP_SECRET = creds.fb.secret;
var TWITTER_CONSUMER_KEY = creds.tw.id;
var TWITTER_CONSUMER_SECRET = creds.tw.secret;
var GOOGLE_APP_ID = creds.gPlus.id;
var GOOGLE_APP_SECRET = creds.gPlus.secret;

// Express Configuration
var app = express();
app.use(compression());
app.use(morgan('dev'));
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

/*
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
*/

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
      //User.findOrCreate(..., function(err, user) {
      //if (err) { return done(err); }
      
      passport._strategies.twitter._oauth.name = profile.displayName;
      passport._strategies.twitter._oauth.accessToken = accessToken;
      passport._strategies.twitter._oauth.tokenSecret = tokenSecret;
      return done(null, profile);
    //});
    });
  }
));

passport.use('google', new GoogleStrategy({
  clientID: GOOGLE_APP_ID,
  clientSecret: GOOGLE_APP_SECRET,
  callbackURL: 'https://babbage.hbg.psu.edu:6395/auth/google/callback',
  scope: ['profile', 'email', 'openid', 'https://www.googleapis.com/auth/plus.stream.read', 'https://www.googleapis.com/auth/plus.me'],
  accessType: 'offline',
  approvalPrompt: 'force'
  }, 
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      passport._strategies.google._oauth2.accessToken = accessToken;
      passport._strategies.google._oauth2.refreshToken = refreshToken;
      passport._strategies.google._oauth2.name = profile.displayName;

      return done(null, profile);
    });
  }
));

passport.use('facebook', new FacebookStrategy({
  passReqToCallBack: true,
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: "https://babbage.hbg.psu.edu:6395/auth/facebook/callback",
  scope: ['user_events', 'publish_pages', 'manage_pages', 'user_photos', 'publish_stream','read_stream', 'publish_actions', 'public_profile'] },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.
        
      // Can create our own cookie after user validation/ combine social media info from db
      // http://zipplease.tumblr.com/post/34169331215/node-js-session-management-with-express
      passport._strategies.facebook._oauth2.name = profile.displayName;
      passport._strategies.facebook._oauth2.accessToken = accessToken;
      passport._strategies.facebook._oauth2.profileID = profile.id;
      return done(null, profile);
    });
  }
));

app.post('/bin/processComment', function(req, res) {
  // Ensure there is an access token for the SM that is having the social media post sent to
  if (req.body.commentMessage) {
    if (req.body.smID == '1') {
      fbFunctions.FBcommentToPost(req.body.commentMessage, req.body.id, passport._strategies.facebook._oauth2.accessToken, fbCommentCallback);

      function fbCommentCallback(response) {
        res.redirect('../main');
      }
    } else if (req.body.smID == '2') {
      twFunctions.TWcomment(req.body.commentMessage, req.body.id, passport._strategies.twitter._oauth.accessToken, passport._strategies.twitter._oauth.tokenSecret, twCommentCallback);

      function twCommentCallback(response) {
        res.redirect('../main');
      }
    } else {
      res.redirect('../main');
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
      var selection = req.body.sel;
      var asyncSubmitPosts = [];
      var errorMessage = '';


      if (selection.indexOf('0') > -1 || selection.indexOf('1') > -1) {
        if (passport._strategies.facebook._oauth2.hasOwnProperty('accessToken')) {
          // Submit post
         
          asyncSubmitPosts.push(function(fbAsyncCallback) {
            fbFunctions.FBpostToFeedMessageAccessToken(postMessage, req.body.picture, passport._strategies.facebook._oauth2.accessToken, fbcallpix);
              function fbcallpix(err2, facebook2){
             // console.log(err2);
               console.log("yep");
                fbAsyncCallback();
              }
             
            });
          
        } else {
          // unauthorized
          errorMessage += "Yo you do not have access to post to Facebook!\n";
        }
      }
      
      if (selection.indexOf('0') > -1 || selection.indexOf('2') > -1) {
        if (passport._strategies.twitter._oauth.hasOwnProperty('accessToken')) {
          asyncSubmitPosts.push(function(twAsyncCallback) {
            // Submit post to Twitter
            twFunctions.TWtweet(postMessage, passport._strategies.twitter._oauth.accessToken, passport._strategies.twitter._oauth.tokenSecret, twcallback);

            function twcallback(err, response) {
              if (err) errorMessage += "Yo there was an error submitting your Twitter Post\n";
              twAsyncCallback();
            }
          });
        } else {
          // unauthorized
          errorMessage += "Yo you do not have access to post to Twitter!\n";
        }
      }

      async.parallel(asyncSubmitPosts, function() {
        // Check if there were errors
        if (errorMessage == '')
        res.redirect('main');
      else
        res.redirect('main?error=' + errorMessage);
      });
    }
  });

app.use('/error', function(req, res) {
  res.render('error');
});

app.use('/main', function(req, res) {
  var facebookResults;
  var twitterResults;
  var googleResults;
  var userName;
  var asyncTasks = [];

  if (passport._strategies.facebook._oauth2.hasOwnProperty('accessToken')) {
    // Push, pull FB post to async tasks
    asyncTasks.push(function(fbasynccallback) {
      fbFunctions.FBpullAllPosts(passport._strategies.facebook._oauth2.accessToken, passport._strategies.facebook._oauth2.profileID, fbcallback)
       
      function fbcallback(err, facebook){
        facebookResults = fbParser(facebook);
        userName = passport._strategies.facebook._oauth2.name;
        fbasynccallback();
      } 
    });
  }

  if (passport._strategies.twitter._oauth.hasOwnProperty('accessToken')) {
    // Push, pull TW post to async tasks
    asyncTasks.push(function(twasynccallback) {
      twFunctions.TWpullAllTweets(passport._strategies.twitter._oauth.accessToken, passport._strategies.twitter._oauth.tokenSecret, twcallback);

      function twcallback(err, twitter) {
        twitterResults = twParser(twitter);
        userName = passport._strategies.twitter._oauth.name;
        twasynccallback();
      }
    });
  }

  if (passport._strategies.google._oauth2.hasOwnProperty('accessToken')) {
    asyncTasks.push(function(gpasynccallback) {
      gpFunctions.GPpullAllPosts(passport._strategies.google._oauth2._clientId, passport._strategies.google._oauth2._clientSecret, passport._strategies.google._oauth2.accessToken, gpcallback);

      function gpcallback(err, google) {
        gpParser(google, passport._strategies.google._oauth2._clientId, passport._strategies.google._oauth2._clientSecret, passport._strategies.google._oauth2.accessToken, function(results) {
          googleResults = results;       
          userName = passport._strategies.google._oauth2.name;
          gpasynccallback();
        });
      }
    });
  }

  async.parallel(asyncTasks, function() {
    // combine posts here!!
    var output = combineLists.combineLists(twitterResults, facebookResults, googleResults);

    if (req.query['error'] !== 'undefined') {
      res.render('main', {'errorMessage':req.query['error'], index:{test: output}, 'name':userName});
    } else {
      res.render('main', {'errorMessage':'', index:{test: output}, 'name':userName});
    }
  });
});


app.use('/postInfo', function(req, res) {
  res.render('postInfo');
});

app.use('/reply', function(req, res) {
  res.render('reply');
});

app.use('/about', function(req, res){
  res.render('about');
});

app.use('/features', function(req, res){
 res.render('features');
});

app.use('/support', function(req, res){
res.render('support');
});

// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'), function (req, res) {});

app.get('/auth/twitter' , passport.authenticate('twitter'), function(req, res) {});

app.get('/auth/google', passport.authenticate('google'), function(req, res) {});

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/main', failureRedirect:'/index' }));

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/main', failureRedirect: '/index' }));

app.get('/auth/google/callback',
  passport.authenticate('google', { successRedirect: '/main', failureRedirect: '/index' }));


app.get('/logout', function(req, res){
  req.session.destroy();
  req.logOut();
  res.redirect('/');
  //req.session.save();
  //req.session = null;
  //res.redirect('index');
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
