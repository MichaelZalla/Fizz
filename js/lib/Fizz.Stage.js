// Namespace
this.Fizz = this.Fizz || { };

//@TODOS
// - Implement Fizz.Grid class for easy sprite layouts
// - Implement Fizz.Type class on top of Fizz.Grid

(function() {

	var Stage = Fizz.DisplayGroup.extend({
			
		init: function(context, frameRate) {

			// Normalize context parameter
			if(0 === arguments.length) {
				// If no drawing context is specified, create a new canvas
				// element and assign it the default Stage dimensions
				context = window.document.createElement("canvas").getContext("2d");
				context.canvas.width = Stage.DEFAULT_DIMENSIONS.x;
				context.canvas.height = Stage.DEFAULT_DIMENSIONS.y;
			}

			if(!(context instanceof CanvasRenderingContext2D)) {
				throw new Error("Attempt was made to instantiate a Stage instance without a valid drawing context");
			}			

			if(typeof frameRate === "number" && frameRate > -1) {
				this._frameRate = frameRate;
			}

			Fizz.DisplayGroup.prototype.init.call(this, null, false);

			// The current context may not have a canvas
			// element associated with it just yet ...

			this._canvas = null;
			this._canvasContext = context;

			// Listen for changes to the Stage context's canvas reference
			this.on(Stage.EVENTS.CANVAS_CHANGED, this._onChangeContextCanvas);

			// Initial 'change' to canvas reference
			this.emit(Stage.EVENTS.CANVAS_CHANGED);

			this._width = (null !== this._canvas) ? this._canvas.width : null;
			this._height = (null !== this._canvas) ? this._canvas.height : null;

			this._rendering = false;
			this._lastRenderTime = 0;
			this._requestAnimationFrame = this._getRAFMethod();

			this._frameRate = Stage.DEFAULT_FRAME_RATE;
			this._logFrameRate = false;

			this.name = "Stage";
			this.render();

		},

		update: function(deltaT) {
			Fizz.DisplayGroup.prototype.update.call(this, deltaT);
			// The Stage's context was assigned a new/different canvas element
			if(this._canvasContext.canvas !== this._prevCanvas) {
				this.emit(Fizz.Stage.EVENTS.CANVAS_CHANGED);
			}
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

				var r_fn = function() { return render(+new Date()); }.bind(this);

				if(this._requestAnimationFrame !== window.setTimeout) {
					this._requestAnimationFrame.call(window, r_fn); //, this._canvas
				} else {
					this._requestAnimationFrame.call(window, r_fn, this._frameRate);
				}
					
			}.bind(this);

			render(this._lastRenderTime);

		},

		draw: function() {

			if(null === this._canvas) return;

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
			if(null === this._canvasContext.canvas) {
				return "[Stage (canvas='null')]";
			} else {
				return "[Stage (width='" + this._canvasContext.canvas.width +
							"', height='" + this._canvasContext.canvas.height + "')]";
			}
		},

		// Private methods

		_getRAFMethod: function() {

			return window.requestAnimationFrame ||
				   window.mozRequestAnimationFrame ||
				   window.webkitRequestAnimationFrame ||
				   window.msRequestAnimationFrame ||
				   window.setTimeout;

		},

		_onChangeContextCanvas: function() {

			this._canvas = this._prevCanvas = this._canvasContext.canvas || null;
			
			if(this._canvas !== null) {
				
				var canvasWrapper = new Fizz.Canvas(this._canvas);
				
				// Make the wrapper a child of the Stage (for event bubbling)
				canvasWrapper.parent = this;
				
				// Set up wrapper-to-stage listeners (the Stage's Canvas
				// instance will bubble its UI events up to the Stage, but
				// we still need to register listeners for events which could
				// be delegated to specific display targets
				
				var delegatedEvents = [
					Fizz.Canvas.EVENTS.CLICK,
					Fizz.Canvas.EVENTS.DBLCLICK,
					Fizz.Canvas.EVENTS.MOUSEUP,
					Fizz.Canvas.EVENTS.MOUSEDOWN,
					Fizz.Canvas.EVENTS.MOUSEMOVE
				];

				delegatedEvents.forEach(function(type) {
					
					this.on(type, function(e) {

						// If the event didn't originate from the canvasWrapper,
						// don't attempt to delegate it (infinite loop)

						if(e.target !== canvasWrapper) return;

						// When the Stage recieves (intercepts) an event that
						// could be delegated, check whether or not there is
						// a valid display target to delegate it to; if it
						// gets delegated, stop immediate propogation to avoid
						// multiple (and possible cyclic) triggering of listeners

						var coordinate = new Fizz.Point(e.mouseX, e.mouseY);

						function getMouseTargets(context) {
							
							var targets = [ ];

							// Base case (exit condition)
							if(typeof context.children === "undefined") {
								if(context.intersects(coordinate)) {
									targets.push(context);
								}
								return targets;
							}

							context.children.forEach(function(child) {
								targets = targets.concat(getMouseTargets(child));
							});

							return targets;

						}

						var targets = getMouseTargets(this);

						// console.log(targets);

						if(targets.length > 0) {
							var delegated = e.clone();
							e.stopImmediatePropagation();
							targets[0].emit(delegated);
						}

					});

				}, this);
			}
		}

	});

	// Static class members

	Stage.DEFAULT_DIMENSIONS = new Fizz.Point(600, 400);

	Stage.DEFAULT_FRAME_RATE = (1000 / 60); // 60 FPS

	Stage.EVENTS = { };

	Stage.EVENTS.CANVAS_CHANGED = 'canvaschanged';

	// Public properties

	Stage.prototype.exposeProperty("canvas", "_canvasContext.canvas");

	// Overriting dynamic 'width' and 'height' getter/setters
	Stage.prototype.exposeProperty("width");
	Stage.prototype.exposeProperty("height");
	
	Stage.prototype.exposeProperty("frameRate", "_frameRate",
		Fizz.restrict.toRange("_frameRate", [1, 999]));
	
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