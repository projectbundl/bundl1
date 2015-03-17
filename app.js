// set variables for environment
var express = require('express');
var path = require('path');
var graph = require('fbgraph');
var Facebook = require('facebook-node-sdk');
var fs = require('fs');

var app = express();

//this should really be in a config file!
var conf = {
		client_id: '417015361805687',
		client_secret: '63e069e235f6430eebe6991813614090',
	 scope: 'email, user_about_me, user_birthday, user_location, publish_stream',
		  redirect_uri: 'http://babbage.hbg.psu.edu:6395/main.html',
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
			"client_id":     conf.client_id
			, "redirect_uri":  conf.redirect_uri
			, "scope":         conf.scope
		});
if (err)
    console.log(conf.redirect_uri);
		if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
			res.redirect(authUrl);
		} else {  //req.query.error == 'access_denied'
			res.send('access denied');
		}
		return;
	}


//	code is set
//	we'll send that and get the access token
	graph.authorize({
		"client_id":      conf.client_id
		, "redirect_uri":   conf.redirect_uri
		, "client_secret":  conf.client_secret
		, "code":           req.query.code
	}, function (err, facebookRes) {
// Get users Posts and display on main
//graph.get("Bundl Man", function(err, res) {
//  console.log("HI");
//  if (err) console.log(err);
//  console.log(res);
//});
//console.log("me: " + JSON.stringify(me()));
var query = "Select name from user where uid = me()";
graph.get('/me', function(err, res) {
  BUser.bname = res.name;
  BUser.bfirst_name = res.first_name;
  BUser.bid = res.id;
  BUser.bemail = res.email;
  res.redirect('/main.html'); // Create BUser and output values in querystring
});
	});


});

//user gets sent here after being authorized
app.get('/main.html', function(req, res) {
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


//var app = express();

//// Set server port
//app.get('/', function(req, res) {
//  if (req.query.temp == "Craig") res.end('Hello, Craig');
//  else if (req.query.temp == "Jesse") res.end('Hello Jesse!');
//  else res.end('Get out of here!!!');
//});
//
//app.listen(4000);
//console.log('server is running');
