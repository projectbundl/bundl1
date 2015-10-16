/**
 * Module dependencies.
 */
var bodyParser = require('body-parser')
  , compression = require('compression')
  , config = require('config')
  , configPassport = require('./lib/ConfigPassport')
  , errorHandler = require('errorhandler')
  , express = require('express')
  , facebookStrategy = require('passport-facebook').Strategy
  , methodOverride = require('method-override')
  , morgan = require('morgan')
  , passport = require('passport')
  , app = express();

/**
 * Define routes
 */
var auth = require('./routes/auth')
  , logout = require('./routes/logout')
  , main = require('./routes/main')
  , post = require('./routes/post')
//  , reply = require('./routes/reply')
  , staticPages = require('./routes/staticPages');

/**
 * Configure application
 */
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(methodOverride());
app.use(express.static(__dirname + '/public'));
app.use(morgan('short'));
app.use(errorHandler(config.get('errorHandlerOptions')));
app.use(passport.initialize());
app.use(passport.session());

/**
 * Passport config
 */
//configPassport(passport);

// Passport session setup.
//  To support persistent login sessions, Passport needs to be able to
//  serialize users into and deserialize users out of the session.  Typically,
//  this will be as simple as storing the user ID when serializing, and finding
//  the user by ID when deserializing.  However, since this example does not
//  have a database of user records, the complete Facebook profile is serialized
//  and deserialized.
passport.serializeUser(function(user, done) {
 done(null, user);
});

passport.deserializeUser(function(obj, done) {
 done(null, obj);
});

// Setup Facebook Strategy
passport.use(new facebookStrategy({
  passReqToCallBack: true,
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: "https://bundl.herokuapp.com/auth/facebook/callback",
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

app.get('/auth/facebook/callback', 
		  passport.authenticate('facebook', { successRedirect: '/main', failureRedirect:'/' }));

//GET /auth/facebook
//Use passport.authenticate() as route middleware to authenticate the
//request.  The first step in Facebook authentication will involve
//redirecting the user to facebook.com.  After authorization, Facebook will
//redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'), function (req, res) {});

/**
 * Apply routes to application
 */
//app.use('/auth', auth);
app.use('/post', post);
//app.use('/reply', reply);
app.use('/main', main);
app.use('/logout', logout);
app.use('/', staticPages);


//Simple route middleware to ensure user is authenticated.
//Use this route middleware on any resource that needs to be protected.  If
//the request is authenticated (typically via a persistent login session),
//the request will proceed.  Otherwise, the user will be redirected to the
//login page.
function ensureAuthenticated(req, res, next) {
if (req.isAuthenticated()) { return next(); }
res.redirect('error')
}

/**
 * Start application
 */
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %s in mode %s", process.env.PORT || 3000, config.get('mode'));
});