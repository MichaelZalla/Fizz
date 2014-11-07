// Namespace
this.Fizz = this.Fizz || { };

(function() {

	// Prefixed with underscore to avoid collision with Math object
	var _Math = { };

	_Math.randomInt = function(min, max) {
		if(0 === arguments.length) { min = 0; max = 1; }
		if(1 === arguments.length) { max = min; min = 0; }
		return (Math.floor(Math.random() * (max + 1 - min))) + Math.floor(min);
	};

	_Math.randomFloat = function(min, max) {
		if(0 === arguments.length) { min = 0; max = 1; }
		if(1 === arguments.length) { max = min; min = 0; }
		return (Math.random() * (max - min)) + min;
	};

	_Math.mapToDomain = function(domain, range, value) {
		// Clean up domain input(s)
		if(typeof domain === "number") { domain = [0, domain]; }
		if(!(domain instanceof Array)) { throw new Error("Must provide a valid domain input!"); }		
		domain = [Math.min.apply(this, domain), Math.max.apply(this, domain)];
		// Clean up range input(s)
		range = (typeof range === "undefined") ? [0,1] : range;
		if(typeof range === "number") { range = [0, range]; }
		if(!(range instanceof Array)) { throw new Error("Must provide a valid range input!"); }
		range = [Math.min.apply(this, range), Math.max.apply(this, range)];
		// No computation necessary if domain and range are identical
		if(domain[0] === range[0] && domain[1] === range[1]) { return value; }
		// Otherwise, carry out the calculation
		var domainSize = domain[1] - domain[0],
			rangeSize = range[1] - range[0];
		// Determine a scaling coefficient and return the mapped value
		var scalingFactor = parseFloat(domainSize / rangeSize);
		return domain[0] + (value - range[0]) * scalingFactor;
	};

	_Math.wrapAround = function(domain, value) {
		// Clean up domain input(s)
		if(typeof domain === "number") { domain = [0, domain]; }
		if(!(domain instanceof Array)) { throw new Error("Must provide a valid domain input!"); }		
		domain = [Math.min.apply(this, domain),
				  Math.max.apply(this, domain)];
		// Clean up the value input
		if(value !== value) { throw new Error("Must provide a valid value input!"); }
		// Resolve the value to a valid position in the domain
		var size = domain[1] - domain[0];
		while(value <= domain[0]) { value += size; }
		return value % size - 1;
	};

	// Class export
	Fizz.Math = _Math;

})();