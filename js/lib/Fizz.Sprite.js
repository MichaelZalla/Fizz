// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var Sprite = Fizz.Graphic.extend({

		init: function(settings) {

			Fizz.Graphic.prototype.init.call(this, settings, false);

			this._currentAnimation = Sprite.DEFAULT_ANIMATION;
			this._texture = this._currentAnimation.begin;
			this._paused = true;

			this._timeUntilTransition = 0;

			// Allow animation to be specified at creation for pre-caching
			if(null !== settings && typeof settings === "object") {
				if('animation' in settings && typeof settings.animation === "string") {
					this.gotoAndPlay(settings.animation);
					delete settings.animation;
				}
			}

		},

		update: function(deltaT) {
			Fizz.Graphic.prototype.update.call(this, deltaT);
			if(false === this._paused && this._currentAnimation.begin < this._currentAnimation.end) {
				//@TODO Implement speed variable in animation objects
				// this._advanceFrame();
				if(this._timeUntilTransition <= 0) {
					this._advanceFrame();
					this._timeUntilTransition = parseInt(1000 / this._currentAnimation.speed);
				} else {
					this._timeUntilTransition -= deltaT;
				}
			}
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
			Fizz.Graphic.prototype.copy.call(this, sprite);
			if(sprite instanceof Fizz.Sprite) {
				this._currentAnimation = sprite.currentAnimation;
				this._paused = sprite.paused;
			}
		},

		clone: function() {
			var clone = new Fizz.Sprite();
			clone.copy(this);
			return clone;
		},

		toString: function() {
			return String.format("[Sprite (name='{0}')]", this.name);
		},

		// Private methods

		_goto: function(frameIndex) {
			if(typeof frameIndex === "string") {
				// Passed in the name of an animation
				var data = this._spritesheet.getAnimation(frameIndex);
				this._currentAnimation = (data !== null) ? data : this._currentAnimation;
				this._texture = this._currentAnimation.begin;
			} else {
				// Passed in the index of a frame (integer)
				this._currentAnimation = Sprite.DEFAULT_ANIMATION;
				this._texture = frameIndex;
			}
		},

		_advanceFrame: function() {
			var a = this._currentAnimation;
			if(this._texture === a.end && a.next) {
				// Jump to a different animation (possibly a loop)
				this._currentAnimation = this._spritesheet.getAnimation(a.next);
				this._texture = this._currentAnimation.begin;
			} else if(this._texture === a.end) {
				// Reset animation (loop) if Sprite is not paused
				this._texture = a.begin;
			} else {
				// Advance a single frame
				this._texture += 1;
			}
		}

	});

	// Static class members
	
	Sprite.DEFAULT_ANIMATION = { begin: 0, end: 0, next: null };

	// Public properties

	Sprite.prototype.exposeProperty("currentAnimation");
	Sprite.prototype.exposeProperty("paused");

	// Class export
	Fizz.Sprite = Sprite;

	Fizz.logger.filter('all').log("Loaded module 'Sprite'.");

}());