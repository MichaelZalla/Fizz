// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var Textbox = Fizz.DisplayGrid.extend({

		init: function(settings) {

			this._fontsheet = null;
			this._maxColumnLength = Fizz.Textbox.DEFAULT_MAX_COLUMN_LENGTH;

			this._content = " ";

			if(null !== settings && typeof settings === "object") {
				if('fontsheet' in settings && settings.fontsheet instanceof Fizz.Fontsheet) {
					this._fontsheet = settings.fontsheet;
					delete settings.fontsheet;
				}
				if('content' in settings && typeof content === "string") {
					// Update cache with new content (dynamic setter)
					this.content = content;
					delete settings.content;
				}
			}

			Fizz.DisplayGrid.prototype.init.call(this, settings);

			// Cache the DisplayGrid every time that we change content
			this._caching = true;

			// If a Fontsheet has been assigned to the Graphic, update the
			// Textbox's cache as soon as the Fontsheet data is available
			if(this._spritesheet) {
				if(this._spritesheet.loaded) {
					this.updateCache();
				} else {
					this._spritesheet.on('load', this.updateCache.bind(this));
				}
			}

		},

		updateCache: function() {

			var metrics = this._fontsheet.getMetrics();

			this._cellWidth = metrics.glyphWidth;
			this._cellHeight = metrics.glyphHeight;

			// Update the grid dimensions based on the content and column length
			this._columns = Math.min(this._content.length, this._maxColumnLength);
			this._rows = Math.ceil(this._content.length / this._columns);

			var metrics = this.fontsheet.getMetrics();
			var graphics = [ ];

			// If there is no content to display, 
			this._content.forEach(function(glyphValue) {
				
				var glyphGraphic = new Fizz.Graphic({
					'spritesheet': this.fontsheet,
					'texture': this.fontsheet.getGlyphIndex(glyphValue)
				});
				
				this.addChild(glyphGraphic);

			}, this);

			Fizz.DisplayGrid.prototype.updateCache.call(this);

		},

		copy: function(textbox) {
			Fizz.Graphic.prototype.copy.call(this, textbox);
			if(textbox instanceof Fizz.Textbox) {
				// Update cache with new content (dynamic setter)
				this._fontsheet = textbox.fontsheet;
				this._content = textbox.content;
				this._maxColumnLength = textbox.maxColumnLength;
				this.updateCache();
			}
		},

		clone: function() {
			var clone = new Fizz.Textbox();
			clone.copy(this);
			return clone;
		},

		toString: function() {
			// Implicit conversion to string
			return "[Text (content='" + this._content + "')]";
		}

	});

	// Static class members

	Textbox.DEFAULT_MAX_COLUMN_LENGTH = 32;

	Textbox.EVENTS = { };
	Textbox.EVENTS.CONTENT_CHANGED = 'contentchanged';

	// Public properties

	Textbox.prototype.exposeProperty("fontsheet");

	// Dynamic public properties

	Textbox.prototype.exposeProperty("content", "_content", function(value) {
		if(typeof value.toString === "function" && value.toString() !== this._content) {
			
			// Trim the value, appending a single space if necessary
			var trimmed = value.toString().trim();
			this._content = (0 === trimmed.length) ? " " : trimmed;

			// Update the cached to reflect the new content
			if(null !== this.fontsheet && true === this.fontsheet.loaded) {
				this.updateCache();
			}
			
			// Emit a 'contentchanged' event to notify any external listeners
			this.emit(Fizz.Textbox.EVENTS.CONTENT_CHANGED, {
				'content': this._content
			});

		}
	});

	Textbox.prototype.exposeProperty("maxColumnLength","_maxColumnLength",
		Fizz.restrict.toNumber("_maxColumnLength"));

	Textbox.prototype.banishProperty("width");
	Textbox.prototype.banishProperty("height");

	// Class export
	Fizz.Textbox = Textbox;

}());