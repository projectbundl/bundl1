/**
 * Module dependencies.
 */

var bodyParser = require('body-parser')
  , compression = require('compression')
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

if ('development' == app.get('env')) {
	app.use(errorHandler());
}


// Routes
app.get('/', routes.index);
//app.get('/post', routes.post);

app.listen(3000, function(){
  console.log("Express server listening on port 3000 in mode");
});