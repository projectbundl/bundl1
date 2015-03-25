// set variables for environment
var express = require('express')
  , ejs = require('ejs')
  , path = require('path')
  , graph = require('fbgraph')
  , creds = require("./creds")
  , engine = require('consolidate')
  , passport = require('passport')
  , util = require('util')
  , FacebookStrategy = require('passport-facebook').Strategy
  , logger = require('morgan')
  , session = require('express-session')
  , bodyParser = require("body-parser")
  , cookieParser = require("cookie-parser")
  , fbParser = require('./FBparse.js')
  , methodOverride = require('method-override');

var FACEBOOK_APP_ID = creds.fb.id;
var FACEBOOK_APP_SECRET = creds.fb.secret;


// Express Configuration
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));
app.set('view engine', 'jade');
app.use(passport.initialize());
app.use(passport.session());
//app.use(cookieParser());

var sessionStore = session({secret:"ssh!!", cookie:{maxAge:3600000}, resave: true, saveUninitialized: true});
app.use(sessionStore);


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
  app.use(bodyParser());
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
passport.use(new FacebookStrategy({
    passReqToCallBack: true,
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://babbage.hbg.psu.edu:6395/auth/facebook/callback",
    scope: ['publish_stream','read_stream', 'publish_actions', 'public_profile']
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
     
      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.
      
      // Can create our own cookie after user validation/ combine social media info from db
      // http://zipplease.tumblr.com/post/34169331215/node-js-session-management-with-express
      passport.accessToken = accessToken;
      passport.me = profile.id;
      return done(null, profile);
    });
  }
));


app.use('/post', ensureAuthenticated, function(req, res) {
  var temp = req.query.them;
  
  pullAllPosts(passport.accessToken, passport.me, callback)

  function callback(facebook){
    postToFeedMessageAccessToken(temp, passport.accessToken);
    facebook = fbParser(facebook);
    res.render('post', {index:{test: facebook}});
  }
  
});

app.use('/main', ensureAuthenticated, function(req, res){
  var temp = req.query.them;
  pullAllPosts(passport.accessToken, passport.me, callback)
   
  function callback(facebook){
    postToFeedMessageAccessToken(temp, passport.accessToken);
    //res.render('post', {index:{test: facebook}});
  }
  //res.render('main');
});

app.use('/postInfo', ensureAuthenticated, function(req, res) {
  res.render('postInfo');
});

app.use('/reply', ensureAuthenticated, function(req, res) {
  res.render('reply');
});

app.use('/index', function(req, res) {
  res.render('index');
});

// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',
  passport.authenticate('facebook'), function(req, res) {});  


// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback', 
   passport.authenticate('facebook', { failureRedirect: '/index', successRedirect:'/main'}));


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/index');
});

app.listen(3000, function() {
  console.log("Express server listening on port 3000");
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

var postToFeedMessageAccessToken = function (mess, accessToken) {
  graph.setAccessToken(accessToken);
  var temp = {message:mess};
  graph.post("/me/feed", temp , function(err, res) {
    //console.log(res);
  });
};

var output = new Array();
var pullFromFeedAccessTokenUserID = function (accessToken, userID) {
  graph.setAccessToken(accessToken);
  var post = "/" + userID + "/posts";
  graph.get(post, function (err, res) {
    for (var i in res.data) {
      if (res.data[i].comments) {
        console.log(res.data[i].comments.data[0].message);
        //console.log(res.data[i].comments);
       }
      if (res.data[i].message == "Put a comment under this post~") {
        commentToPost("This is a second reply", res.data[i].id);
       }
      output.push({message:res.data[i].message, name:res.data[i].from.name});      
      //console.log(res.data[i].message);
      //console.log(res.data[i].from.name
    }
    return res;
  });
};


var pullAllPosts = function(accessToken, userID, callback) {
  graph.setAccessToken(accessToken);
  var post = "/" + userID + "/posts";
  graph.get(post, function(err, res) {
    //console.log(res);
    callback(res);
  });
};


var commentToPost = function (message, postID) {
  graph.post("/" + postID + "/comments", {'message':message}, function(err, res) {
    console.log(res);
  });
}
