// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var Rectangle = Object.extend({
	
		init: function(position, size) {

			this._position = new Fizz.Point(0,0);
			this._size = new Fizz.Point(0,0);

			// Position can be a coordinate list or Point instance

			if(position) {
				if(position instanceof Fizz.Point) {
					this.position = position.clone(); 
				} else if(2 === position.length) {
					this.position.x = position[0];
					this.position.y = position[1];
				}
			}

			// Size can be a coordinate list or Point instance

			if(size) {
				if(size instanceof Fizz.Point) {
					this.size = size.clone();
				} else if(2 === size.length) {
					this.size.x = size[0];
					this.size.y = size[1];
				}
			}

		},

		//@TODO Rectangle class should not be responsible for calculating
		// collisions. They're just buckets for data!
		intersects: function(rectangle) {
			
			// Accepts list of points or rectangles
			if(rectangle instanceof Array) {
				return rectangle.reduce(function(prev, rect) {
					return prev && this.intersects(rect);
				}.bind(this), true);
			}

			// Cast points to rectangle of size (0,0)
			if(rectangle instanceof Fizz.Point) {
				rectangle = new Fizz.Rectangle(rectangle);
			}

			if(!(rectangle instanceof Fizz.Rectangle)) return false;

			return !(this.top > rectangle.bottom || this.bottom < rectangle.top ||
					 this.left > rectangle.right || this.right < rectangle.left);

		},

		copy: function(entity) {
			return this.init(entity.position.clone(), entity.size.clone());
		},

		clone: function() {
			return new Fizz.Rectangle(this._position.clone(), this._size.clone());
		},

		toString: function() {
			return String.format("[Rectangle (x='{0}', y='{1}', width='{2}', height='{3}')]",
				this._position.x, this._position.y, this._size.x, this._size.y);
		}

	});

	// Public properties

	Rectangle.prototype.exposeProperty("position", "_position",
		Fizz.restrict.toInstanceType("_position", "Fizz.Point"));
	
	Rectangle.prototype.exposeProperty("size", "_size",
		Fizz.restrict.toInstanceType("_size", "Fizz.Point"));
	
	// Note that we delegate assignment validation to the Point class (it has its own restrictions in place)
	//@TODO Is it necessary to include these setters, or does it introduce redundancy?
	
	Rectangle.prototype.exposeProperty("x", "_position.x",  Fizz.restrict.toNumber("_position.x"));
	Rectangle.prototype.exposeProperty("y", "_position.y",  Fizz.restrict.toNumber("_position.y"));
	Rectangle.prototype.exposeProperty("width",  "_size.x", Fizz.restrict.toNumber("_size.x"));
	Rectangle.prototype.exposeProperty("height", "_size.y", Fizz.restrict.toNumber("_size.y"));

	// Public dynamic properties

	Rectangle.prototype.exposeProperty("left", 	 function() { return this._position.x; });
	Rectangle.prototype.exposeProperty("top", 	 function() { return this._position.y; });
	Rectangle.prototype.exposeProperty("right",  function() { return this._position.x + this._size.x; });
	Rectangle.prototype.exposeProperty("bottom", function() { return this._position.y + this._size.y; });

	// Class export
	Fizz.Rectangle = Rectangle;

}());