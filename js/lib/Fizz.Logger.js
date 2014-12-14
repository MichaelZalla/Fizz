// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var _currentEnvFilter = Fizz.getEnv();

	var Logger = function() {
		if(Fizz.logger) {
			Fizz.logger.error("Error: The Logger class cannot be instantiated!");
		}
	};

	Logger.prototype.filter = function(env) {
		_currentEnvFilter = env.toString().toLowerCase();
		return this;
	};

	Logger.prototype.log = function() {
		if(_currentEnvFilter !== Fizz.getEnv()) return;
		window.console.log("[" + Fizz.getEnv().toUpperCase() +
			"] " + String.format.apply(this, arguments));
		return this;
	};

	Logger.prototype.debug = function() {
		if(_currentEnvFilter !== Fizz.getEnv()) return;
		window.console.debug("[" + Fizz.getEnv().toUpperCase() +
			"] " + String.format.apply(this, arguments));
		return this;
	};

	Logger.prototype.info = function() {
		if(_currentEnvFilter !== Fizz.getEnv()) return;
		window.console.info("[" + Fizz.getEnv().toUpperCase() +
			"] " + String.format.apply(this, arguments));
		return this;
	};

	Logger.prototype.warn = function() {
		if(_currentEnvFilter !== Fizz.getEnv()) return;
		window.console.warn("[" + Fizz.getEnv().toUpperCase() +
			"] " + String.format.apply(this, arguments));
		return this;
	};

	Logger.prototype.error = function() {
		if(_currentEnvFilter !== Fizz.getEnv()) return;
		window.console.error("[" + Fizz.getEnv().toUpperCase() +
			"] " + String.format.apply(this, arguments));
		return this;
	};

	// Singleton export
	Fizz.logger = new Logger();

}());