// set variables for environment
var express = require('express');
var path = require('path');
var graph = require('fbgraph');
var Facebook = require('facebook-node-sdk');
var creds = require("./creds");

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
			"client_id":    creds.fb.id
			, "redirect_uri":  conf.redirect_uri
			, "scope":         conf.scope
		});
		if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
			res.redirect(authUrl);
		} else {  //req.query.error == 'access_denied'
			res.send('access denied');
		}
	}

//	code is set
//	we'll send that and get the access token
	graph.authorize({
		"client_id":      creds.fb.id
		, "redirect_uri":   conf.redirect_uri
		, "client_secret":  creds.fb.secret
		, "code":           req.query.code
	}, function (err, facebookRes) {
          console.log(facebookRes);
          console.log(creds.fb.secret);


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
  console.log("Here");
  console.log(user1.userid);
  res.redirect('/main.html?' + user1.str()); // Create BUser and output values in querystring
  });
});


});

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
