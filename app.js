/**
 * Module dependencies.
 */
var bodyParser = require('body-parser')
  , compression = require('compression')
  , config = require('config')
  , errorHandler = require('errorhandler')
  , express = require('express')
  , methodOverride = require('method-override')
  , morgan = require('morgan')
  , passport = require('passport')
  , app = express();

/**
 * Define routes
 */
var auth = require('./routes/auth')
  , logout = require('./routes/logout')
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
 * Apply routes to application
 */
app.use('/auth', auth);
app.use('/post', post);
//app.use('/reply', reply);
app.use('/logout', logout);
app.use('/', staticPages);

/**
 * Start application
 */
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %s in mode %s", process.env.PORT || 3000, config.get('mode'));
});