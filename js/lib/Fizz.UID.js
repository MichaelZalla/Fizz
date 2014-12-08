// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var UID = function() {
		throw new Error("Error: UID object cannot be instantiated!");
	};

	// Public methods
	UID.get = function() {
		return UID._nextID++;
	};
	
	// Private properties
	UID._nextID = 0;

	// Singleton export
	Fizz.UID = UID;

}());