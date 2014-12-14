// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var RAFRenderer = Object.extend({

		init: function(stage, framerate, logFPS) {

			this._stage = null;
			this._framerate = RAFRenderer.DEFAULT_FRAME_RATE;
			this._actualFramerate = 0;
			this._logFPS = false;
			this._rendering = false;
			this._lastRenderTime = 0;
			this._RAFCallbackHandle = null;

			this.stage = stage;
			this.framerate = framerate;
			this.logFPS = logFPS;

		},

		startRendering: function() {

			if(this._rendering || null === this._stage) return;
			
			this._rendering = true;
			this._lastRenderTime = +new Date();

			var RAFMethod = this._getRAFMethod();

			// Recursive 'render' callback function (binds 'this')
			var render = function(now) {

				this._actualFramerate = now - this._lastRenderTime;

				if(this._logFPS && 0 === (now & (64 - 1))) {
					console.log(
						"Rendering at",
						(1000 / this._actualFramerate).toFixed(2),
						"frames per second"
					);
				}

				this._stage.draw();

				// Update the last render time to the present

				this._lastRenderTime = now;

				// We'll need to pass a callback wrapper that returns
				// a time-sensitive invocation of the 'render' callback

				var callback_wrapper = (function() { 	//domHighResTimeStamp
					render.call(this, +new Date());				
				}).bind(this);

				this._RAFCallbackHandle = RAFMethod.call(
					window,
					callback_wrapper,
					this._framerate // Won't be required by actual RAF methods
				);
					
			}.bind(this);

			render(this._lastRenderTime);

		},

		stopRendering: function() {

			if(!this._rendering) return;

			this._rendering = false;

			var cancelAnimationFrame = this._getCAFMethod();
				cancelAnimationFrame(this._RAFCallbackHandle);

		},

		// Private methods

		_getRAFMethod: function() {

			return window.requestAnimationFrame ||
				   window.mozRequestAnimationFrame ||
				   window.webkitRequestAnimationFrame ||
				   window.msRequestAnimationFrame ||
				   window.setTimeout;

		},

		_getCAFMethod: function() {

			return window.cancelAnimationFrame ||
				   window.mozCancelAnimationFrame ||
				   window.webkitCancelAnimationFrame ||
				   window.msCancelAnimationFrame ||
				   window.clearTimeout;

		}

	});

	// Static class members

	RAFRenderer.DEFAULT_FRAME_RATE = (1000 / 60); // 60fps

	// Public properties

	RAFRenderer.prototype.exposeProperty("rendering");
	RAFRenderer.prototype.exposeProperty("actualFramerate");

	RAFRenderer.prototype.exposeProperty("stage", "_stage",
		Fizz.restrict.toInstanceType("_stage", "Fizz.Stage"));

	RAFRenderer.prototype.exposeProperty("framerate", "_framerate",
		Fizz.restrict.toRange("_framerate", [10, Infinity]));
	
	RAFRenderer.prototype.exposeProperty("logFPS", "_logFPS",
		Fizz.restrict.toBoolean("_logFPS"));

	// Class export
	Fizz.RAFRenderer = RAFRenderer;

}());