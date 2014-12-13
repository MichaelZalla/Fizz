// Namespace
this.Fizz = this.Fizz || { };

(function() {

	/* Fizz.restrict module for setter generator methods */

	Fizz.restrict = { };

	Fizz.restrict.toDataType = function(property, type, context) {
		context = (typeof context === "string") ? context : "this";
		var functionBody = context + "." + property + "=(typeof value === '" +
			type + "')?value:" + context + "." + property + ";";
		return new Function("value", functionBody);
	};

	Fizz.restrict.toBoolean = function(property, context) {
		return Fizz.restrict.toDataType(property, "boolean", context);
	};

	Fizz.restrict.toString = function(property, context) {
		if(!arguments.length) { return Object.prototype.toString.apply(this); }
		return Fizz.restrict.toDataType(property, "string", context);
	};

	Fizz.restrict.toNumber = function(property, context) {
		return Fizz.restrict.toDataType(property, "number", context);
	};

	Fizz.restrict.toInstanceType = function(property, type, context) {
		context = (typeof context === "string") ? context : "this";
		var functionBody = context + "." + property + "=(value instanceof " +
			type + "||value === null)?value:" + context + "." + property + ";";
		return new Function("value", functionBody);
	};

	Fizz.restrict.toRange = function(property, range, context) {
		if(typeof range === "undefined" || !(range instanceof Array) || (range.length < 2)) {
			 throw new Error("Attempt to restrict property to range with invalid range value");
		}
		range = [Math.min.apply(this, range), Math.max.apply(this,range)];
		context = (typeof context === "string") ? context : "this";
		var functionBody = "if(typeof value != 'number') return; " +
			context + "." + property + "=(value>=" + range[0].toString() + ")?" +
			"((value <= " + range[1] + ")?value:" + range[1] + "):" + range[0] + ";";
		return new Function("value", functionBody);
	};

}());