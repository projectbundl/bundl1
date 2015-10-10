/**
 * Route for reply page
 */

var express = require('express');

module.exports = (function() {
	'use strict';
	var router = express.Router();
	
	router.use(function(req, res, next) {
		console.log('Hit ', req.url, ' at Time: ', Date.now());
		next();
	});
	
	// TODO: process reply for authorized sites
	router.get('/', function(req, res) {
		res.render('reply');
	});
	
	return router;
})();