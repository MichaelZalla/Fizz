"use strict";

require('grunt-verbosity');
// require('string-format');

// Preserve order of dependecies

var components = [

	// Base modules

	'Object',
	'Restrict',
	'Environment',
	/* Missing spec! */
	'Logger',

	// Utilities

	'Math',
	'Color',

	// Event system

	'Event',
	'EventEmitter',

	// Entity system

	'Point',
	'Rectangle',
	'UID',
	'Entity',
	'EntityPool',

	// Display system

	'DisplayEntity',
	'DisplayGroup',
	'DisplayGrid',
	'Canvas',
	'Stage',

	// Graphics

	'Spritesheet',
	'Fontsheet',
	'Graphic',
	'Sprite',
	'Textbox',

	// Renderers

	'RAFRenderer',

	// Helper classes

	'Demo'

];

var sources = components.map(function(c) {
	return "src/js/lib/Fizz." + c + ".js";
});

var specs = components.map(function(c) {
	return "src/js/spec/spec." + c + ".js";
});

module.exports = function(grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		verbosity: { },

		debug: {
			options: {
				open: true
			}
		},

		jshint: {
			files: sources.concat(specs),
			options: {
				force: true,
				jshintrc: './.jshintrc',
				reporter: './jshint-reporter.js',
				reporterOutput: './reporter.log'
			}
		},

		watch: {
			files: sources.concat(specs),
			tasks: [
				'jasmine',
				'jshint',
				'minify'
			],
		},

		jasmine: {
			src: sources,
			options: {
				specs: specs,
				display: 'none',
				summary: true,
				host: 'http://localhost:8000/'
			}
		},

		uglify: {
			lib: {
				files: {
					'dist/min/fizz.min.js': sources,
				},
			},
			options: {
				mangle: true,
				compress: true,
				sourceMap: true,
				report: 'gzip',
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> | ' +
						'(c) 2014 <%= pkg.author.name %> | <%= pkg.licenses[0].type %> License */\n' +
						'/*! Read the full source at <%= pkg.repository.url %> */'
			}
		}

	});

	// Grunt debug tasks
	grunt.loadNpmTasks('grunt-verbosity');
	grunt.loadNpmTasks('grunt-debug-task');

	// Grunt dev tasks
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('test', ['jshint', 'jasmine']);
	grunt.registerTask('minify', ['uglify']);
	grunt.registerTask('default', ['watch']);
	grunt.registerTask('debug', ['debug']);

};