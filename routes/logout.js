/**
 * Route for logout page
 */

var express = require('express');

module.exports = (function() {
	'use strict';
	var router = express.Router();
	
	router.get('/', function(req, res) {
	  // TODO: Pull out to function and only process 
	  // for enabled media sites
	  delete(req.session.twitter);
	  delete(req.session.google);
	  delete(req.session.facebook);
	  req.session.destroy();
	  req.logOut();
	  res.render('/index');
	});
	
	return router;
})();