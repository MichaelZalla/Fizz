// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var DisplayEntity = Fizz.Entity.extend({
	
		init: function(settings, cacheOnCreation) {

			var args = [];
			if(typeof settings === "object" && settings !== null) {
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

			this._alpha = 1.0;

			// Relies on shared default Color instances until
			// otherwise specified (fine to assign primitives)

			this._fillStyle 	= DisplayEntity.BOUNDING_BOX_FILL_STYLE;
			this._strokeStyle 	= DisplayEntity.BOUNDING_BOX_STROKE_STYLE;
			this._lineWidth 	= DisplayEntity.BOUNDING_BOX_LINE_WIDTH;

			// Copy over custom object settings
			if(typeof settings === "object" && settings !== null) {
				this.assign(settings);
			}

			// Cache immediately if specified
			if(typeof cacheOnCreation === "boolean" && cacheOnCreation) {
				this.updateCache();
			}

		},

		update: function(deltaT) {
			Fizz.Entity.prototype.update.call(this, deltaT);
			//@TODO Fading on death shouldn't be part of the class definition
			//@TODO Migrate this elsewhere (maybe a particle class?)
			// this._fadeOnDeath = false;
			// this._fadeTime = 100;
			// if(this._fadeOnDeath && this._life < this._fadeTime + 1) {
			// 	if(this._life % 10 == 0) {
			// 		this._alpha -= 0.1;
			// 		this.updateCache();
			// 	}
			// }
		},

		draw__optimized: function(context) {

			//@TODO 'draw' method should RELY on cache, not vice-versa

			if(typeof context === "undefined") return false;
			if(false === this.exists || !this._isVisible()) return false;

			var pos = this._getGlobalPosition();

			// Nudge draw position for Retina screens
			if(this._snapToPixel) {
				pos.x = Math.floor(pos.x) + 0.5;
				pos.y = Math.floor(pos.y) + 0.5;
			}

			// We will rely on trigger to handle updating dirty caches
			// instead of checking for a dirty cache at draw time
			if(null === this._cacheCanvas || false === this._caching) {
				this.updateCache();
			}

			//@TODO constant save-restore may be unecessary work
			context.save();
			context.imageSmoothingEnabled =
			context.mozImageSmoothingEnabled =
			context.webkitImageSmoothingEnable = !(this._snapToPixel);
			context.drawImage(this._cacheCanvas, pos.x, pos.y);
			context.restore();

			//@TODO Create environment module for setting dev-mode flags
			// Post-render wireframe (for dev mode)

		},

		draw: function(ctx) {

			ctx.beginPath();
			ctx.rect(0.5, 0.5,
				this.width * Math.abs(this.scale.x),
				this.height * Math.abs(this.scale.y));
			ctx.closePath();
			
			ctx.fillStyle 	= this._fillStyle.toRGB(true);
			ctx.strokeStyle = this._strokeStyle.toRGB(true);
			ctx.lineWidth 	= this._lineWidth;
			
			ctx.fill();

		},

		updateCache: function() {

			// Prepare the cache canvas to reflect any changes to state
			if(null === this._cacheCanvas) {
				this._cacheCanvas = document.createElement("canvas");
				this._cacheCanvasContext = this._cacheCanvas.getContext("2d");
			}

			//@TODO Should changes to width/height trigger re-cache (like scale)
			if(!!(this.width !== this._cacheCanvas.width ||
				  this.height !== this._cacheCanvas.height)) {
				this._cacheCanvas.width = Math.floor(this.width * Math.abs(this.scale.x)) + 1;
				this._cacheCanvas.height = Math.floor(this.height * Math.abs(this.scale.y)) + 1;
			}

			//@TODO double-check correctness of half-pixel offsets
			this._cacheCanvasContext.clearRect(
				0.5,
				0.5,
				this.width * Math.abs(this.scale.x),
				this.height * Math.abs(this.scale.y)
			);

			this._cacheCanvasContext.globalAlpha = this._alpha;

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
			return "[DisplayEntity (name='" + this.name + "')]";
		},

		// Private methods

		_isVisible: function() {
			return !(0 === this.width * this.scale.x ||
					 0 === this.height * this.scale.y ||
					 0 === this._alpha || false === this.exists);
		}

	});

	// Static class members

	DisplayEntity.BOUNDING_BOX_FILL_STYLE = Fizz.Color.WHITE;
	DisplayEntity.BOUNDING_BOX_STROKE_STYLE = Fizz.Color.BLUE;
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
		function(value) {
			// Only re-cache if the alpha value really changes
			var tmp = this._alpha;
			Fizz.restrict.toRange("_alpha", [0, 1]).call(this, value);
			if(this._alpha !== tmp) this.updateCache();
		});

	// Public dynamic properties

	DisplayEntity.prototype.exposeProperty("visible",
		function() { return this._isVisible(); });

	// Class export
	Fizz.DisplayEntity = DisplayEntity;

}());