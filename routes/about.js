/**
 * http://usejsdoc.org/
 */

var express = require('express');
var router = express.Router();

// define the home page route
router.get('/about', function(req, res) {
  res.render('about')
});

module.exports = router;