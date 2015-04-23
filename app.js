// set variables for environment
var express = require('express')
  , compression = require('compression')
  , async = require('async')
  , fs = require('fs')
  , multer = require('multer')
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
app.use(multer({dest:'./public/uploads'}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));
app.set('view engine', 'jade');
app.use(cookieParser());

var sessionStore = session({secret:"ssh!!", cookie:{maxAge:3600000}, resave: true, saveUninitialized: true, httpOnly: true, secure: true});
app.use(sessionStore);
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

// Log all server requests
app.use(function(req, res, next) {
/*  console.log('%s %s', req.method, req.url);
  var err = req.session.error, msg = req.session.notice, success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;
*/
  //console.log(req.session);
  next();
});

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
  oauth_authenticate_url: 'https://api.twitter.com/oauth/authenticate',
  passReqToCallback: true },
  function(req, accessToken, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function() {
      
      req.session.twitter = {_oauth2:{name:profile.displayName}};
      req.session.twitter._oauth2.accessToken = accessToken;
      req.session.twitter._oauth2.tokenSecret = tokenSecret;
      
      return done(null, profile);
    });
  }
));

passport.use('google', new GoogleStrategy({
  clientID: GOOGLE_APP_ID,
  clientSecret: GOOGLE_APP_SECRET,
  callbackURL: 'https://babbage.hbg.psu.edu:6395/auth/google/callback',
  scope: ['profile', 'email', 'openid', 'https://www.googleapis.com/auth/plus.stream.read', 'https://www.googleapis.com/auth/plus.me'],
  accessType: 'offline',
  approvalPrompt: 'force',
  passReqToCallback: true }, 
  function(req, accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function() {

      req.session.google = {_oauth2: {'accessToken': accessToken}};
      req.session.google._oauth2.refreshToken = refreshToken;
      req.session.google._oauth2.name = profile.displayName;

      return done(null, profile);
    });
  }
));

passport.use('facebook', new FacebookStrategy({
  passReqToCallBack: true,
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: "https://babbage.hbg.psu.edu:6395/auth/facebook/callback",
  scope: ['user_events', 'publish_pages', 'manage_pages', 'user_photos', 'publish_stream','read_stream', 'publish_actions', 'public_profile'],
  passReqToCallback: true},
  function(req, accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
        
      req.session.facebook = {_oauth2: {'accessToken': accessToken}};
      req.session.facebook._oauth2.name = profile.displayName;
      req.session.facebook._oauth2.profileID = profile.id;
      return done(null, profile);
    });
  }
));

app.post('/bin/processComment', ensureAuthenticated, function(req, res) {
  // Ensure there is an access token for the SM that is having the social media post sent to
  if (req.body.commentMessage) {
    if (req.body.smID == '1') {
      fbFunctions.FBcommentToPost(req.body.commentMessage, req.body.id, req.session.facebook._oauth2.accessToken, fbCommentCallback);

      function fbCommentCallback(response) {
        res.redirect('../main');
      }
    } else if (req.body.smID == '2') {
      twFunctions.TWcomment(req.body.commentMessage, req.body.id, req.session.twitter._oauth2.accessToken, req.session.twitter._oauth2.tokenSecret, twCommentCallback);

      function twCommentCallback(response) {
        res.redirect('../main');
      }
    } else {
      res.redirect('../main');
    }
  }
});

app.route('/post')
  .get(ensureAuthenticated, function(req, res) {
    if(req.session.twitter !== undefined)
      userName = req.session.twitter._oauth2.name; 
    else if(req.session.facebook !== undefined)
      userName = req.session.facebook._oauth2.name;
    else if(req.session.google !== undefined)
      userName = req.session.google._oauth2.name;
    else
      userName = "";
    res.render('post', {name: userName});
  })
  .post(ensureAuthenticated, function(req, res) {
    if (req.body.postMessage) {
      // Ensure there is an access token for the SM that is having the social media post sent to
      var postMessage = req.body.postMessage;
      var selection = req.body.sel;
      var asyncSubmitPosts = [];
      var errorMessage = '';
      var twitterMessage;

      if (selection.indexOf('0') > -1 || selection.indexOf('1') > -1) {
        if (req.session.facebook !== undefined) {

          // Submit post
          if (Object.getOwnPropertyNames(req.files).length !== 0) {
            asyncSubmitPosts.push(function(fbAsyncCallback) {
              fbFunctions.FBpostToFeedMessageAccessToken(postMessage, 'http://babbage.hbg.psu.edu:6396/uploads/' + req.files.fileName.name, req.session.facebook._oauth2.accessToken, fbcallbackpix);

              function fbcallbackpix(err3, facebook3) {
                if (postMessage.length > 140) {
                  fbFunctions.FBGetCommentURL(facebook3.id, req.session.facebook._oauth2.accessToken, function fbCommentCallback(err, res) {
                    fbAsyncCallback(res);
                  });
                } else {
                  fbAsyncCallback();
                }
              }
            });
          } else {
         
            asyncSubmitPosts.push(function(fbAsyncCallback) {
              fbFunctions.FBpostToFeedMessageAccessToken(postMessage, req.body.picture, req.session.facebook._oauth2.accessToken, fbcallpix);

              function fbcallpix(err2, facebook2) {
                if (postMessage.length > 140) {

                  fbFunctions.FBGetCommentURL(facebook2.id, req.session.facebook._oauth2.accessToken, function fbCommentCallback(err, res) {
                    fbAsyncCallback(res);
                  });
                } else {
                  fbAsyncCallback();
                }
              }
            });
          }
          
        } else {
          // unauthorized
          errorMessage += "Yo you do not have access to post to Facebook!\n";
        }
      }
      
      if (selection.indexOf('0') > -1 || selection.indexOf('2') > -1) {
        if (req.session.twitter !== undefined) {
          if (postMessage.length <= 140 || asyncSubmitPosts.length == 0) {
            if (Object.getOwnPropertyNames(req.files).length !== 0) {
              asyncSubmitPosts.push(function(twAsyncCallback) {
                twFunctions.twitter_image(postMessage, req.files, req.session.twitter._oauth2.accessToken, req.session.twitter._oauth2.tokenSecret, twcallback);
                function twcallback(err, response) {
                  if (err) errorMessage += "Yo there was an error uploading your image to Twitter\n";
                  //console.log('twi err:', err);
                  //console.log('twi res', response);
                  twAsyncCallback();
                }
              });
            } else {
              asyncSubmitPosts.push(function(twAsyncCallback) {
                // Submit post to Twitter
                twFunctions.TWtweet(postMessage, req.session.twitter._oauth2.accessToken, req.session.twitter._oauth2.tokenSecret, twcallback);

                function twcallback(err, response) {
                  if (err) errorMessage += "Yo there was an error submitting your Twitter Post\n";
                  twAsyncCallback();
                }
              });
            }
          }
        } else {
          // unauthorized
          errorMessage += "Yo you do not have access to post to Twitter!\n";
        }
      }

      async.parallel(asyncSubmitPosts, function(url) {
        //console.log(url.actions[0].link);
        if (postMessage.length > 140 && selection.length > 1) {
          //console.log("in parallel:", url);
          twFunctions.TWtrunk(postMessage, url.actions[0].link, function hollerback(totalMessage) {
            twFunctions.TWtweet(totalMessage, req.session.twitter._oauth2.accessToken, req.session.twitter._oauth2.tokenSecret, twcallback);

            function twcallback(err, response) {
              if (err) errorMessage += "Yo there was an error submitting your Twitter Post\n";
              if (errorMessage == '') {
                res.redirect('main');
              } else {
                req.session.errorMessage = errorMessage;
                res.redirect('main');
              }
            }
          });
        } else {
          // Check if there were errors
          if (errorMessage == '') {
            res.redirect('main');
          } else {
            req.session.errorMessage = errorMessage;
           res.redirect('main');
          }
        }
      });
    }
  });

app.use('/error', function(req, res) {
  res.render('error');
});

app.use('/main', ensureAuthenticated, function(req, res) {
  var twitterMentions;
  var facebookResults;
  var twitterResults;
  var googleResults;
  var userName;
  var asyncTasks = [];

  if (req.session.facebook !== undefined) {
    // Push, pull FB post to async tasks
    asyncTasks.push(function(fbasynccallback) {
      fbFunctions.FBpullAllPosts(req.session.facebook._oauth2.accessToken, req.session.facebook._oauth2.profileID, fbcallback)
       
      function fbcallback(err, facebook){
        facebookResults = fbParser(facebook);
        userName = req.session.facebook._oauth2.name;
        fbasynccallback();
      } 
    });
  }

  if (req.session.twitter !== undefined) {
    asyncTasks.push(function(twmentionsCallback) {
      twFunctions.TWGetMentions(req.session.twitter._oauth2.accessToken, req.session.twitter._oauth2.tokenSecret, twmentionscall);

      function twmentionscall(err, twittermentions) {
        twitterMentions = twParser.mentionParse(twittermentions);
        twmentionsCallback();
      }
    });

    // Push, pull TW post to async tasks
    asyncTasks.push(function(twasynccallback) {

      twFunctions.TWpullAllTweets(req.session.twitter._oauth2.accessToken, req.session.twitter._oauth2.tokenSecret, twcallback);

      function twcallback(err, twitter) {
        twitterResults = twParser.parse(twitter);
        userName = req.session.twitter._oauth2.name;
        twasynccallback();
      }
    });
  }

  if (req.session.google !== undefined) {
    asyncTasks.push(function(gpasynccallback) {
      gpFunctions.GPpullAllPosts(req.session.google._oauth2._clientId, req.session.google._oauth2._clientSecret, req.session.google._oauth2.accessToken, gpcallback);

      function gpcallback(err, google) {
        gpParser(google, req.session.google._oauth2._clientId, req.session.google._oauth2._clientSecret, req.session.google._oauth2.accessToken, function(results) {
          googleResults = results;       
          userName = req.session.google._oauth2.name;
          gpasynccallback();
        });
      }
    });
  }

  if (asyncTasks.length) {
    async.parallel(asyncTasks, function() {
      // combine posts here!!
      var output = combineLists.combineLists(twitterResults, facebookResults, googleResults);

      if (req.session.errorMessage !== undefined) {
        var tem = req.session.errorMessage;
        req.session.errorMessage = undefined;
        res.render('main', {'errorMessage':tem, index:{test: output}, 'name':userName, 'mentions':twitterMentions});
      } else {
        res.render('main', {'errorMessage':'', index:{test: output}, 'name':userName, 'mentions':twitterMentions});
      }
    });
  } else {
    res.render('index');
  }
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
  delete(req.session.twitter);
  delete(req.session.google);
  delete(req.session.facebook);
  req.session.destroy();
  req.logOut();
  res.redirect('/');
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
  res.redirect('error')
}

var tempsession = function(req, res) {
  console.log("I'm in the session");
  var temp = req.session.passprot;
  req.session.regenerate(function(err) {
    req.session.passport = temp;
    req.session.save(function(err) {
      res.send(200);
    });
  });
};
