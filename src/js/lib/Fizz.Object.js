// Namespace
this.Fizz = this.Fizz || { };

(function() {

	Fizz.noop = function() { };

	/* Non-enumerable ES5 extensions to native Object prototype */

	/* Object.prototype.exposeProperty */
	Object.defineProperty(Object.prototype, 'exposeProperty', {
		value: function(property, getter, setter) {
			if(typeof getter === "undefined") { getter = '_' + property; }
			if(typeof getter === "string") {
				getter = new Function("return this." + getter);
			}
			// Default setter function will be a no-op, allowing for read-only properties
			if(typeof setter !== "function") {
				setter = Fizz.noop;
			}
			Object.defineProperty(this, property, {
				get: getter,
				set: setter,
				// Allow prototypes to override inheritted property restrictions
				configurable: true,
				enumerable: false
			});
		},
		writable: false,
		configurable: false,
		enumerable: false
	});

	/* Object.prototype.banishProperty */
	Object.defineProperty(Object.prototype, 'banishProperty', {
		value: function(property, banishPrivate) {
			banishPrivate = (typeof banishPrivate === "undefined") ? true : banishPrivate;
			Object.defineProperty(this, property, {
				get: Fizz.noop,
				set: Fizz.noop,
				configurable: false,
				enumerable: false
			});
			if(banishPrivate && typeof this['_' + property] !== "undefined") {
				this.banishProperty('_' + property, false);
			}
		},
		writeable: false,
		configurable: false,
		enumerable: false
	});

	/* Object.prototype.assign */
	Object.defineProperty(Object.prototype, 'assign', {
		value: function(settings) {
			if(null === settings || typeof settings !== "object") {
				return this;
			}
			for(var prop in settings) {
				// Will copy all inherited properties, except for those
				// that exist on the native Object prototype
				if(settings.hasOwnProperty(prop) && settings[prop] !== undefined) {
					// if(typeof settings[prop] == "object") {
					// 	this[prop] = (new Object()).assign(settings[prop]);
					// } else {
						this[prop] = settings[prop];
					// }
				}
			}
			return this;
		},
		writeable: false,
		configurable: false,
		enumerable: false
	});

	/* Object.prototype.extend */
	Object.defineProperty(Object.prototype, 'extend', {
		value: function(members) {
			// Define a new constructor function whose prototype we will extend
			function Class() {
				// Prevent the constructor from being accidentally invoked
				if(!(this instanceof Class)) { throw new Error("Constructor called without the 'new' keyword."); }
				// Automatically call the object's 'init' method if present
				if('init' in this) { this.init.apply(this, arguments); }
			}
			// Here we copy the parent class properties to the child class.
			// We'll also give the subclass an explicit reference to the
			// superclass prototype, and re-assign the 'constructor' property
			Class.prototype = Object.create(this.prototype);
			// Class.prototype.__super__ = this.prototype;
			Class.prototype.constructor = Class;
			// We allow the user to specify a new set of class members to
			// add to the child class's prototype
			for(var property in members) {
				if(members.hasOwnProperty(property)) {
					Class.prototype[property] = members[property];
				}
			}
			// Finally, we'll need to provide a way to modify the new class
			// prototype without direct assignment (e.g. - if we wanted to use
			// Object.defineProperty). This will also allow us to define getter-
			// setter interfaces for the new class within our call to 'extend'
			// if(decoratePrototypeFn instanceof Function) {
			// 	decoratePrototypeFn(Class.prototype);
			// }
			// Return the newly-created subclass constructor
			return Class;
		},
		writeable: false,
		configurable: false,
		enumerable: false
	});

	/* Object.prototype.keys */
	if(typeof Object.prototype.keys !== "function") {
		Object.defineProperty(Object.prototype, 'keys', {
			value: function() {
				var keys = [ ];
				//@TODO Is this actually a thing?
				//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/keys
				// if(typeof Array.prototype.keys === "function" && this instanceof Array) {
				// 	var iter = Array.prototype.keys.call(this);
				// 	while(keys.push(iter.next().value)) { }
				// 	return keys;
				// }
				for(var key in this) {
					if(this.hasOwnProperty(key)) {
						keys.push(key);
					}
				}
				return keys;
			},
			writeable: false,
			configurable: false,
			enumerable: false
		});
	}

	/* Object.prototype.foreach */
	Object.defineProperty(Object.prototype, 'foreach', {
		value: function(callback, context) {
			if(typeof context === "undefined") {
				context = this;
			}
			var i = 0;
			for(var key in this) {
				if(this.hasOwnProperty(key)) {
					callback.call(context, this[key], key, i);
					i++;
				}
			}
		},
		writeable: false,
		configurable: false,
		enumerable: false
	});

	/* String.format */
	if(typeof String.format !== "function") {
		String.format = function(string) {
			var args = Array.prototype.slice.call(arguments, 1);
			return string.replace(/{(\d+)}/g, function(match, index) {
				return typeof args[index] !== "undefined" ?
					args[index] : match;
			});
		};
	}

})();