// Namespace
this.Fizz = this.Fizz || { };

(function() {

	// Private properties
	var _privateFoo = 0;

	var Logger = function() {
		throw new Error("Error: Logger object cannot be instantiated!");
	};

	// Public methods
	Logger.foo = function() {
		return false;
	};

	// Singleton export
	Fizz.Logger = Logger;

}());