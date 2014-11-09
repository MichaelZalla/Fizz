// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var Fontsheet = Fizz.Spritesheet.extend({
			
		init: function(settings) {

			this._fontName = null;
			this._glyphs = [ ];

			if(typeof settings == "object" && settings !== null) {
				if('glyphs' in settings) {					
					// Determine frames from glyphs description
					settings.frames = { };
					settings.frames.width = settings.glyphs.width;
					settings.frames.height = settings.glyphs.height;
					settings.frames.count = settings.glyphs.values.length;
					this._glyphs = settings.glyphs.values;
					delete settings.glyphs;
				}
			}

			Fizz.Spritesheet.prototype.init.call(this, settings);

		},

		getGlyph: function(glyphValue) {
			return this.getFrame(this._glyphs.indexOf(glyphValue));
		},

		toString: function() {
			return "[Fontsheet (fontName='" + this._fontName + "')]";
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

}());