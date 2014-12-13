// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var Stage = Fizz.DisplayGroup.extend({
			
		init: function(context) {

			// Normalize context parameter

			if(0 === arguments.length) {
				
				// If no drawing context is specified, create a new canvas
				// element and assign it the default Stage dimensions
				
				context = window.document.createElement("canvas").getContext("2d");
				context.canvas.width = Stage.DEFAULT_DIMENSIONS.x;
				context.canvas.height = Stage.DEFAULT_DIMENSIONS.y;

			} else {
				
				// Also allows passing of canvas element as 'context'
				if(context instanceof HTMLCanvasElement)
					context = context.getContext("2d");
				
				if(!(context instanceof CanvasRenderingContext2D))
					throw new Error("Attempt was made to instantiate a Stage instance without a valid drawing context");
				
			}

			Fizz.DisplayGroup.prototype.init.call(this, null, false);

			this._canvasContext = context;
			this._canvas = this._canvasContext.canvas;
			this._canvasWrapper = null;

			if(this._canvas !== null) {

				// Create a new canvas wrapper for capturing events
				this._canvasWrapper = new Fizz.Canvas(this._canvas);

				// Make the wrapper a child of the Stage, for event bubbling
				this._canvasWrapper.parent = this;

				this._setDelegatedCanvasListeners();
			
			}

			this._width = (null !== this._canvas) ? this._canvas.width : null;
			this._height = (null !== this._canvas) ? this._canvas.height : null;

			this.name = "Stage";

		},

		draw: function() {

			if(null === this._canvas) return;

			this._canvasContext.save();
			this._canvasContext.clearRect(0, 0, this._canvas.width, this._canvas.height);

			// We never cache the Stage's display group
			this.children.forEach(function(c) {
				if(c instanceof Fizz.DisplayEntity) {
					c.draw__optimized(this._canvasContext);
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

		_setDelegatedCanvasListeners: function() {
			
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

					// If the event didn't originate from the canvas wrapper,
					// don't attempt to delegate it (infinite loop!)

					if(e.target !== this._canvasWrapper) return;

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
							
							// Map event's global space coordinate to local space
							var rect = new Fizz.Rectangle(context.globalPosition, context.size);
							if(rect.intersects(coordinate)) targets.push(context);
							return targets;

						}

						context.children.forEach(function(child) {
							targets = targets.concat(getMouseTargets(child));
						});

						return targets;

					}

					var targets = getMouseTargets(this);

					if(targets.length > 0) {
						var delegated = e.clone();
						e.stopImmediatePropagation();
						targets[0].emit(delegated);
					}

				});

			}, this);

		}

	});

	// Static class members

	Stage.DEFAULT_DIMENSIONS = new Fizz.Point(640, 480);

	Stage.EVENTS = { };

	// Public properties

	Stage.prototype.exposeProperty("canvas", "_canvasContext.canvas");

	// Overwriting dynamic 'width' and 'height' getter-setter pairs
	Stage.prototype.exposeProperty("width");
	Stage.prototype.exposeProperty("height");

	// Banished (protected) properties

	Stage.prototype.banishProperty("stage");
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