
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

var sources = components.map(function(c, i) {
	return "js/lib/Fizz.{0}.js".format(c);
});

var specs = components.map(function(c, i) {
	return "js/spec/spec.{0}.js".format(c);
});

module.exports = function(grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			files: sources.concat(specs),
			options: {
				reporter: './log/jshint-reporter.js'
				,reporterOutput: './log/jshint-notices.log'
			}
		},

		watch: {
			files: sources.concat(specs),
			tasks: ['jshint']
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

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('test', ['jshint', 'jasmine']);
	grunt.registerTask('minify', ['uglify']);
	grunt.registerTask('default', ['test', 'watch']);
	
};