// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var Point = Object.extend({
	
		init: function(x, y) {
			this._x = 0;
			this._y = 0;
			this.x = x;
			this.y = y;
		},
	
		add: function(point) {
			return new Fizz.Point(this._x + point.x, this._y + point.y);
		},

		equals: function(point) {
			return !!(this._x === point.x && this._y === point.y);
		},

		distanceFrom: function(point) {
			return Math.sqrt(Math.pow(point.x - this.x, 2) +
		 		   	Math.pow(point.y - this.y, 2));
		},

		copy: function(point) {
			this.init(point.x, point.y);
		},

		clone: function() {
			return new Fizz.Point(this._x, this._y);
		},

		toList: function() {
			return [this._x, this._y];
		},

		toString: function() {
			return String.format("[Point (x='{0}', y='{1}')]", this._x, this._y);
		}

	});

	// Public properties

	Point.prototype.exposeProperty("x", "_x", Fizz.restrict.toNumber("_x"));
	Point.prototype.exposeProperty("y", "_y", Fizz.restrict.toNumber("_y"));
	
	// Public dynamic properties

	Point.prototype.exposeProperty("length", function() {
		return this.distanceFrom(new Fizz.Point(0,0));
	});

	// Class export
	Fizz.Point = Point;

	Fizz.logger.filter('dev').log("Loaded module 'Point'.");

}());