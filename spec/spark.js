'use strict';

var path = require('path'),
	expect = require('chai').expect,
	Q = require('q'),
	Spark = require('./../src/spark');

describe('spark', function() {
	var spark = new Spark();

	this.timeout(10000);

	before(function() {
		return spark.start();
	});

	after(function() {
		return spark.stop();
	});

	describe('generate files', function() {
		spark.files.forEach(function(file) {
			it(file, function() {
				return spark.generate(file);
			});
		});
	});

	describe('compile files', function() {
		spark.files.forEach(function(file) {
			it(file, function() {
				return spark.compile(file);
				/*
				.catch((err) => {
					console.error(err);
				});
				*/
			});
		});
	});

	describe('run and compare results', function() {
		spark.files.forEach(function(file) {
			it(file, function() {

			});
		});

		/*
		it('does something', function() {
			var p1 = Q(11),
				p2 = Q(11);

			return Q.spread([p1, p2], function(a, b) {
				expect(a).to.equal(b);
				expect(b).to.equal(a);
				//expect(b).to.not.equal(a);
			});

		});

		it('does something else', function() {
			expect(1).to.equal(2 - 1);
		});
		*/
		// Add more assertions here
	});
});
