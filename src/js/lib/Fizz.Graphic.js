// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var Graphic = Fizz.DisplayEntity.extend({

		init: function(settings) {

			Fizz.DisplayEntity.prototype.init.call(this, null, false);

			//@TODO Reconsider the pre-load appearance of a graphic/texture
			// Should the library provide a default texture to stretch over
			// a Graphic's cache until its spritesheet has loaded?
			// Maybe something base-64 encoded to avoid any async requests
			this._fillStyle = Fizz.Color.LIME;
			this._lineWidth = 1;

			this._spritesheet = null;
			this._texture = Fizz.Graphic.DEFAULT_TEXTURE;
			this._localTexturesCache = { };

			// Allow existing Spritesheet instances to be passed in

			if(settings instanceof Fizz.Spritesheet)
			{
				this._spritesheet = settings;
				settings = null;
			}

			// Allow URI or Image objects to be passed in

			if(typeof settings === "string" || settings instanceof Image && settings.src)
			{
				this._spritesheet = new Fizz.Spritesheet({
					source: settings,
				});

				settings = null;
			}

			// Otherwise, assume that the user has passed in an actual settings object
			if(null !== settings && typeof settings === "object")
			{

				//@TODO Is this step necessary? It will be re-cached...
				if('scale' in settings && settings.scale instanceof Fizz.Point)
				{
					// Triggers re-caching

					this.scaleX = settings.scale.x;
					this.scaleY = settings.scale.y;

					delete settings.scale;
				}

				// Copy over custom instance settings
				this.assign(settings);

			}

			// If a Spritesheet has been assigned to the Graphic, update the
			// Graphic's cache as soon as the Spritesheet data is available

			if(this._spritesheet)
			{
				if(this._spritesheet.loaded)
				{
					this.updateCache();
				}
				else
				{
					this._spritesheet.on('load', this.updateCache.bind(this));
				}
			}

		},

		updateCache: function() {

			// There is nothing to cache if the Spritesheet has no image data
			if(null === this._spritesheet || false === this._spritesheet.loaded) {

				// Just draw the Graphic's bounding box until bitmap data is ready
				//@TODO Behavior should depend on environment setting (dev/test/alpha)
				Fizz.DisplayEntity.prototype.updateCache.call(this);

				return;

			}

			var cachedTexture = null;

			// If a version of the current texture doesn't exist in the local cache
			if(!(this._texture in this._localTexturesCache)) {

				// Get a reference to the Spritesheet's native-sized texture cache,
				// assigning the reference to the local texture cache and assigning
				// the Graphic a native scale

				cachedTexture = this._spritesheet.getFrame(this._texture);
				cachedTexture.scale = Fizz.Graphic.NATIVE_SCALE.clone();

				this._localTexturesCache[this._texture] = cachedTexture;
				this._size = new Fizz.Point(cachedTexture.width, cachedTexture.height);

			}

			// If the current cached texture reference is 'dirty', re-assign it
			// to a newly scaled canvas copy (here we can assume that a local cache is present)
			if(false === this.scale.equals(this._localTexturesCache[this._texture].scale)) {

				// The new cache still needs to be scaled relative to its native size
				var wrapper = new Fizz.Canvas(this._spritesheet.getFrame(this._texture));

				cachedTexture = wrapper.scale.call(wrapper, this.scale.x, this.scale.y, true);
				cachedTexture.scale = this._scale.clone();

				this._localTexturesCache[this._texture] = cachedTexture;

			}

			// Finally, update this._cacheCanvas and this._cacheCanvasContext,
			// on which the DisplayEntity's 'draw' method is dependent
			this._cacheCanvas = this._localTexturesCache[this._texture];
			this._cacheCanvasContext = this._cacheCanvas.getContext('2d');

			// Post-processing of cached bitmap data (alpha, filters, etc)
			//@TODO Implement some generic image filters and add filters list
			// to DisplayEntity class

		},

		copy: function(graphic) {
			Fizz.DisplayEntity.prototype.copy.call(this, graphic);
			if(graphic instanceof Fizz.Graphic) {
				// Local textures cache can easily be regenerated
				this._spritesheet = graphic.spritesheet;
				this._texture = graphic.texture;
			}
		},

		clone: function() {
			var clone = new Fizz.Graphic();
			clone.copy(this);
			return clone;
		},

		toString: function() {
			return String.format("[Graphic (name='{0}')]", this.name);
		},

	});

	// Static class members

	Graphic.DEFAULT_TEXTURE = 0;

	Graphic.NATIVE_SCALE = new Fizz.Point(1,1);

	// Public properties

	Graphic.prototype.exposeProperty("spritesheet", "_spritesheet",
		Fizz.restrict.toInstanceType("_spritesheet", "Fizz.Spritesheet"));

	Graphic.prototype.exposeProperty("texture", "_texture",
		Fizz.restrict.toRange("_texture", [0, Infinity]));

	// Class export
	Fizz.Graphic = Graphic;

	Fizz.logger.filter('dev').log("Loaded module 'Graphic'.");

}());