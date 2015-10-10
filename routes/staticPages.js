/**
 * Routes for pages that are static
 */

var express = require('express');

module.exports = (function() {
	'use strict';
	var router = express.Router();
	
	router.get('/about', function(req, res) {
		res.render('about');
	});
	
	router.get('/support', function(req, res) {
		res.render('support');
	});
	
	router.get('/features', function(req, res) {
		res.render('features');
	});
	
	router.get('/error', function(req, res) {
		res.render('error');
	});
	
	router.get('/*', function(req, res) {
		res.render('index');
	});
	
	return router;
})();