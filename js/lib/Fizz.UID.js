// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var UID = function() {
		throw new Error("Error: UID object cannot be instantiated!");
	};

	// Private properties
	var _nextID = 0;

	// Public methods
	UID.get = function() {
		return _nextID++;
	};

	// Singleton export
	Fizz.UID = UID;

}());