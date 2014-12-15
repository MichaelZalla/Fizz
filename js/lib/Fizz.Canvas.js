// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var Canvas = Object.extend({

		init: function(element) {

			// Safely assign or ignore value of 'element'
			this._DOMElement = document.createElement("canvas");
			this._DOMElementListeners = [ ];
			this.element = element;

		},

		scale: function(scaleX, scaleY, useNearestNeighbor) {

			// No scaling necessary if scale is native
			if(1 === scaleX && 1 === scaleY) {
				return this.splice();
			}

			useNearestNeighbor = (typeof useNearestNeighbor === "boolean") ?
				useNearestNeighbor : true;

			// Create a canvas with new dimensions
			var copy = document.createElement("canvas");
				copy.width = this._DOMElement.width * Math.abs(scaleX);
				copy.height = this._DOMElement.height * Math.abs(scaleY);

			var pointOfReflection = new Fizz.Point(scaleX < 0 ? copy.width : 0,
												   scaleY < 0 ? copy.height : 0);

			var ctx = copy.getContext('2d');

			// Save the original context transform data to the state stack
			ctx.save();

			// Use nearest-neightbor sampling for scaling
			ctx.imageSmoothingEnabled =
			ctx.mozImageSmoothingEnabled =
			ctx.webkitImageSmoothingEnabled = !useNearestNeighbor;

			// Transform the content of account for scale, and draw
			ctx.translate.apply(ctx, pointOfReflection.toList());
			ctx.scale(scaleX, scaleY);
			ctx.drawImage(this._DOMElement, 0, 0);

			// Restore the context stack to its original state
			ctx.restore();

			return copy;
			
		},

		splice: function(x, y, width, height) {

			if(0 === this._DOMElement.width || 0 === this._DOMElement.height) {
				return document.createElement('canvas');
			}

			// Allow passing in area parameters as a list
			if(arguments[0] && arguments[0] instanceof Array) {
				return this.splice.apply(this, arguments[0]);
			}

			x = (typeof x === "number") ? x : 0;
			y = (typeof y === "number") ? y : 0;

			width = (typeof width === "number") ? width : this._DOMElement.width;
			height = (typeof height === "number") ? height : this._DOMElement.height;

			var clipping = document.createElement('canvas');
				clipping.width = width;
				clipping.height = height;

			var ctx = clipping.getContext('2d');

			ctx.drawImage.apply(ctx, [
				this._DOMElement, // clipping source
				x, y, 			  // xPos and yPos of clipping
				width, height, 	  // width and height of clipping
				0, 0, 			  // xPos and yPos of drawing
				width, height 	  // width and height of drawing
			]);

			return clipping;

		},

		copy: function(canvas) {

			if(!(canvas && canvas instanceof Fizz.Canvas)) {
				Fizz.throws("Argument 'canvas' must be a Fizz.Canvas instance!");
			}

			this.width = canvas.width;
			this.height = canvas.height;

			this.element = canvas.splice();

		},

		clone: function() {
			var clone = new Fizz.Canvas();
			clone.copy(this);
			return clone;
		},

		toString: function() {
			return String.format("[Canvas (width='{0}', height='{1}')]",
				this.width, this.height);
		},

		// Private methods

		_getWindowPosition: function() {
			
			var position = new Fizz.Point(0,0);
	
			if(this._DOMElement && this._DOMElement.ownerDocument) {
				
				//@TODO Account for CSS padding
				
				var d = this._DOMElement.ownerDocument.documentElement,
					clientRect = this._DOMElement.getBoundingClientRect();

				position.x = clientRect.left + window.pageXOffset - d.offsetLeft;
				position.y = clientRect.top + window.pageYOffset - d.offsetTop;

			}
			
			return (this._windowPosition = position.clone());

		},

		_bind: function(element) {

			if(!(element instanceof HTMLCanvasElement)) return null;
			
			// Decorate canvas event objects with context-dependent data
			
			var mappings = { };

			var baseKeyboardMappings = { 'keyCode': 'keyCode' };

			var baseMouseMappings = {
				'button': 'mouseButton',
				'clientX': {
					property: 'mouseX',
					transform: function(x) {
						var c = element;
						var cScaleX = (c.clientWidth / c.width);
						var unscaledXPos = (typeof x === "number") ?
							x - this.windowPosition.x : 0;
						// account for CSS scaling of canvas element
						return Math.floor(unscaledXPos / cScaleX);
					}
				},
				'clientY': {
					property: 'mouseY',
					transform: function(y) {
						var c = element;
						var cScaleY = (c.clientHeight / c.height);
						var unscaledYPos = (typeof y === "number") ?
							y - this.windowPosition.y : 0;
						// account for CSS scaling of canvas element
						return Math.floor(unscaledYPos / cScaleY);
					}
				}
			};

			// Click event mapping
			mappings.click = {
				'type': {
					property: 'type',
					transform: function() {
						return Canvas.EVENTS.CLICK;
					}
				}
			}.assign(baseMouseMappings);

			// Double click event mapping
			mappings.dblclick = {
				'type': {
					property: 'type',
					transform: function() {
						return Canvas.EVENTS.DBLCLICK;
					}
				}
			}.assign(baseMouseMappings);

			// Mouseup event mapping
			mappings.mouseup = {
				'type': {
					property: 'type',
					transform: function() { 
						return Canvas.EVENTS.MOUSEUP;
					}
				}
			}.assign(baseMouseMappings);

			// Mousedown event mapping
			mappings.mousedown = {
				'type': {
					property: 'type',
					transform: function() {
						return Canvas.EVENTS.MOUSEDOWN;
					}
				}
			}.assign(baseMouseMappings);
			
			// Mousemove event mapping
			mappings.mousemove = {
				'type': {
					property: 'type',
					transform: function() {
						return Canvas.EVENTS.MOUSEMOVE;
					}
				}
			}.assign(baseMouseMappings);

			// Keydown event mapping
			mappings.keydown = {
				'type': {
					property: 'type',
					transform: function() {
						return Canvas.EVENTS.KEYDOWN;
					}
				}
			}.assign(baseKeyboardMappings);

			// Keydown event mapping
			mappings.keyup = {
				'type': {
					property: 'type',
					transform: function() { 
						return Canvas.EVENTS.KEYUP;
					}
				}
			}.assign(baseKeyboardMappings);

			// Set up event listeners for each Canvas event mapping

			var globalDOMEvents = ['keydown','keyup'];

			mappings.foreach(function(mapping, domEventType) {

				// Catch the DOM event when it occurs on the document/canvas
				var mapDOMEvent = function(e) {

					// Construct a data object for decorating the new Fizz.Event
					var data = { };

					// Map values from the DOM event's properties to custom
					// properties that's we'll place on the new Fizz.Event instance
					mapping.foreach(function(to, from) {
						if(from in e) {
							if(typeof to === "string") {
								data[to] = e[from];
							} else {
								data[to.property] = to.transform.call(this, e[from]);
							}
						}
					}, this);

					// Log the event
					Fizz.logger.filter("dev")
						.log("Event occurred: [Event (type='{0}')]", data.type);

					// Emit a custom (decorated) Fizz.Event from the Canvas
					this.emit.call(this, data.type, data);
					
				}.bind(this);

				// Resolve the DOM event's target element
				var domTarget = (globalDOMEvents.indexOf(domEventType) > -1) ?
					window.document.body : element;

				// Add a listener for the current DOM event type
				domTarget.addEventListener(domEventType, mapDOMEvent);

				// Keep track of all current listeners so we can remove them later
				this._DOMElementListeners.push({
					'type': domEventType,
					'listener': mapDOMEvent
				});

			}, this);

			//@TODO Browser testing
			// Suppress context menus in browser if possible
			element.addEventListener('contextmenu', function(e) {
				e.preventDefault();
			});

			return element;

		}

	});

	// Apply Fizz.EventEmitter interface to Fizz.Canvas class
	Fizz.EventEmitter.initialize(Canvas.prototype);

	// Static class members

	Canvas.EVENTS = { };

	Canvas.EVENTS.CLICK 	= 'click';
	Canvas.EVENTS.DBLCLICK 	= 'dblclick';
	Canvas.EVENTS.MOUSEUP 	= 'mouseup';
	Canvas.EVENTS.MOUSEDOWN = 'mousedown';
	Canvas.EVENTS.MOUSEMOVE = 'mousemove';

	Canvas.EVENTS.KEYDOWN 	= 'keydown';
	Canvas.EVENTS.KEYUP 	= 'keyup';

	// Public properties

	Canvas.prototype.exposeProperty("width", "_DOMElement.width",
		Fizz.restrict.toNumber("_DOMElement.width"));

	Canvas.prototype.exposeProperty("height", "_DOMElement.height",
		Fizz.restrict.toNumber("_DOMElement.height"));

	// Dynamic public properties

	Canvas.prototype.exposeProperty("windowPosition", function() {
		return this._getWindowPosition();
	});

	Canvas.prototype.exposeProperty("element", "_DOMElement", function(elem) {
		if(elem instanceof HTMLCanvasElement) {
			// Remove all listeners for the previous canvas element, so that
			// it no longer interacts with the Canvas wrapper
			this._DOMElementListeners.foreach(function(record) {
				this._DOMElement.removeEventListener(record.type, record.listener);
			});
			// Register a new set of event listeners on the DOM element,
			// and return it to update the wrapper's element reference
			this._DOMElement = this._bind(elem);
		}
	});

	// Stage export
	Fizz.Canvas = Canvas;

	Fizz.logger.filter('all').log("Loaded module 'Canvas'.");

}());