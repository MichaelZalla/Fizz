// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var Fontsheet = Fizz.Spritesheet.extend({
			
		init: function(settings) {

			this._fontName = null;
			this._glyphSet = Fizz.Fontsheet.DEFAULT_GLYPH_SET;

			var error = "Attempt was made to instantiate a Fontsheet without a valid glyphSet definition";

			// Enforce proper instantiation of Fontsheets via a glyph-set definition

			// 'settings' must be object
			if(!( typeof settings === "object" && settings !== null )) {
				Fizz.throws(error);
			}

			// 'settings' must include a 'glyphSet' object
			if(!( typeof settings.glyphSet === "object" &&
						 settings.glyphSet !== null )) {
				Fizz.throws(error);
			}

			// 'glyphSet' must include a 'values' string of non-zero length
			if(!( typeof settings.glyphSet.values === "string" &&
						 settings.glyphSet.values.length )) {
				Fizz.throws(error);
			}

			// Allow the Fontsheet to be decorated with a font name for reference
			if('fontName' in settings && typeof settings.fontName === "string") {
				this._fontName = settings.fontName;
				delete settings.fontName;
			}
				
			// Determine frames from glyphs description
			settings.frames = { };
			settings.frames.width = settings.glyphSet.width;
			settings.frames.height = settings.glyphSet.height;
			settings.frames.count = settings.glyphSet.values.length;
			
			this._glyphSet = settings.glyphSet.values;
			
			delete settings.glyphSet;

			Fizz.Spritesheet.prototype.init.call(this, settings);

		},

		getGlyphIndex: function(glyphValue) {
			return this._glyphSet.indexOf(glyphValue);
		},

		getGlyph: function(glyphValue) {
			return this.getFrame(this._glyphSet.indexOf(glyphValue));
		},

		getMetrics: function() {
			
			// Make sure there is at least one glyph in the cache
			this.getFrame(0);

			var metrics = { };
			
			// Assumes uniform glyph widths and heights
			metrics.glyphCount = this._glyphSet.length;
			metrics.glyphWidth = this._framesCache[0].width;
			metrics.glyphHeight = this._framesCache[0].height;
			
			return metrics;

		},

		toString: function() {
			return String.format("[Fontsheet (fontName='{0}')]", this._fontName);
		}

	});

	// Static class members

	Fontsheet.DEFAULT_GLYPH_SET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
								  "abcdefghijklmnopqrstuvwxyz" +
								  "0123456789.,!?'@#$%&()/-+=";

	// Public properties

	Fontsheet.prototype.exposeProperty("fontName");
	
	// Class export
	Fizz.Fontsheet = Fontsheet;

	Fizz.logger.filter('all').log("Loaded module 'Fontsheet'.");

}());