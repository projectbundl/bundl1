/**
 * Routes for SM auth
 */

var express = require('express');
var passport = require('passport');

module.exports(function() {
	'use strict';
	var router = express.Router();
	
	// GET /auth/facebook
	//  Use passport.authenticate() as route middleware to authenticate the
	//  request.  The first step in Facebook authentication will involve
	//  redirecting the user to facebook.com.  After authorization, Facebook will
	//  redirect the user back to this application at /auth/facebook/callback
	app.get('/facebook', 
	  passport.authenticate('facebook'));
})();