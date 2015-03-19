// set variables for environment
var express = require('express');
var path = require('path');
var graph = require('fbgraph');
var Facebook = require('facebook-node-sdk');
var creds = require("./creds");
var passport = require('passport');
var engine = require('consolidate');

var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , FacebookStrategy = require('passport-facebook').Strategy
  , logger = require('morgan')
  , session = require('express-session')
  , bodyParser = require("body-parser")
  , cookieParser = require("cookie-parser")
  , methodOverride = require('method-override');

var FACEBOOK_APP_ID = creds.fb.id;
var FACEBOOK_APP_SECRET = creds.fb.secret;


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
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://babbage.hbg.psu.edu:6395/auth/facebook/callback"
    , profileFields: ['id', 'displayName', 'photos']
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
            graph.setAccessToken(accessToken);
            graph.get('/me', function(err, res) {
               console.log(res);
               return done(null, profile);
            });
            console.log(profile);
            console.log(accessToken.length);
      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.
      //return done(null, profile);
    });
  }
));

var app = express();
app.use(express.static(path.join(__dirname, 'public')));
//app.set('views', __dirname + '/views');
//app.engine('html', engine.mustache);
app.set('view engine', '.html');

// configure Express
/*
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(logger());
  app.use(cookieParser());
  app.use(bodyParser());
  app.use(methodOverride());
  app.use(session({ secret: 'keyboard cat' }));
  */
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
//  app.use(express.static(__dirname + '/public'));




app.get('/main', ensureAuthenticated, function(req, res){
  console.log();
  gr
  res.render('/main.html');
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/loginForm', function(req, res){
  res.render('loginForm.html', { user: req.user });
});

// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',
  passport.authenticate('facebook'), 
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' , successRedirect: '/main.html'}));
/*
  function(req, res) {
          console.log("in callback");
  })
  );
*/
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
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
  res.redirect('/login')
}

/*

var User = function(uid, fname) {
  this.userid = uid;
  this.firstname = fname;
  console.log('Person instantiated');
  console.log('username: ' + this.username);
};
User.prototype.str = function() {
  return "userid=" + this.userid + "&username=" + this.firstname;
};

var app = express();
var conf = {
  client_id: creds.fb.id,
	client_secret: creds.fb.secret,
  scope: 'email, user_about_me, user_birthday, user_location, publish_stream',
  redirect_uri: 'https://babbage.hbg.psu.edu:6395/main.html',
};

var options = {
  timeout: 3000,
  pool: { maxSockets: Infinity },
  headers: {connection: "keep-alive"}
};


app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
	res.render("index.html", { title: "click link to connect" });
});

var BUser = { 'bid':"",
        'bemail':"",
        'bfirst_name':"",
        'bname':"" };


app.get('/auth/facebook', function(req, res, err) {
//	we don't have a code yet
//	so we'll redirect to the oauth dialog
	if (!req.query.code) {
		var authUrl = graph.getOauthUrl({
			"client_id":    creds.fb.id
			, "redirect_uri":  conf.redirect_uri
			, "scope":         conf.scope
		});
	};

  graph.getLoginStatus(function(res) {
    res.redirect(authUrl);

//	code is set
//	we'll send that and get the access token
	graph.authorize({
		"client_id":      creds.fb.id
		, "redirect_uri":   conf.redirect_uri
		, "client_secret":  creds.fb.secret
		, "code":           req.query.code
	}, function (err, facebookRes) {
  graph.setAccessToken();
  console.log(facebookRes);
  


// Get users Posts and display on main
//graph.get("Bundl Man", function(err, res) {
//  console.log("HI");
//  if (err) console.log(err);
//  console.log(res);
//});
//console.log("me: " + JSON.stringify(me()));
graph.get('/me', function(err, res) {
        console.log(err);
  var user1 = new User(res.id, res.name);
//  BUser.bname = res.name;
//  BUser.bfirst_name = res.first_name;
//  BUser.bid = res.id;
//  BUser.bemail = res.email;
  res.redirect('/main.html?' + user1.str()); // Create BUser and output values in querystring
  });
});
});
});

		//if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
		//	res.redirect(authUrl);
		//} else {  //req.query.error == 'access_denied'
		//	res.send('access denied');
		//}

//user gets sent here after being authorized
app.get('/main.html', function(req, res) {
        console.log("there");
graph.setOptions(options).get("Bundl Man", function(err, res) {
        if (err) console.log('error: ' + JSON.stringify(err));
        console.log('success: ' + JSON.stringify(res));
});
res.render("index", { title: "Logged In" });
});


var port = 3000;
//var port = process.env.PORT || 22;
app.listen(port, function() {
console.log("Express server listening on port %d", port);
});
*/
