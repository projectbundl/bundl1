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
  , app = express();

/**
 * Define routes
 */
var logout = require('./routes/logout')
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

/**
 * Apply routes to application
 */

app.use('/post', post);
//app.use('/reply', reply);
app.use('/logout', logout);
app.use('/', staticPages);

/**
 * Start application
 * Can use NODE_ENV="development" nodejs app.js to run in dev
 */
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %s in mode %s", process.env.PORT || 3000, config.get('mode'));
});