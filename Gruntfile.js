"use strict";

require('string-format');

// Preserve order of dependecies
// (Replace this with 'require'?)

var components = [
	'Base',
	'Math',
	'Color',
	'Image',
	'Event',
	'EventEmitter',
	'Point',
	'Rectangle',
	'UID',
	'Entity',
	'DisplayEntity',
	'DisplayGroup',
	'Stage',
	'Spritesheet',
	'Sprite'
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

		jshint: {
			force: true,
			files: sources.concat(specs),
			options: {
				jshintrc: './log/.jshintrc',
				reporter: './log/jshint-reporter.js',
				reporterOutput: './log/jshint.log'
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
				// maxLineLen: 80,
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> | ' +
						'(c) 2014 Michael Zalla | <%= pkg.license %> License \t\t*/\n' +
						'/*! Read the full source at <%= pkg.homepage %> \t*/'
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('test', ['jasmine', 'jshint']);
	grunt.registerTask('minify', ['uglify']);
	grunt.registerTask('default', ['watch']);
	
};