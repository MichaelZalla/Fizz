// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var Spritesheet = Fizz.EventEmitter.extend({

		init: function(settings) {
			
			this._loaded = false;

			this._source = null;
			this._sourceImage = null;
			this._sourceImageCache = null;
			this._sourceImageCacheContext = null;

			this._sourceWidth = 0;
			this._sourceHeight = 0;

			this._frames = [ ];
			this._framesCache = [ ];
			
			this._animations = { };

			// Register default event listeners
			this.on(Fizz.Spritesheet.EVENTS.LOAD, this._onImageLoad, false);
			this.on(Fizz.Spritesheet.EVENTS.ERROR, this._onImageError, false);

			// Allow URI or Image object to be passed (simple instantiation)
			if(typeof settings == "string" || settings instanceof Image && settings.src) {
				settings = { 'source': settings };
			}

			if(typeof settings == "object" && settings !== null) {
				
				if('source' in settings) {
					this.source = settings.source; // Will trigger onload
				}

				// Parse frame inputs

				if('frames' in settings) {
					
					var frames = settings.frames;
					
					this.on(Fizz.Spritesheet.EVENTS.LOAD, function(e) {
						
						// Non-literal frame notation
						if('width' in frames && 'height' in frames) {
						
							var x = 0, y = 0,
								w = frames.width,
								h = frames.height,
								count = frames['count'];

							// Compute count if no value was specified
							count = count || (this._sourceWidth / w) * (this._sourceHeight / h)

							for(var i = 0; i < count; i++) {
								if(x >= this._sourceWidth) {
									x = 0;
									y += h;
								}
								this._frames[i] = [x, y, w, h];
								x += w;
							}
						
						} else if(frames instanceof Array) {

							this._frames = frames.filter(function(data) {
								return (4 === data.length);
							});

						}

						// Shouldn't cache any frames until one is requested
						// this._frames.forEach(function(data, index) {
						// 	this._refreshFrameCache(index);
						// }, this);

					}, false);

					// Parse animation inputs
					
					if('animations' in settings) {

						var anims = settings.animations;

						this.on(Fizz.Spritesheet.EVENTS.LOAD, function(e) {
							
							anims.forEach(function(data, name) {
								if(data instanceof Array && data.length >= 2) {
									this._animations[name] = {
										begin: data[0],
										end: data[1],
										speed: data[2] || 1
									};
								}
							}, this);

						}, false);
					}

				}

			}

		},

		getFrame: function(index) {
			if(typeof index !== "number") index = 0;
			if(!(index in this._frames)) return null;
			if(!(index in this._framesCache)) {
				// window.console.log("Caching frame ", index);
				this._refreshFrameCache(index);
			}
			return this._framesCache[index];
		},

		getAnimation: function(name) {
			return this._animations[name] || null;
		},

		toString: function() {
			return "[Spritesheet (source='" + (this._source || 'null') + "')]";
		},

		// Private methods

		_onImageLoad: function() {
			
			this._loaded = true;
			this._sourceWidth = this._sourceImage.width;
			this._sourceHeight = this._sourceImage.height;
			this._refreshImageCache();
			
			// If an image was loaded but no frame regions were specified, generate
			// a single frame that is the spritesheet's full width and height
			// (The frame can be requested using getFrame(0))

			if(0 === this._frames.length) {
				this._frames.push([ 0, 0, this._sourceWidth, this._sourceHeight ]);
			}

		},

		_onImageError: function() {
			window.console.warn("Failed to load resource from'" + this._source + "'.");
		},

		_refreshImageCache: function() {
			if(null === this._sourceImageCache) {
				this._sourceImageCache = document.createElement('canvas');
			}
			this._sourceImageCache.width = this._sourceWidth;
			this._sourceImageCache.height = this._sourceHeight;
			this._sourceImageCacheContext = this._sourceImageCache.getContext('2d');
			this._sourceImageCacheContext.drawImage(this._sourceImage, 0, 0);
			this._framesCache = { }; // Reset frame caches
		},

		_refreshFrameCache: function(index) {
			var data = this._frames[index];
			if(data) {
				this._framesCache[index] = Fizz.image
					.spliceCanvasArea(this._sourceImageCache, data);
			}
		}
		
	});

	// Apply Fizz.EventEmitter interface to Fizz.Spritesheet class
	Fizz.EventEmitter.initialize(Spritesheet.prototype);

	// Static class members

	Spritesheet.EVENTS = { };
	Spritesheet.EVENTS.LOAD 	= 'load';
	Spritesheet.EVENTS.ERROR 	= 'error';

	// Public properties

	Spritesheet.prototype.exposeProperty("sourceWidth");
	Spritesheet.prototype.exposeProperty("sourceHeight");
	Spritesheet.prototype.exposeProperty("loaded");

	// Dynamic public properties

	// Notice that we attach onload listeners for automatic re-caching
	Spritesheet.prototype.exposeProperty("source", "_source",

		function(value) {

			if(typeof value == "string") {
				
				this._source = value;
				this._sourceImage = new Image();
				this._sourceImage.onload = this.emit.bind(this, 'load');
				this._sourceImage.onerror = this.emit.bind(this, 'error');
				this._sourceImage.src = this._source;

			} else if(value instanceof Image && value.src) {

				this._source = value.src;
				this._sourceImage = value;
				
				if(this._sourceImage.complete) {
					setTimeout(this.emit.bind(this, Fizz.Spritesheet.EVENTS.LOAD), 10);
				}
				else {
					this._sourceImage.onload = this.emit.bind(this, 'load');
					this._sourceImage.onerror = this.emit.bind(this, 'error');
				}
			}
		
		});

	// Class export
	Fizz.Spritesheet = Spritesheet;

}());