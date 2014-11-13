describe("A Point", function() {
		
	var point = null;

	it("is a Point, and extends the native Object", function() {
		point = new Fizz.Point();
		expect(point instanceof Fizz.Point).toBeTruthy();
		expect(point instanceof Object).toBeTruthy();
	});

	it("has an x-coordinate and a y-coordinate", function() {
		point = new Fizz.Point();
		expect(typeof point.x).toMatch("number");
		expect(typeof point.y).toMatch("number");
	});

	it("can have its coordinates re-assigned", function() {
		point = new Fizz.Point();
		point.x = 42;
		point.y = 16;
		expect(point.x).toEqual(42);
		expect(point.y).toEqual(16);
	});

	it("protects its coordinates from invalid assignments", function() {
		point = new Fizz.Point(8,14);
		point.x = "dog";
		point.y = null;
		expect(point.x).toEqual(8);
		expect(point.y).toEqual(14);
	});

	it("gives each of its coordinates a default value of zero", function() {
		point = new Fizz.Point();
		expect(point.x).toEqual(0);
		expect(point.y).toEqual(0);
	});

	it("supports a read-only 'length' value (distance from local origin)", function() {
		point = new Fizz.Point(3,3);
		var distance = Math.sqrt(18);
		expect(point.length).toEqual(distance);
		point.length = 123;
		expect(point.length).toEqual(distance);
	});

	it("can be compared to an existing Point", function() {
		var point1 = new Fizz.Point(33, 66);
		var point2 = new Fizz.Point(33, 66);
		expect(point1.equals(point2)).toBeTruthy();
	});

	it("can assume the properties of an existing Point", function() {
		var point1 = new Fizz.Point(-15,45);
		var point2 = new Fizz.Point();
		point2.copy(point1);
		expect(point2.x).toEqual(-15);
		expect(point2.y).toEqual(45);
	});

	it("can be used to create new Points (clones)", function() {
		var point1 = new Fizz.Point(2,4);
		var point2 = point1.clone();
		expect([point2.x, point2.y]).toEqual([2,4]);
	});

	it("can return itself as an Array object", function() {
		point = new Fizz.Point();
		expect(point.toList()).toEqual([0,0]);
	});

	it("can be represented by a string", function() {
		point = new Fizz.Point(0,0);
		expect(point.toString()).toMatch("[Point (x=0, y=0)]");
	});

});