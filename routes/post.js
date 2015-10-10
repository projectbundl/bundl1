/**
 * Route for post page
 */

var express = require('express');

module.exports = (function() {
	'use strict';
	var router = express.Router();
	
	router.use(function timeLog(req, res, next) {
	  console.log('Hit ', req.url, ' at Time: ', Date.now());
	  next();
	});
	
	// TODO: process for authorized sites
	// define the home page route
	router.get('/', function(req, res) {
	  res.render('post')
	});
	
	return router;
})();