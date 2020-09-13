// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var Demo = Object.extend({

		init: function() {

			this._tickRate = Demo.DEFAULT_TICK_RATE;
			this._initTime = null;
			this._tickTimeout = null;

			// Allow the user to pass in stage instance or dimensions

			if(arguments[0] instanceof Fizz.Stage) {

				this._stage = stage;

			} else {

				// Delegate the set of input parameters to the Stage instance
				var args = Array.prototype.slice.call(arguments, 0);
				this._stage = new (Function.prototype.bind.apply(Fizz.Stage, [null].concat(args)));

			}

			this._renderer = new Fizz.RAFRenderer(this._stage);

			this.play(); // Set things in motion!

		},

		// Public methods

		play: function() {

			if(this._tickTimeout === null) {
				this._initTime = this._initTime || +new Date();
				this._tick();
				this._renderer.start();
			}

		},

		pause: function() {

			window.clearTimeout(this._tickTimeout);
			this._tickTimeout = null;
			this._renderer.stop();

		},

		toString: function() {
			return "[Demo (stage='{0}')]".format(this._stage.toString());
		},

		// Private methods

		_tick: function tick() {
			this._tickTimeout = window.setTimeout(
				function() {
					this.stage.update(1);
					tick.call(this);
				}.bind(this), this._tickRate);
		}

	});

	// Static class members

	Demo.DEFAULT_TICK_RATE = (1000 / 100);

	// Public properties

	Demo.prototype.exposeProperty("stage");
	Demo.prototype.exposeProperty("tickRate");
	Demo.prototype.exposeProperty("initTime");

	// Public dynamic properties

	Demo.prototype.exposeProperty("uptime", function() {
		return (+new Date() - this._initTime);
	});

	// Class export
	Fizz.Demo = Demo;

	Fizz.logger.filter('dev').log("Loaded module 'Demo'.");

})();