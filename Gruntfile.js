"use strict";

require('grunt-verbosity');
require('string-format');

// Preserve order of dependecies
// (Replace this with 'require'?)

var components = [
	
	'Base',
	'Math',

	'Event',
	'EventEmitter',

	'Point',
	'Rectangle',

	'UID',
	'Entity',

	'Color',
	'Canvas',
	
	'DisplayEntity',
	'DisplayGroup',
	'DisplayGrid',
	'Stage',

	'Spritesheet',
	'Graphic',
	'Sprite',
	
	'Fontsheet',
	'Textbox'
	
];

var sources = components.map(function(c) {
	return "js/lib/Fizz.{0}.js".format(c);
});

var specs = components.map(function(c) {
	return "js/spec/spec.{0}.js".format(c);
});

module.exports = function(grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		verbosity: {

		},

		debug: {
			options: {
				open: true
			}
		},

		jshint: {
			files: sources.concat(specs),
			options: {
				force: true,
				jshintrc: './log/.jshintrc',
				reporter: './log/jshint-reporter.js',
				reporterOutput: './log/reporter.log'
			}
		},

		watch: {
			files: sources.concat(specs),
			tasks: ['jasmine', 'jshint']
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
					'js/min/fizz.min.js': sources
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