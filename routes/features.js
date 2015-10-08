/**
 * http://usejsdoc.org/
 */

var express = require('express');
var router = express.Router();

router.use(function timeLog(req, res, next) {
  console.log('Hit ', req.url, ' at Time: ', Date.now());
  next();
});

// define the home page route
router.get('/features', function(req, res) {
  res.render('features')
});

module.exports = router;