/**
 * Module dependencies.
 */

var bodyParser = require('body-parser')
  , compression = require('compression')
  , config = require('config')
  , errorHandler = require('errorhandler')
  , express = require('express')
  , methodOverride = require('method-override');

var app = express();
var router = express.Router()

/**
 * Define routes
 */
var about = require('./routes/about')
  , features = require('./routes/features')
  , post = require('./routes/post')
  , reply = require('./routes/reply')
  , routes = require('./routes')
  , support = require('./routes/support');


// Configuration
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(methodOverride());
app.use(express.static(__dirname + '/public'));
app.use(errorHandler(config.get('errorHandlerOptions'))); 


// Routes
// TODO: rework to log all requests here
router.use(function timeLog(req, res, next) {
  console.log('Hit ', req, ' at Time: ', Date.now());
  next();
});
app.get('/', routes.index);
app.get('/about', about);
app.get('/error')
app.get('/features', features);
app.get('/logout', routes.index, function(req, res){
  // TODO: Pull out to function and only process 
  // for enabled media sites
  delete(req.session.twitter);
  delete(req.session.google);
  delete(req.session.facebook);
  req.session.destroy();
  req.logOut();
})
app.get('/post', post);
app.get('/reply', reply);
app.get('/support', support);

// Run server
// can use NODE_ENV="development" nodejs app.js
// to run in dev
app.listen(config.port, function(){
  console.log("Express server listening on port %s in mode %s", config.get('port'), config.get('mode'));
});