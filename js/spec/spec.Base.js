describe("The Base module", function() {

	it("introduces the Fizz library object into the global scope", function() {
		expect(Fizz).toBeDefined();
		expect(window.Fizz).toBeDefined();
		expect(Fizz).toBe(window.Fizz);
	});

	describe("The 'noop' function", function() {

		it("acts as a single referencable instance of an empty function", function() {
			expect(typeof Fizz.noop).toMatch("function");
			expect(Fizz.noop()).toBeUndefined();
		});

	});

	it("gives the Object prototype a method for assigning getters for an " +
	   "object's 'private' properties", function() {
	   		
   		// Create a new class constructor, giving it an empty Function prototype
		var Thing = function(desc) {
			this._description = desc;
		};
		Thing.prototype = new Function();

		// Create a new Thing instance, assigning it a description
		var thing = new Thing("A green box");

		expect(thing.description).toBeUndefined();
		
		// Add a new 'public' getter to the class prototype
		Thing.prototype.exposeProperty("description");
		expect(thing.description).toBeDefined();
		expect(thing.description).toEqual("A green box");

	});

	it("gives the Object prototype a method for assigning getters for dynamic " +
	   "(derived) properties", function() {

		// Create a new class to store timestamps
		var DateClass = function(milliseconds) {
			this._milliseconds = milliseconds;
		};
		DateClass.prototype = new Function();
		DateClass.prototype.exposeProperty("seconds", function() {
			return parseFloat(this._milliseconds / 1000);
		});

		// Create an instance of our new _Date class
		var date = new DateClass(8000);
		expect(date.seconds).toEqual(8);

	});

	it("gives the Object prototype a method for controlling assignments to " +
	   "a class's 'private' data", function() {

		// Define a Person class
		var Person = function(name) {
			// Instead of directly assigning the name input to the instance's
			// private '_firstName' property, we'll use the firstName setter to
			// sanitize name inputs right inside of the class constructor
			this._firstName = "Anonymous";
			this.firstName = name;
		};
		Person.prototype = new Function();
		// A person's first name must be a string, and no longer than 32 characters
		Person.prototype.exposeProperty("firstName", "_firstName", function(value) {
			this._firstName = (typeof value === "string") ? value.substr(0, 32) : this._firstName;
		});

		var person = new Person("Alice");
		expect(person.firstName).toEqual("Alice");

		person.firstName = "Sir Arthur James Reginald Archibald II, Duke of Stratford";
		expect(person.firstName).toEqual("Sir Arthur James Reginald Archibald II, Duke of Stratford".substr(0, 32));

		person.firstName = null;
		expect(person.firstName).toEqual("Sir Arthur James Reginald Archibald II, Duke of Stratford".substr(0, 32));

	});

	it("gives the Object prototype a mechanism for extending existing object classes", function() {

		// Create a new class that extends Object
   		var Point = Object.extend({
   			init: function(x, y) {
   				this._x = 0;
   				this._y = 0;
   				this.x = x;
   				this.y = y;
   			}
   		});

   		// Set up getters and setters for the point's data
   		Point.prototype.exposeProperty("x", "_x", function(value) {
			this._x = (typeof value === "number") ? value : this._x;
		});
		Point.prototype.exposeProperty("y", "_y", function(value) {
			this._y = (typeof value === "number") ? value : this._y;
		});

   		// Create a new Point instance
   		var point = new Point(3, 5);

   		// Ensure that the instance is valid
   		expect(point instanceof Point).toBeTruthy();
   		expect(point instanceof Object).toBeTruthy();

   		// Test that our getters are working correctly
   		expect(point.x).toEqual(3);
		expect(point.y).toEqual(5);

   		// Create a new class that extends Point
		var Circle = Point.extend({
			init: function(x, y, r) {
				Point.prototype.init.call(this, x, y);
				this._r = 0;
				this.r = r;
			}
		});

		// Set up a getter and setter for the circle's radius
		Circle.prototype.exposeProperty("r", "_r", function(value) {
			this._r = (typeof value === "number") ? value : 0;
		});

		// Create a new Circle instance, and ensure that it's valid
		var circle = new Circle(0, 0, 1);
		expect(circle instanceof Circle).toBeTruthy();
		expect(circle instanceof Point).toBeTruthy();
		
		// Test that our getters are working correctly
		expect(circle.r).toEqual(1);
		circle.r = 2;
		expect(circle.r).toEqual(2);
		
	});

	it("allows subclass prototypes to override inherited property restrictions",
		function() {

		// Define the Person class
		var Person = Object.extend({
			init: function(name) {
				this._firstName = "Jane";
				this.firstName = name;
			}
		});
		
		// Restrict the firstName property to be a string
		Person.prototype.exposeProperty("firstName","_firstName",
			Fizz.restrict.toString("_firstName"));

		// Define a subclass of the Person class
		var Employee = Person.extend({
			init: function(name) {
				this._firstName = 327;
				Person.prototype.init.call(this, name);
			}
		});

		// Just another cog in the wheel ...
		Employee.prototype.exposeProperty("firstName", "_firstName",
			Fizz.restrict.toNumber("_firstName"));
		
		// Instantiate a new Employee
		var todd = new Employee(315);
		expect(todd.firstName).toEqual(315);
		
		// Ensure that the inherited restrictions are no longer in effect
		todd.firstName = "Todd";
		expect(todd.firstName).toEqual(315);

	});

	it("gives the Object prototype a method for banishing certain properties " +
	   "from being given to an object", function() {

	   	// Create a new class that extends Object
	   	var Person = Function.extend({
	   		_firstName: "John",
	   		_lastName: "Doe",
	   		init: function(firstName, lastName) {
	   			this._firstName = firstName;
	   			this._lastName = lastName;
	   		}
	   	});

	   	Person.prototype.banishProperty("value"); // Because people are priceless!

	   	// Create a Person instance, and ensure that 'value' is banished
	   	var person = new Person("Jamie", "Lannister");
	   	expect(person.value).toBeUndefined();
	   	person.value = "1000";
	   	expect(person.value).toBeUndefined();

	});

	it("gives the Object prototype a method for returning non-inherited " +
	   "properties", function() {

	   	// expect([1,2,3,4].keys()).toEqual([1,2,3,4]);

	   	var Person = Function.extend({
	   		init: function() { },
	   		eat: function() { },
	   		sleep: function() { }
	   	});

	   	var person = new Person();
	   		person.firstName = "Michael";
	   		person.lastName = "Scott";

	   	// Will skip over props inherited from the prototype chain
	   	expect(person.keys()).toEqual(['firstName', 'lastName']);

	});

	describe("The 'restrict' object", function() {

		window.Point = null;

		beforeEach(function() {
			// Create a new class that extends Object
	   		Point = Function.extend({
	   			_x: 0,
	   			_y: 0,
	   			init: function(x, y) {
	   				this.x = x;
	   				this.y = y;
	   			}
	   		});
	   		// Note that the 'x' and 'y' references would be undefined prior
	   		// to actually exposing those as getter-setter 
		});

		afterEach(function() {
			window.Point = undefined;
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
			   		_coordinates: new Point(0, 0),
			   		init: function(location) {
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

});