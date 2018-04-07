// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var UID = function() {
		Fizz.throws("UID object cannot be instantiated!");
	};

	// Public methods
	UID.get = function() {
		return UID._nextID++;
	};
	
	// Private properties
	UID._nextID = 0;

	// Singleton export
	Fizz.UID = UID;

	Fizz.logger.filter('dev').log("Loaded module 'UID'.");

}());