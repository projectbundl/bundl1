/**
 * Route for post page
 */

var express = require('express');

module.exports = (function() {
	'use strict';
	var router = express.Router();
	
	// TODO: process for authorized sites
	// define the home page route
	router.get('/', function(req, res) {
	  res.render('post')
	});
	
	return router;
})();