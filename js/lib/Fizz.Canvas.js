// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var Canvas = Object.extend({

		init: function(canvasElement) {
			
			// Safely assign or ignore value of 'canvasElement'
			this._DOMElement = document.createElement("canvas");
			this.element = canvasElement;

		},

		scale: function(scaleX, scaleY, useNearestNeighbor) {

			// No scaling necessary if scale is native
			if(1 === scaleX && 1 === scaleY) {
				return this.splice();
			}

			useNearestNeighbor = (!!useNearestNeighbor !== false);

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
				throw new Error("Argument 'canvas' must be a Fizz.Canvas instance!");
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
			return "[Canvas (width='" + this.width + "', height='" + this.height + "')]";
		},

		// Private methods

		_getWindowPosition: function() {
			
			// https://github.com/jquery/jquery/blob/740e190223d19a114d5373758127285d14d6b71e/src/offset.js

			var position = new Fizz.Point(0,0);
	
			if(this._DOMElement && this._DOMElement.ownerDocument) {
				 
				var d = this._DOMElement.ownerDocument.documentElement,
					clientRect = this._DOMElement.getBoundingClientRect();

				position.x = clientRect.left + window.pageXOffset - d.offsetLeft;
				position.y = clientRect.top + window.pageYOffset - d.offsetTop;

			}
			
			return (this._windowPosition = position.clone());

		},

		_registerEventMappingListeners: function() {

			if(null === this._DOMElement) return;
			
			/** Decorate canvas event objects with context-dependent data **/
			
			var mappings = { };

			var baseKeyboardMappings = { 'keyCode': 'keyCode' };

			var baseMouseMappings = {
				'button': 'mouseButton',
				'clientX': {
					property: 'mouseX',
					transform: function(x) {
						var c = this._DOMElement;
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
						var c = this._DOMElement;
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

			mappings.forEach(function(mapping, domEventType) {

				var domTarget = (globalDOMEvents.indexOf(domEventType) > -1) ?
					window.document.body : this._DOMElement;

				// Catch the DOM event when it occurs on the document/canvas
				domTarget.addEventListener(domEventType, function(e) {

					//@TODO Remove this
					// Prevent any unwanted browser behaviors
					// e.preventDefault();

					// Construct a data object for decorating the new Fizz.Event
					var data = { };

					// Map values from the DOM event's properties to custom
					// properties that's we'll place on the new Fizz.Event instance
					mapping.forEach(function(to, from) {
						if(from in e) {
							if(typeof to === "string") {
								data[to] = e[from];
							} else {
								data[to.property] = to.transform.call(this, e[from]);
							}
						}
					}, this);

					// Emit a custom (decorated) Fizz.Event from the Canvas
					this.emit.call(this, data.type, data);

					//@TODO Remove this
					// Prevent the DOM event from being intercepted by other
					// listeners on elements within the current document
					// e.stopPropagation();

				}.bind(this));

			}, this);

			// Suppress context menus in browser if possible
			//@TODO Browser testing
			this._DOMElement.addEventListener('contextmenu', function(e) {
				e.preventDefault();
			});

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
			//@TODO Remove event listeners on previous canvas instance?
			this._DOMElement = elem;
			this._registerEventMappingListeners();
		}
	});

	// Stage export
	Fizz.Canvas = Canvas;

}());