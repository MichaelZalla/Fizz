
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
	return "js/lib/<%= pkg.name %>.{c}.js".format([c]);
});

var specs = components.map(function(c) {
	return "js/spec/spec.{c}.js".format([c]);
});

module.exports = function(grunt) {


	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			files: sources.concat(specs)
		},

		watch: {
			files: sources.concat(specs),
			tasks: ['jshint']
		},

		jasmine: {
			src: sources,
			specs: specs
		},

		uglify: {
			files: { 'js/min/fizz.min.js': sources },
			options: {
				mangle: false,
				compress: true,
				sourceMap: true,
				// maxLineLen: 80,
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        				'<%= grunt.template.today("yyyy-mm-dd") %> - ' +
        				'See the full source at <%= pkg.homepage %> - ' +
        				'(license: <%= pkg.license %>)*/'
			}
		}

	});

	grunt.loadNpmTasks('grunt-jslint');
	grunt.loadNpmTasks('grunt-jasmine-runner');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('test', ['jasmine']);
	grunt.registerTask('minify', ['uglify']);
	grunt.registerTask('default', ['test', 'watch']);

};