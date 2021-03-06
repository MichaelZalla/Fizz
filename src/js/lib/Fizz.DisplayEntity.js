// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var DisplayEntity = Fizz.Entity.extend({

		init: function(settings) {

			var args = [];

			if(typeof settings === "object" && settings !== null)
			{
				args = [
					settings.position,
					settings.size
				];

				delete settings.position;
				delete settings.size;
			}

			Fizz.Entity.prototype.init.apply(this, args);

			this._caching = false;
			this._snapToPixel = false;
			this._cacheCanvas = null;
			this._cacheCanvasContext = null;

			this._alpha = 1;

			// Relies on shared default Color instances until
			// otherwise specified (fine to assign primitives)

			this._fillStyle = DisplayEntity.BOUNDING_BOX_FILL_STYLE;
			this._strokeStyle = DisplayEntity.BOUNDING_BOX_STROKE_STYLE;
			this._lineWidth = DisplayEntity.BOUNDING_BOX_LINE_WIDTH;

			// Copy over custom object settings
			if(typeof settings === "object" && settings !== null)
			{
				this.assign(settings);
			}

		},

		draw__optimized: function(context) {

			//@TODO 'draw' method should rely on 'cache' method, not vice-versa

			if(typeof context === "undefined") return false;
			if(false === this.exists) return false;

			var pos = this._getGlobalPosition();

			// Nudge draw position (for Retina screens)
			if(this._snapToPixel) {
				pos.x = Math.floor(pos.x); // + 0.5;
				pos.y = Math.floor(pos.y); // + 0.5;
			}

			if(this._isVisible()) {

				//@TODO Update this...
				// We will rely on trigger to handle updating dirty caches
				// instead of checking for a dirty cache at draw time
				if(null === this._cacheCanvas || false === this._caching) {
					this.updateCache();
				}

				context.globalAlpha = this._getGlobalAlpha();

				context.imageSmoothingEnabled =
				context.mozImageSmoothingEnabled =
				context.webkitImageSmoothingEnable = !(this._snapToPixel);

				context.drawImage(this._cacheCanvas, pos.x, pos.y);

			}

			// Post-render wireframe for dev mode
			if(Fizz.getEnv() === 'dev') {

				context.globalAlpha = 1;

				context.beginPath();
				context.rect(pos.x + 0.5, pos.y + 0.5, this.width, this.height);
				context.closePath();

				context.strokeStyle = this._strokeStyle.toRGB(true);
				context.lineWidth 	= this._lineWidth;
				context.stroke();

			}

		},

		draw: function(context) {

			context.beginPath();

			// Fill in the boundaries of the Entity
			context.rect(0.5, 0.5,
				this.width * Math.abs(this.scale.x) - 1,
				this.height * Math.abs(this.scale.y) - 1);

			context.closePath();

			context.fillStyle = this._fillStyle.toRGB(true);
			context.fill();

		},

		updateCache: function() {

			// Prepare the cache canvas to reflect any changes to state
			if(null === this._cacheCanvas) {
				this._cacheCanvas = document.createElement("canvas");
				this._cacheCanvasContext = this._cacheCanvas.getContext("2d");
			}

			if(!!(this.width !== this._cacheCanvas.width ||
				  this.height !== this._cacheCanvas.height)) {
				this._cacheCanvas.width = Math.floor(this.width) + 1;
				this._cacheCanvas.height = Math.floor(this.height) + 1;
			}

			//@TODO double-check correctness of half-pixel offsets
			this._cacheCanvasContext.clearRect(0.5, 0.5, this.width, this.height);

			this._cacheCanvasContext.save();

			this.draw(this._cacheCanvasContext);

			this._cacheCanvasContext.restore();

		},

		copy: function(entity) {

			Fizz.Entity.prototype.copy.call(this, entity);

			if(entity instanceof Fizz.DisplayEntity) {

				this.alpha = entity.alpha;
				this.lineWidth = entity.lineWidth;

				// Preserve references to (static) default Colors if possible
				if(entity.fillStyle !== Fizz.DisplayEntity.DEFAULT_FILL_STYLE)
					this.fillStyle = (new Fizz.Color()).copy(entity.fillStyle);
				if(entity.strokeStyle !== Fizz.DisplayEntity.DEFAULT_STROKE_STYLE)
					this.strokeStyle = (new Fizz.Color()).copy(entity.strokeStyle);

				var cacheCopy = document.createElement("canvas");
					cacheCopy.width = entity.width + 1;
					cacheCopy.height = entity.height + 1;

				var cacheCopyWrapper = new Fizz.Canvas(cacheCopy);

				this._cacheCanvas = cacheCopyWrapper.splice();

				// Decorate canvas element with scale data
				this._cacheCanvas.scale = this.scale.clone();
				this._cacheCanvasContext = this._cacheCanvas.getContext("2d");

			}

		},

		clone: function() {
			var clone = new Fizz.DisplayEntity();
			clone.copy(this);
			return clone;
		},

		toString: function() {
			return String.format("[DisplayEntity (name='{0}')]", this.name);
		},

		// Private methods

		_getGlobalAlpha: function() {
			if(null === this.parent) { return this._alpha; }
			return this._alpha * this.parent._getGlobalAlpha();
		},

		_isVisible: function() {
			if(false === this.exists) { return false; }
			if(0 === this._alpha) 	  { return false; }
			if(0 === this.width) 	  { return false; }
			if(0 === this.height) 	  { return false; }
			if(0 === this.scale.x) 	  { return false; }
			if(0 === this.scale.y) 	  { return false; }
			return true;
		}

	});

	// Static class members

	DisplayEntity.BOUNDING_BOX_FILL_STYLE = Fizz.Color.WHITE;
	DisplayEntity.BOUNDING_BOX_STROKE_STYLE = Fizz.Color.YELLOW;
	DisplayEntity.BOUNDING_BOX_LINE_WIDTH = 1;

	DisplayEntity.EVENTS = { };

	// Public properties

	DisplayEntity.prototype.exposeProperty("fillStyle", "_fillStyle",
		Fizz.restrict.toInstanceType("_fillStyle", "Fizz.Color"));

	DisplayEntity.prototype.exposeProperty("strokeStyle", "_strokeStyle",
		Fizz.restrict.toInstanceType("_strokeStyle", "Fizz.Color"));

	DisplayEntity.prototype.exposeProperty("lineWidth", "_lineWidth",
		Fizz.restrict.toRange("_lineWidth", [0, 999]));

	DisplayEntity.prototype.exposeProperty("caching", "_caching",
		Fizz.restrict.toBoolean("_caching"));

	DisplayEntity.prototype.exposeProperty("snapToPixel", "_snapToPixel",
		Fizz.restrict.toBoolean("_snapToPixel"));

	// Setters that trigger the creation of a new local cache (canvas)

	DisplayEntity.prototype.exposeProperty("scale", "_scale",
		function(value) {
			if(value instanceof Fizz.Point) {
				this._scale = value;
				this.updateCache();
			}
		});

	DisplayEntity.prototype.exposeProperty("scaleX", "_scale.x",
		function(value) {
			if(typeof value === "number" && value !== this._scale.x) {
				this._scale.x = value;
				this.updateCache();
			}
		});

	DisplayEntity.prototype.exposeProperty("scaleY", "_scale.y",
		function(value) {
			if(typeof value === "number" && value !== this._scale.y) {
				this._scale.y = value;
				this.updateCache();
			}
		});

	DisplayEntity.prototype.exposeProperty("alpha", "_alpha",
		Fizz.restrict.toRange("_alpha", [0, 1]));

	// Public dynamic properties

	DisplayEntity.prototype.exposeProperty("visible",
		function() { return this._isVisible(); });

	// Class export
	Fizz.DisplayEntity = DisplayEntity;

	Fizz.logger.filter('dev').log("Loaded module 'DisplayEntity'.");

}());