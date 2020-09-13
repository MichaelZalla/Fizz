// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var Stage = Fizz.DisplayGroup.extend({

		init: function() {

			// Normalize constructor argument(s)

			var context;

			// Allow passing of canvas context
			if(arguments[0] instanceof CanvasRenderingContext2D)
			{
				context = arguments[0];
			}

			// Allow passing of canvas element instance
			else if(arguments[0] instanceof HTMLCanvasElement)
			{
				context = arguments[0].getContext("2d");
			}

			// Allow passing of canvas element ID
			else if(typeof arguments[0] === "string")
			{
				var canvasElement = window.document.getElementById(arguments[0].replace('#',''));

				if(canvasElement)
				{
					context = canvasElement.getContext("2d");
				}
			}

			else
			{

				// If no drawing context was determined, create a new canvas element
				// and assign it either custom or default dimensions depending on the input
				var width = (typeof arguments[0] === "number") ? width : Stage.DEFAULT_DIMENSIONS.x,
					height = (typeof arguments[1] === "number") ? height : Stage.DEFAULT_DIMENSIONS.y;

				context = window.document.createElement("canvas").getContext("2d");
				context.canvas.width = width;
				context.canvas.height = height;

			}

			Fizz.DisplayGroup.prototype.init.call(this, null, false);

			this._canvasContext = context;
			this._canvas = this._canvasContext.canvas;
			this._canvasWrapper = null;

			if(this._canvas !== null)
			{

				//@TODO If we choose to change units from pixels to something
				// else, then we'll need to compute a conversion here
				this._size.x = this._canvas.width;
				this._size.y = this._canvas.height;

				// Create a new canvas wrapper for capturing events
				this._canvasWrapper = new Fizz.Canvas(this._canvas);

				// Make the wrapper a child of the Stage, for event bubbling
				this._canvasWrapper.parent = this;

				this._setDelegatedCanvasListeners();

			}

			this.name = "Stage";

		},

		draw: function() {

			if(null === this._canvas) return;

			this._canvasContext.save();
			this._canvasContext.clearRect(0, 0, this._canvas.width, this._canvas.height);

			// We never cache the Stage's display group
			this.children.foreach(function(c) {
				if(c instanceof Fizz.DisplayEntity) {
					c.draw__optimized(this._canvasContext);
				}
			}, this);

			this._canvasContext.restore();

		},

		toString: function() {
			var canvas = this._canvasContext.canvas;
			if(null === canvas) {
				return "[Stage (canvas='null')]";
			} else {
				return String.format("[Stage (width='{0}', height='{1}')]",
					canvas.width, canvas.height);
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

			delegatedEvents.foreach(function(type) {

				this.on(type, function(e) {

					// If the event didn't originate from the canvas wrapper,
					// don't attempt to delegate it (infinite loop!)

					if(e.target !== this._canvasWrapper) return;

					// When the Stage recieves (intercepts) an event that
					// could be delegated, check whether or not there is
					// a valid display target to delegate it to; if it
					// gets delegated, stop immediate propogation to avoid
					// multiple (and possibly cyclic) triggering of listeners

					var coordinate = new Fizz.Point(e.mouseX, e.mouseY);

					var rect = new Fizz.Rectangle();

					//@TODO Maybe Entities should be given a 'pointerEvents' flag
					// so they can pass on mouse events, delegating them to entities
					// 'below' them in z-space

					function getMouseTargets(container) {

						var targets = [ ];

						// Base case (exit condition)
						if(typeof container.children === "undefined") {

							// Map event's global space coordinate to local space
							// var rect = new Fizz.Rectangle(container.globalPosition, container.size);
							rect.position = container.globalPosition;
							rect.size = container.size;

							if(rect.intersects(coordinate)) targets.push(container);
							return targets;

						}

						container.children.foreach(function(child) {
							targets.push.apply(targets, getMouseTargets(child));
						});

						return targets;

					}

					var targets = getMouseTargets(this);

					if(targets.length > 0) {
						//@TODO Is there a way to recycle the existing Event
						// instance to avoid instantiating a new copy?
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

	// Make 'alpha' a read-only property
	Stage.prototype.banishProperty("alpha");

	// Overwriting dynamic 'width' and 'height' properties
	Stage.prototype.exposeProperty("width", "_canvas.width");
	Stage.prototype.exposeProperty("height", "_canvas.height");

	// Banished (protected) properties
	Stage.prototype.banishProperty("stage");
	Stage.prototype.banishProperty("exists");
	Stage.prototype.banishProperty("life");
	Stage.prototype.banishProperty("scale");
	Stage.prototype.banishProperty("velocity");
	Stage.prototype.banishProperty("acceleration");

	// Stage export
	Fizz.Stage = Stage;

	Fizz.logger.filter('dev').log("Loaded module 'Stage'.");

}());