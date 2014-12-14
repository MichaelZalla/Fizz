// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var _currentEnvFilter = Fizz.getEnv();

	var Logger = function() {
		if(Fizz.logger) {
			Fizz.throws("Error: The Logger class cannot be instantiated!");
		}
	};

	Logger.prototype.filter = function(env) {
		_currentEnvFilter = ("all" === env) ?
			Fizz.getEnv() : env.toString().toLowerCase();
		return this;
	};

	Logger.prototype.log = function() {
		if(_currentEnvFilter !== Fizz.getEnv()) return;
		window.console.log("Fizz [" + Fizz.getEnv().toUpperCase() + "]\u0020\u0020" +
			String.format.apply(this, arguments));
		return this;
	};

	Logger.prototype.debug = function() {
		if(_currentEnvFilter !== Fizz.getEnv()) return;
		window.console.debug("Fizz [" + Fizz.getEnv().toUpperCase() + "]\u0020\u0020" +
			String.format.apply(this, arguments));
		return this;
	};

	Logger.prototype.info = function() {
		if(_currentEnvFilter !== Fizz.getEnv()) return;
		window.console.info("Fizz [" + Fizz.getEnv().toUpperCase() + "]\u0020\u0020" +
			String.format.apply(this, arguments));
		return this;
	};

	Logger.prototype.warn = function() {
		if(_currentEnvFilter !== Fizz.getEnv()) return;
		window.console.warn("Fizz [" + Fizz.getEnv().toUpperCase() + "]\u0020\u0020" +
			String.format.apply(this, arguments));
		return this;
	};

	Logger.prototype.error = function() {
		if(_currentEnvFilter !== Fizz.getEnv()) return;
		throw new Error("Fizz [" + Fizz.getEnv().toUpperCase() + "]\u0020\u0020" +
			String.format.apply(this, arguments));
	};

	// Singleton export
	Fizz.logger = new Logger();

	// Shorthand reference
	Fizz.throws = function(err) {
		this.filter("all").error(err);
	}.bind(Fizz.logger);

	Fizz.logger.filter('all').log("Loaded module 'Logger'.");

}());