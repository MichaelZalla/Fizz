// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var Event = Object.extend({

		init: function(type, bubbles, cancelable) {

			this._bubbles = true;
			this._cancelable = true;
			
			this._canceled = false;
			this._immediatelyCanceled = false;

			this._type = null;
			this._target = null; // The source of the Event
			this._currentTarget = null;
			this._eventPhase = Event.PHASE.NONE;

			this._timeStamp = Date.now();

			if(arguments[0] !== null && typeof arguments[0] === "object") {
				var settings = arguments[0];
				this.assign(settings);
			} else {
				switch(arguments.length) {
					case 3: this.cancelable = cancelable;
					/* falls through */
					case 2: this.bubbles = bubbles;
					/* falls through */
					case 1: this.type = type;
					/* falls through */
				}
			}

		},

		stopPropagation: function() {
			this._canceled = true;
		},

		stopImmediatePropagation: function() {
			this._immediatelyCanceled = true;
			this.stopPropagation();
		},

		copy: function(e) {
			e.foreach(function(value, prop) {
				this[prop] = value;
			}, this);
		},

		clone: function() {
			var clone = new Fizz.Event();
			clone.copy(this);
			return clone;
		},

		toString: function() {
			return String.format("[Event (type='{0}', target='{1}')]",
				this._type, this._target);
		}

	});

	// Static class members

	Event.PHASE = { };
	Event.PHASE.NONE = 0;
	Event.PHASE.CAPTURING_PHASE = 1;
	Event.PHASE.AT_TARGET = 2;
	Event.PHASE.BUBBLING_PHASE = 3;

	// Public properties

	// Expose boolean properties
	Event.prototype.exposeProperty('bubbles', '_bubbles',
		Fizz.restrict.toBoolean("_bubbles"));
	Event.prototype.exposeProperty('cancelable', '_cancelable',
		Fizz.restrict.toBoolean("_bubbles"));
	Event.prototype.exposeProperty('canceled', '_canceled',
		Fizz.restrict.toBoolean("_bubbles"));
	Event.prototype.exposeProperty('immediatelyCanceled', '_immediatelyCanceled',
		Fizz.restrict.toBoolean("_bubbles"));

	// Expose string properties
	Event.prototype.exposeProperty('type', '_type',
		Fizz.restrict.toString('_type'));

	// Expose numeric properties
	Event.prototype.exposeProperty('eventPhase', '_eventPhase',
		Fizz.restrict.toNumber('_eventPhase'));
	Event.prototype.exposeProperty('timeStamp', '_timeStamp',
		Fizz.restrict.toNumber('_timeStamp'));

	// Expose object-type properties
	Event.prototype.exposeProperty('target', '_target',
		Fizz.restrict.toInstanceType('_target', 'Object'));
	Event.prototype.exposeProperty('currentTarget', '_currentTarget',
		Fizz.restrict.toInstanceType('_currentTarget', 'Object'));

	// Class export
	Fizz.Event = Event;

}());