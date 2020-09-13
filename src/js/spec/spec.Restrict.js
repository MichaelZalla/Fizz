describe("The 'restrict' module", function() {

	window.Point = null;

	beforeEach(function() {
		
   		// Note that the 'this.x' and 'this.y' references would be
   		// undefined prior to actually exposing those as a getter-
   		// setter pair.

   		Point = Function.extend({
   			init: function(x, y) {
   				this._x = 0;
   				this._y = 0;
   				this.x = x;
   				this.y = y;
   			}
   		});
		
	});

	describe("the 'toDataType' method", function() {	
		it("can be used to restrict a class member's value to a specific data-type", function() {

   			// Set up getters and setters for the point's data
			Point.prototype.exposeProperty("x", "_x", Fizz.restrict.toDataType("_x", "number"));
   			Point.prototype.exposeProperty("y", "_y", Fizz.restrict.toDataType("_y", "number"));

	   		// Create a new Point instance, and ensure the validity of its coordinates
	   		var point = new Point(4, 8);
	   		expect(point.x).toEqual(4);
	   		expect(point.y).toEqual(8);

	   		// Attempt to assign invalid values to the instance's coordinates
	   		point.x = "seventeen";
	   		point.y = false;

	   		// Ensure that the coordinate data has not been overwritten
	   		expect(point.x).toEqual(4);
	   		expect(point.y).toEqual(8);

		});
	});

	describe("the 'toInstanceType' method", function() {
		it("can be used to restrict a class member's value to a specific class " +
		   "(instance) type", function() {

		   	// Define a new Comet class
		   	var Comet = Function.extend({
		   		init: function(location) {
		   			this._coordinates = new Point(0, 0);
		   			this.coordinates = location;
		   		}
		   	});

		   	Comet.prototype.exposeProperty("coordinates", "_coordinates",
		   			Fizz.restrict.toInstanceType("_coordinates", "Point"));

		   	// Create a new Comet instance, and test that its default coordinates are correct
		   	var comet = new Comet();
		   	expect(comet.coordinates.x).toEqual(0);
		   	expect(comet.coordinates.y).toEqual(0);

		   	// Ensure that our restrictions are effective, by attemping to assign
		   	// a value of an invalid data type to our comet's 'coordinates' property

		   	comet.coordinates = [40, 20];
		   	expect(comet.coordinates.x).toEqual(0);
		   	expect(comet.coordinates.y).toEqual(0);
		   	
		   	comet.coordinates = function() { console.log("Very far away!"); };
		   	expect(comet.coordinates.x).toEqual(0);
		   	expect(comet.coordinates.x).toEqual(0);

		   	comet.coordinates = new Point(12, 12);
		   	expect(comet.coordinates.x).toEqual(12);
		   	expect(comet.coordinates.x).toEqual(12);

		});
	});

	describe("the 'toRange' method", function() {
		it("can be used to restrict a class member's value into a numerical range", function() {
			
			// Define a Monster class that extends Object
			var Monster = Function.extend({
				_health: 100
			});

			// A Monster's health is a number between zero and 100
			Monster.prototype.exposeProperty("health", "_health", Fizz.restrict.toRange("_health", [0, 100]));

			// Create a new Monster instance
			var alien = new Monster();

			// Test the restrictions on its 'health' property
			expect(alien.health).toEqual(100);
			alien.health = 92;
			expect(alien.health).toEqual(92);
			alien.health = 200;
			expect(alien.health).toEqual(100);
			alien.health = -15;
			expect(alien.health).toEqual(0);

		});
	});

});	