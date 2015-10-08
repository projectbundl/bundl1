/**
 * Module dependencies.
 */

var bodyParser = require('body-parser')
  , compression = require('compression')
  , config = require('config')
  , errorHandler = require('errorhandler')
  , express = require('express')
  , methodOverride = require('method-override')
  , post = require('./routes/post')
  , routes = require('./routes');

var app = express();


// Configuration
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(methodOverride());
app.use(express.static(__dirname + '/public'));
app.use(errorHandler(config.get('errorHandlerOptions'))); 


// Routes
app.get('/', routes.index);
app.get('/post', post);


// Run server
// can use NODE_ENV="development" nodejs app.js
// to run in dev
app.listen(config.port, function(){
  console.log("Express server listening on port %s in mode %s", config.get('port'), config.get('mode'));
});