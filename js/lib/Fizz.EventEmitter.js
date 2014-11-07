// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var EventEmitter = Object.extend({

		init: function() {

			this._parent = null;
			this._events = { };

		},

		addEventListener: function(type, listener, useCapture) {
			
			// Decorate listener function with phase information
			listener.useCapture = (!!useCapture !== false);

			// Allow first argument to be comma-separated list of types
			var split = type.replace(/(\s)/,'').split(/[ ,]+/);
			if(split.length > 1) { type = split; }
			
			if(type instanceof Array) {
				
				type.forEach(function(t) { this.addEventListener(t, listener); });

			} else {

				if(!(type in this._events)) {
					this._events[type] = listener;
					return;
				}

				if(typeof this._events[type] == "function") {
					if(this._events[type] == listener) return;
					this._events[type] = [this._events[type]];
					this._events[type].push(listener);
				}

				if(-1 < this._events[type].indexOf(listener)) return;

				this._events[type].push(listener);

			}	

		},

		removeEventListener: function(type, listener, useCapture) {
			
			useCapture = (!!useCapture !== false);

			var split = type.replace(/(\s)/,'').split(/[ ,]+/);
			if(split.length > 1) { type = split; }
			
			if(type instanceof Array) {
				for(var i = 0; i < type.length; i++) {
					this.removeEventListener(type[i], listener);
				}
			} else {

				if(this._events[type] == listener) {
					delete this._events[type];
					return;
				}

				var idx = this._events[type].indexOf(listener);

				if(-1 < idx) {

					this._events[type].splice(idx, 1);

					// Cleanup operations
					if(1 === this._events[type].length) {
						this._events[type] = this._events[type][0];
					} else if(0 === this._events[type].length) {
						delete this._events[type];
					}

				}

			}

		},

		getEventListeners: function(type, useCapture) {
			
			useCapture = (!!useCapture !== false);

			var listeners = [ ],
				list = this._events[type];

			if(typeof list == "function" && list.useCapture == useCapture) {
				listeners.push(list);
			} else if(list instanceof Array) {
				listeners = list.filter(function(fn) {
					return (fn.useCapture == useCapture);
				});
			}

			return listeners;

		},

		listensFor: function(type) {
			return !!(type in this._events);
		},

		emit: function(eventObj, eventData) {

			var e = eventObj;
			
			// This should only be triggered at an Event's original source
			if(!(e instanceof Fizz.Event)) {
				// Allow Event constructors to be passed (default arguments)
				if(typeof e == "function") e = new e();
				// Allow eventType strings to be passed
				else if(typeof e == "string") {
					e = new Fizz.Event({ 'type': e });
				}
				else {
					throw new Error("Call was made to 'emit' method with " +
						"invalid value for argument 'eventObj'. Argument must " +
						"be a string or Fizz.Event instance");
				}
			}

			e.target = this;
			
			// Allow decoration of Event instance with arbitrary contextual data
			e.assign(eventData);

			// Construct capture path for event processing
			var capturePath = this._buildCapturePath();
			var bubblePath = capturePath.slice(0).reverse();

			// Begin capturing phase
			e.eventPhase = Fizz.Event.PHASE.CAPTURING_PHASE;
			for(var i = 0; i < capturePath.length; i++) {
				if(e.canceled) {
					return e.currentTarget;
				}
				e.currentTarget = capturePath[i];
				var handlers = e.currentTarget.getEventListeners(e.type, true);
				for(var j = 0; j < handlers.length; j++) {
					if(e.canceled) {
						return e.currentTarget;
					}
					handlers[j].call(e.currentTarget, e);
				}
			}

			// Begin bubbling phase
			e.eventPhase = Fizz.Event.PHASE.BUBBLING_PHASE;

			for(var i = 0; i < bubblePath.length; i++) {
				if(e.canceled) {
					return e.currentTarget;
				}
				e.currentTarget = bubblePath[i];
				var handlers = e.currentTarget.getEventListeners(e.type, false);
				for(var j = 0; j < handlers.length; j++) {
					if(e.canceled) {
						return e.currentTarget;
					}
					handlers[j].call(e.currentTarget, e);
				}
			}

		},

		toString: function() {
			return "[EventEmitter]";
		},

		// Private methods

		_buildCapturePath: function() {
			var root = this,
				path = [ ];
			while(root) {
				path.unshift(root); // Reverse-push
				root = root.parent;
			}
			return path;
		}

	});

	// Static class members

	EventEmitter.initialize = function(target) {
		
		// Decorate the target object with the EventEmitter API
		EventEmitter.prototype.forEach(function(fn, methodName) {
			if(-1 === ['constructor','init','toString'].indexOf(methodName)) {
				target[methodName] = this[methodName];
			}
		}, EventEmitter.prototype);

		// Modify the target to include the necessary emitter properties

		if(target.hasOwnProperty('init') && typeof target.init == "function") {
			
			// We are extending a class prototype
			
			// Make a copy of the prototype's original init method
			var init_copy = new Function('return ' + target.init.toString())();
			for(var prop in target.init) {
				init_copy[prop] = target.init[prop];
			}

			// Decorate the original fn with a call to EventEmitter.prototype.init
			target.init = function() {
				EventEmitter.prototype.init.call(this);
				init_copy.apply(this, arguments);
			};

		} else {
			
			// We are extending a class instance object
			EventEmitter.prototype.init.call(this);

		}

	};

	// Syntactic sugar

	EventEmitter.prototype.on = EventEmitter.prototype.addEventListener;
	EventEmitter.prototype.off = EventEmitter.prototype.removeEventListener;

	// Public properties

	EventEmitter.prototype.exposeProperty("parent", "_parent",
		Fizz.restrict.toInstanceType("_parent", "Fizz.EventEmitter"));

	// Class export
	Fizz.EventEmitter = EventEmitter;

}());