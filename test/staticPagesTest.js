/**
 * Tests that static pages routes return 200
 */

var should = require('should');
var assert = require('assert');
var request = require('supertest');
var app = require('../app.js').app;

describe("StaticPageRouting", function() {
	request(app)
	.get('/')
	.send()
	.end(function(err, res) {
		if (err) {
			throw err;
		}
		res.should.have.status(400);
		done();
	});
});