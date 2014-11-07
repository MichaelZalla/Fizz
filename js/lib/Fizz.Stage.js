// Namespace
this.Fizz = this.Fizz || { };

(function() {

	//@TODO
	// 1. Implement _registerExternalListeners
	// 2. Implement basic recursive-traveral algorithm for _getPointerTarget
	// 3. Implement Fizz.Grid class for easy sprite layouts
	// 4. Implement Fizz.Type class on top of Fizz.Grid

	var Stage = Fizz.DisplayGroup.extend({
			
		init: function(canvas, frameRate) {

			// Normalize canvas parameter
			if(0 === arguments.length) {
				canvas = window.document.creteElement("canvas");
			} else if(canvas && canvas.nodeName !== "CANVAS") {
				if(typeof canvas === "string") {
					canvas = window.document.getElementById(canvas);
				}
				if(null === canvas) {
					throw new Error("Attempt was made to instantiate a Stage instance without a valid canvas reference");
				}
			}

			if(typeof frameRate === "number" && frameRate) {
				this._frameRate = frameRate;
			}

			Fizz.DisplayGroup.prototype.init.call(this, null, false);

			this._canvas = canvas;
			this._canvasContext = this._canvas.getContext('2d');

			this._width = this._canvas.width;
			this._height = this._canvas.height;

			this._rendering = false;
			this._lastRenderTime = 0;
			this._requestAnimationFrame = this._getRAFMethod();

			this._frameRate = Stage.DEFAULT_FRAME_RATE;
			this._logFrameRate = false;

			// Set up external event listeners
			this._registerExternalListeners();

			this.render();

		},

		update: function(deltaT) {

			Fizz.DisplayGroup.prototype.update.call(this, deltaT);

		},

		render: function() {

			this._lastRenderTime = +new Date();

			var render = function(now) {

				if(this._logFrameRate && 0 === (now & (64 - 1))) {
					var fps = 1000 / (now - this._lastRenderTime);
					console.log("Rendering at ", fps.toString(), "FPS");
				}

				this.draw();

				this._lastRenderTime = now;

				// var r_fn = render.bind(this, now);
				var r_fn = function() { return render(+new Date()); }.bind(this);

				if(this._requestAnimationFrame !== window.setTimeout) {
					this._requestAnimationFrame.call(window, r_fn, this._canvas);
				} else {
					this._requestAnimationFrame.call(window, r_fn, this._frameRate);
				}

			}.bind(this);

			render(this._lastRenderTime);

		},

		draw: function() {

			//@TODO Performance hit
			this._canvasContext.clearRect(0, 0, this._canvas.width, this._canvas.height);
			this._canvasContext.save();

			// We never cache the Stage's display group
			// Fizz.DisplayGroup.prototype.draw.call(this, this._canvasContext);

			this.children.forEach(function(c) {
				if(c instanceof Fizz.DisplayEntity) {
					c.draw(this._canvasContext);
				}
			}, this);

			this._canvasContext.restore();

		},

		toString: function() {
			return "[Stage (width='" + this._width + "', height='" + this._height + "')]";
		},

		// Private methods

		_getRAFMethod: function() {

			return window.requestAnimationFrame ||
				   window.mozRequestAnimationFrame ||
				   window.webkitRequestAnimationFrame ||
				   window.msRequestAnimationFrame ||
				   window.setTimeout;

		},

		_registerExternalListeners: function() {

			// Listen for events on the window/document and
			// simulate inside of the canvas when appropriate
			// ...

		}

	});

	// Static class members

	Stage.DEFAULT_FRAME_RATE = (1000 / 60); // 60 FPS

	Stage.EVENTS = { };

	Stage.EVENTS.KEYDOWN = 'keyDown';

	// Public properties

	Stage.prototype.exposeProperty("frameRate");
	
	// Overriting dynamic 'width' and 'height' properties
	Stage.prototype.exposeProperty("width");
	Stage.prototype.exposeProperty("height");
	
	Stage.prototype.exposeProperty("logFrameRate", "_logFrameRate",
		Fizz.restrict.toBoolean("_logFrameRate"));

	// Banished (protected) properties

	Stage.prototype.banishProperty("parent");
	Stage.prototype.banishProperty("exists");
	Stage.prototype.banishProperty("life");
	Stage.prototype.banishProperty("scale");
	Stage.prototype.banishProperty("velocity");
	Stage.prototype.banishProperty("acceleration");
	Stage.prototype.banishProperty("density");
	Stage.prototype.banishProperty("alpha");

	// Stage export
	Fizz.Stage = Stage;

}());