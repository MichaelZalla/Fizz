// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var EventEmitter = Object.extend({

		init: function() {

			this._parent = null;
			this._events = { };

		},

		addEventListener: function(type, listener, useCapture) {

			useCapture = (typeof useCapture === "boolean") ?
				useCapture : false;

			// Decorate the listener function with phase information
			listener.useCapture = useCapture;

			// Allow first argument to be comma-separated list of types
			var split = type.replace(/(\s)/,'').split(/[ ,]+/);
			if(split.length > 1) type = split;

			if(type instanceof Array) {

				type.foreach(function(t) { this.addEventListener(t, listener); });

			} else {

				Fizz.logger.filter("dev")
					.log("Adding '{0}' listener to {1} (useCapture='{2}')",
						type, this.toString(), useCapture.toString());

				if(!(type in this._events)) {
					this._events[type] = listener;
					return;
				}

				if(typeof this._events[type] === "function") {
					if(this._events[type] === listener) return;
					this._events[type] = [this._events[type]];
					this._events[type].push(listener);
				}

				if(-1 < this._events[type].indexOf(listener)) return;

				this._events[type].push(listener);

			}

		},

		removeEventListener: function(type, listener, useCapture) {

			useCapture = (typeof useCapture === "boolean") ?
				useCapture : false;

			var split = type.replace(/(\s)/,'').split(/[ ,]+/);
			if(split.length > 1) type = split;

			if(type instanceof Array) {
				for(var i = 0; i < type.length; i++) {
					this.removeEventListener(type[i], listener);
				}
			} else {

				if(this._events[type] === listener) {
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

			useCapture = (typeof useCapture === "boolean") ?
				useCapture : false;

			var listeners = [ ],
				list = this._events[type];

			if(typeof list === "function" && list.useCapture === useCapture) {
				listeners.push(list);
			} else if(list instanceof Array) {
				listeners = list.filter(function(fn) {
					return (fn.useCapture === useCapture);
				});
			}

			return listeners;

		},

		listensFor: function(type) {
			return !!(type in this._events);
		},

		emit: function(E, data) {

			var e;

			// This should only be triggered at an Event's original source
			if(!(E instanceof Fizz.Event)) {
				if(typeof E === "function") {
					// Allow Event constructors to be passed (default arguments)
					e = new E();
				} else if(typeof E === "string") {
					// Allow eventType strings to be passed
					e = new Fizz.Event({ 'type': E });
				} else {
					Fizz.throws("Call was made to 'emit' method with invalid value " +
						"for 'eventObj'. Argument must be a string or Fizz.Event instance");
				}
			} else {
				e = E;
			}

			e.target = this;


			// Allow decoration of Event instance with arbitrary contextual data
			e.assign(data);

			// Log the event
			Fizz.logger.filter("dev")
				.log("Event occurred: [Event (type='{0}', target='{1}')]", e.type, e.target.name || e.target);

			// Construct capture path for event processing
			var capturePath = this._buildCapturePath();
			var bubblePath = capturePath.slice(0).reverse();
			var i, j, handlers;

			// Begin capturing phase
			e.eventPhase = Fizz.Event.PHASE.CAPTURING_PHASE;
			for(i = 0; i < capturePath.length; i++) {
				if(e.canceled) {
					return e.currentTarget;
				}
				e.currentTarget = capturePath[i];
				handlers = e.currentTarget.getEventListeners(e.type, true);
				for(j = 0; j < handlers.length; j++) {
					if(e.canceled) {
						return e.currentTarget;
					}
					handlers[j].call(e.currentTarget, e);
				}
			}

			// Begin bubbling phase
			e.eventPhase = Fizz.Event.PHASE.BUBBLING_PHASE;

			for(i = 0; i < bubblePath.length; i++) {
				if(e.canceled) {
					return e.currentTarget;
				}
				e.currentTarget = bubblePath[i];
				handlers = e.currentTarget.getEventListeners(e.type, false);
				for(j = 0; j < handlers.length; j++) {
					if(e.canceled) {
						return e.currentTarget;
					}
					handlers[j].call(e.currentTarget, e);
				}
			}

			return e.currentTarget;

		},

		toString: function() {
			return String.format("[EventEmitter (activeListeners='" +
				this._events.keys().toString() + "')]");
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
		EventEmitter.prototype.foreach(function(fn, methodName) {
			if(-1 === ['constructor','init','toString'].indexOf(methodName)) {
				target[methodName] = this[methodName];
			}
		}, EventEmitter.prototype);

		// Modify the target to include the necessary emitter properties

		if(target.hasOwnProperty('init') && typeof target.init === "function") {

			// We are extending a class prototype

			// Make a copy of the prototype's original init method
			var init_copy = new Function('return ' + target.init.toString())();
			for(var prop in target.init) {
				// Note that we are also copying over properties
				// that might be one the init method's prototype
				init_copy[prop] = target.init[prop];
				/*jshint -W089 */
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

	// EventEmitter.prototype.on = function() {
	// 	EventEmitter.prototype.addEventListener.apply(this, arguments);
	// 	return this;
	// };
	EventEmitter.prototype.on  = EventEmitter.prototype.addEventListener;

	// EventEmitter.prototype.off = function() {
	// 	EventEmitter.prototype.removeEventListener.apply(this, arguments);
	// 	return this;
	// };
	EventEmitter.prototype.off = EventEmitter.prototype.removeEventListener;

	// Public properties

	EventEmitter.prototype.exposeProperty("parent", "_parent",
		Fizz.restrict.toInstanceType("_parent", "Fizz.EventEmitter"));

	// Class export
	Fizz.EventEmitter = EventEmitter;

	Fizz.logger.filter('dev').log("Loaded module 'EventEmitter'.");

}());