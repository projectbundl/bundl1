// set variables for environment
var express = require('express');
var path = require('path');
var fbgraph = require('fbgraph');
var Facebook = require('facebook-node-sdk');
var fs = require('fs');
var bodyparser = require('bodyparser');

var app = express();

var exp = express();

var conf = {
  client_id: '417015361805687',
  redirect_uri: 'http://localhost:3000/auth/facebook'
};


  //app.set('views', __dirname + '/views');
  //app.set('view engine', 'jade');
	exp.use(bodyparser.json());
	exp.use(express.methodOverride());
	exp.use(app.router);
	exp.use(express.static(__dirname + '/public'));


exp.configure('development', function(){
	exp.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

exp.configure('production', function(){
	exp.use(express.errorHandler());
});


exp.get('/', function(req, res){
  res.render("index", { title: "click link to connect" });
});


exp.get('/auth/facebook', function(req, res) {

  // we don't have a code yet
  // so we'll redirect to the oauth dialog
  if (!req.query.code) {
    var authUrl = fbgraph.getOauthUrl({
        "client_id":     conf.client_id
      , "redirect_uri":  conf.redirect_uri
    });

    if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
      res.redirect(authUrl);
    } else {  //req.query.error == 'access_denied'
      res.send('access denied');
    }
    return;
  }

  // code is set
  // we'll send that and get the access token
  fbgraph.authorize({
      "client_id":      conf.client_id
    , "redirect_uri":   conf.redirect_uri
    , "code":           req.query.code
  }, function (err, facebookRes) {
    res.redirect('/UserHasLoggedIn');
  });


});

// user gets sent here after being authorized
exp.get('/UserHasLoggedIn', function(req, res) {
  res.render("index", { title: "Logged In" });
});


//var app = express.createServer();
//
//app.configure(function() {
//  app.use(express.bodyParser());
//  app.use(express.cookieParser());
//  app.use(express.session({ secret: 'foo bar' }));
//  app.use(Facebook.middleware({ appId: '417015361805687'}));
//});
//
//app.get('/', Facebook.loginRequired(), function(req, res) {
//
//});

var port = process.env.PORT || 3000;
exp.listen(port, function() {
  console.log("Express server listening on port %d", port);
});


//// Set server port
//app.get('/', function(req, res) {
//  if (req.query.temp == "Craig") res.end('Hello, Craig');
//  else if (req.query.temp == "Jesse") res.end('Hello Jesse!');
//  else res.end('Get out of here!!!');
//});
//
//app.listen(4000);
//console.log('server is running');
