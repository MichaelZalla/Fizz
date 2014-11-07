// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var Sprite = Fizz.DisplayEntity.extend({

		init: function(settings) {

			// Call to cache may can be triggered inside of super-init method
			Fizz.DisplayEntity.prototype.init.call(this, null, false);

			this._fillStyle = Fizz.Color.CLEAR;
			this._strokeStyle = Fizz.Color.CYAN;
			this._lineWidth = 2;

			this._spritesheet = null;

			this._localFramesCache = { };

			this._currentAnimation = Sprite.DEFAULT_ANIMATION;
			this._currentFrame = this._currentAnimation.begin;

			this._paused = true;

			// Allow existing Spritesheet instances to be passed in
			//@TODO Clean up code redundancies
			if(settings instanceof Fizz.Spritesheet) {
				this._spritesheet = settings;
				settings = null;
			}

			// Allow URI or Image object to be passed instead of a Spritesheet instance
			if(typeof settings == "string" || settings instanceof Image && settings.src) {
				this._spritesheet = new Fizz.Spritesheet({ 'source': settings });
				settings = null;
			}

			// If a Spritesheet has been assigned already, update the Sprite
			// cache as soon as the spritesheet data is available
			if(this._spritesheet) {
				if(this._spritesheet.loaded) this.updateCache();
				else this._spritesheet.on('load', this.updateCache.bind(this));
			}

			// Otherwise, assume that the user just passed in a config object
			if(typeof settings == "object" && settings !== null) {
				// Copy over custom object settings
				this.assign(settings);
			}

		},

		update: function(deltaT) {

			Fizz.DisplayEntity.prototype.update.call(this, deltaT);

			if(false === this._paused &&
			   this._currentAnimation.begin < this._currentAnimation.end) {
				//@TODO Shouldn't this depend on the 'speed' value?
				this._advanceFrame();
			}

		},

		updateCache: function() {

			// Nothing more to render if the Sprite has no image data
			if(null === this._spritesheet || false === this._spritesheet.loaded) {
				// Draw bounding box until bitmap data is available
				//@TODO Behavior should depend on env setting (dev/test/alpha)
				Fizz.DisplayEntity.prototype.updateCache.call(this);
				return;
			}

			// If a version of the current frame doesn't exist in the local cache
			if(!(this._currentFrame in this._localFramesCache)) {
				
				// console.log("Fetching native sprite cache for frame " + this._currentFrame + "!");

				// Get a reference to the spritesheet's native-sized frame cache,
				// adding it to the local cache and assigning it a native scale value
				this._localFramesCache[this._currentFrame] = this._spritesheet.getFrame(this._currentFrame);
				this._localFramesCache[this._currentFrame].scale = Sprite.NATIVE_SCALE.clone();
			}

			// Width and height values are assigned based on the frame dimensions
			//@TODO Should width and height really incr/decr as scale changes?
			// this.width = canvas.width;
			// this.height = canvas.height;

			// If the current cached frame is dirty, re-assign it to a scaled copy
			
			if(false === this.scale.equals(this._localFramesCache[this._currentFrame].scale)) {

				// console.log("Updating dirty sprite cache for frame " + this._currentFrame + "!");

				// New cache still needs to be scaled relative to the native size
				var nativeCacheFrame = this._spritesheet.getFrame(this._currentFrame);

				var scaled = document.createElement('canvas');
					scaled.width = Math.abs(nativeCacheFrame.width * this._scale.x);
					scaled.height = Math.abs(nativeCacheFrame.height * this._scale.y);
				
				console.log(scaled.width, scaled.height);

				// Record the scale at which the frame was cached
				scaled.scale = this.scale.clone();

				var pointOfReflection = new Fizz.Point((this._scale.x < 0) ? this.width : 0,
													   (this._scale.y < 0) ? this.height : 0);

				var ctx = scaled.getContext('2d');
				
				// Nearest-neighbor sampling for scaling
				ctx.imageSmoothingEnabled =
				ctx.mozImageSmoothingEnabled =
				ctx.webkitImageSmoothingEnable = false;

				ctx.save(); // Save original ctx transform data to stack

				// Transform the context to account for scale, and draw
				ctx.translate.apply(ctx, pointOfReflection.toList());
				ctx.scale(this._scale.x, this._scale.y);			
				ctx.drawImage(nativeCacheFrame, 0, 0);
				
				ctx.restore(); // Restore original ctx transform data

				// Update the cache reference to the scaled canvas
				
				this._localFramesCache[this._currentFrame] = scaled;

			}

			// Finally, update this._cacheCanvas and this._cacheCanvasContext,
			// which are referenced in the DisplayEntity's 'draw' method

			this._cacheCanvas = this._localFramesCache[this._currentFrame];
			this._cacheCanvasContext = this._cacheCanvas.getContext('2d');

			// Output for testing
			// window.document.body.appendChild(this._cacheCanvas)

			// Post-processing of cache data (account for alpha, etc)
			// @TODO Implement and utilize a generic image-filtering class

		},

		play: function() {
			this._paused = false;
		},

		stop: function() {
			this._paused = true;
		},

		gotoAndPlay: function(frameOrAnimation) {
			this._goto(frameOrAnimation);
			this.updateCache();
			this.play();
		},

		gotoAndStop: function(frameOrAnimation) {
			this._goto(frameOrAnimation);
			this.updateCache();
			this.stop();
		},

		copy: function(sprite) {
			Fizz.DisplayEntity.prototype.copy.call(this, sprite);
			if(sprite instanceof Fizz.Sprite) {
				this._spritesheet = sprite.spritesheet;
				//@TODO Is this breaking convention with the rest of the engine?
				this._paused = sprite._paused;
				this._currentAnimation = sprite._currentAnimation;
				this._currentFrame = sprite._currentFrame;
			}
		},

		clone: function() {
			var clone = new Fizz.Sprite();
			clone.copy(this);
			return clone;
		},

		toString: function() {
			return "[Sprite (name='" + this.name + "')]";
		},

		// Private methods

		_goto: function(frameIndex) {
			if(typeof frameIndex == "string") {
				// Passed in the name of an animation
				this._currentAnimation = this._spritesheet.getAnimation(frameIndex);
				//this._currentFrame = ...
			} else {
				// Passed in the index of a frame (integer)
				this._currentAnimation = Sprite.DEFAULT_ANIMATION;
				this._currentFrame = frameIndex;
			}
		},

		_advanceFrame: function() {
			var a = this._currentAnimation;
			if(this._currentFrame == a.end && a.next) {
				// Jump to a different animation (possibly a loop)
				this._currentAnimation = this._spritesheet.getAnimation(a.next);
				this._currentFrame = this._currentAnimation.begin;
			} else if(this._currentFrame == a.end) {
				// Reset animation (loop) if Sprite is not paused
				this._currentFrame = a.begin;
			} else {
				// Advance a single frame
				this._currentFrame += 1;
			}
		}

	});

	// Static class members
	
	Sprite.NATIVE_SCALE = new Fizz.Point(1,1);

	Sprite.DEFAULT_ANIMATION = { begin: 0, end: 0, next: null };

	// Public properties

	Sprite.prototype.exposeProperty("paused");

	Sprite.prototype.exposeProperty("spritesheet", "_spritesheet",
		Fizz.restrict.toInstanceType("_spritesheet", "Fizz.Spritesheet"));

	// Class export
	Fizz.Sprite = Sprite;

}());