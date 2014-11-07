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

		updateCache: function() {

			if(null === this._cacheCanvas) {
				this._cacheCanvas = document.createElement("canvas");
				this._cacheCanvasContext = this._cacheCanvas.getContext("2d");
			}

			if(!!(this.width !== this._cacheCanvas.width ||
				  this.height !== this._cacheCanvas.height)) {
				this._cacheCanvas.width = Math.floor(this.width * Math.abs(this.scale.x)) + 1;
				this._cacheCanvas.height = Math.floor(this.height * Math.abs(this.scale.y)) + 1;
			}

			var context = this._cacheCanvasContext,
				boundingBoxData = [0.5, 0.5, this.width * Math.abs(this.scale.x), this.height * Math.abs(this.scale.y)];

			// Reset the canvas and re-draw the bounding box
			context.clearRect(0, 0, this.width + 1, this.height + 1);
			context.globalAlpha = this._alpha;
			this._drawBoundingBox(context, boundingBoxData);
			
		},

		draw: function(context) {

			if(typeof context === "undefined") return false;
			if(false === this.exists || !this._isVisible()) return false;

			var global = this._getGlobalPosition();

			if(this._snapToPixel) {
				global.x = Math.floor(global.x) + 0.5;
				global.y = Math.floor(global.y) + 0.5;
			}

			context.save();

			context.imageSmoothingEnabled =
			context.mozImageSmoothingEnabled =
			context.webkitImageSmoothingEnable = !(this._snapToPixel);

			if(null === this._cacheCanvas || false === this._caching) {
				this.updateCache();
			}

			context.drawImage(this._cacheCanvas, global.x + 0.5, global.y + 0.5);

			// Post-render wireframe (for dev mode)
			
			var data = [
				this._position.x,
				this._position.y,
				this.width * Math.abs(this.scale.x),
				this.height * Math.abs(this.scale.y)
			];
			
			context.imageSmoothingEnabled =
			context.mozImageSmoothingEnabled =
			context.webkitImageSmoothingEnable = false;

			context.beginPath();
			context.rect.apply(context, data);
			context.closePath();
			
			context.strokeStyle = this._strokeStyle.toRGB(true);
			context.lineWidth 	= this._lineWidth;
			context.stroke();

			context.restore();

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
			
				//@TODO Logic for _cacheCanvas copying

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
		},

		_drawBoundingBox: function(context, data) {
			
			context.beginPath();
			context.rect.apply(context, data);
			context.closePath();
			
			context.fillStyle 	= this._fillStyle.toRGB(true);
			context.strokeStyle = this._strokeStyle.toRGB(true);
			context.lineWidth 	= this._lineWidth;
			
			context.fill();
			context.stroke();
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
			if(typeof value === "number") {
				this._scale.x = value;
				this.updateCache();
			}
		});

	DisplayEntity.prototype.exposeProperty("scaleY", "_scale.y",
		function(value) {
			if(typeof value === "number") {
				this._scale.y = value;
				this.updateCache();
			}
		});

	DisplayEntity.prototype.exposeProperty("alpha", "_alpha",
		function(value) {
			var tmp = this._alpha;
			Fizz.restrict.toRange("_alpha", [0, 1]).call(this, value);
			// Only re-cache if the alpha value really changes
			if(this._alpha !== tmp) this.updateCache();
		});

	// Public dynamic properties

	DisplayEntity.prototype.exposeProperty("visible",
		function() { return this._isVisible(); });

	// Class export
	Fizz.DisplayEntity = DisplayEntity;

}());