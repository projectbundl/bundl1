// set variables for environment
var express = require('express');
var path = require('path');
var Facebook = require('facebook-node-sdk');

var app = express.createServer();

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'foo bar' }));
  app.use(Facebook.middleware({ appId: '417015361805687'}));
});

app.get('/', Facebook.loginRequired(), function(req, res) {

});
/*
// Set server port
app.get('/', function(req, res) {
  if (req.query.temp == "Craig") res.end('Hello, Craig');
  else if (req.query.temp == "Jesse") res.end('Hello Jesse!');
  else res.end('Get out of here!!!');
});
*/
app.listen(4000);
console.log('server is running');
