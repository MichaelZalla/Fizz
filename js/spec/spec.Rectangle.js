describe("A Rectangle", function() {
	
	var rect = null;

	it("is a Rectangle, and extends the native Object", function() {
		point = new Fizz.Rectangle();
		expect(point instanceof Fizz.Rectangle).toBeTruthy();
		expect(point instanceof Object).toBeTruthy();
	});

	it("has a position property and a size property", function() {
		rect = new Fizz.Rectangle();
		expect(rect.position.equals(new Fizz.Point(0, 0))).toBeTruthy();
		expect(rect.size.equals(new Fizz.Point(0, 0))).toBeTruthy();
	});

	it("exposes dynamic 'x' and 'y' values derived from the instance's position", function() {
		rect = new Fizz.Rectangle();
		expect(typeof rect.x).toMatch("number");
		expect(typeof rect.y).toMatch("number");
	});

	it("exposes dynamic 'width' and 'height' values derived from the instance's size", function() {
		rect = new Fizz.Rectangle();
		expect(typeof rect.width).toMatch("number");
		expect(typeof rect.height).toMatch("number");
	});

	it("can have its position coordinates re-assigned after creation", function() {
		
		rect = new Fizz.Rectangle(new Fizz.Point(10, 10), new Fizz.Point(64, 64));

		expect(rect.x).toEqual(10);
		expect(rect.y).toEqual(10);
		
		rect.x = 32;
		rect.y = 32;
		
		expect(rect.x).toEqual(32);
		expect(rect.y).toEqual(32);

	});

	it("can have its size (dimensions) reassigned after creation", function() {
		
		rect = new Fizz.Rectangle();

		expect(rect.width).toEqual(0);
		expect(rect.height).toEqual(0);
		
		rect.width = 128;
		rect.height = 128;
		
		expect(rect.width).toEqual(128);
		expect(rect.height).toEqual(128);

	});

	it("protects its position and size values from invalid assignments", function() {
		
		rect = new Fizz.Rectangle(new Fizz.Point(8, 16), new Fizz.Point(40, 40));
		
		expect(rect.x).toEqual(8);
		expect(rect.y).toEqual(16);
		expect(rect.width).toEqual(40);
		expect(rect.height).toEqual(40);
		
		rect.x = "dog";
		rect.y = new Function();
		rect.width = false;
		rect.height = [1,2,3];

		expect(rect.x).toEqual(8);
		expect(rect.y).toEqual(16);
		expect(rect.width).toEqual(40);
		expect(rect.height).toEqual(40);

	});

	it("can be initialized with position and size as coordinate-lists", function() {
		rect = new Fizz.Rectangle([30,30],[25,50]);
		expect(rect.position.equals(new Fizz.Point(30, 30))).toBeTruthy();
		expect(rect.size.equals(new Fizz.Point(25, 50))).toBeTruthy();
	});

	it("can determine whether it overlaps an existing Point", function() {
		
		rect = new Fizz.Rectangle(new Fizz.Point(0, 0), new Fizz.Point(20, 20));
		
		var overlapping = [ ];
			overlapping.push(new Fizz.Point(0, 0));
			overlapping.push(new Fizz.Point(10, 10));
			overlapping.push(new Fizz.Point(20, 20));
		
		overlapping.foreach(function(p) {
			expect(rect.intersects(p)).toBeTruthy();
		});
		
		var nonOverlapping = [ ];
			nonOverlapping.push(new Fizz.Point(-5, 10));
			nonOverlapping.push(new Fizz.Point(10, -5));
			nonOverlapping.push(new Fizz.Point(21, 21));
		
		nonOverlapping.foreach(function(p) {
			expect(rect.intersects(p)).toBeFalsy();
		});

	});

	it("can determine whether it overlaps an existing Rectangle", function() {
		var rect1 = new Fizz.Rectangle(new Fizz.Point(0, 0), new Fizz.Point(50, 50));
		var rect2 = new Fizz.Rectangle(new Fizz.Point(25, 25), new Fizz.Point(75, 75));
		var rect3 = new Fizz.Rectangle(new Fizz.Point(51, 51), new Fizz.Point(10, 10));
		expect(rect1.intersects(rect2)).toBeTruthy();
		expect(rect1.intersects(rect3)).toBeFalsy();
	});

	it("can assume the properties of an existing Rectangle", function() {
		var rect1 = new Fizz.Rectangle(new Fizz.Point(2, 2), new Fizz.Point(10, 10));
		var rect2 = new Fizz.Rectangle();
		rect2.copy(rect1);
		expect(rect2.position.toList()).toEqual([2, 2]);
		expect(rect2.size.toList()).toEqual([10, 10]);
	});

	it("can be used to create new Rectangles (clones)", function() {
		var rect1 = new Fizz.Rectangle(new Fizz.Point(0, 0), new Fizz.Point(2,4));
		var rect2 = rect1.clone();
		expect(rect2.position.toList()).toEqual([0, 0]);
		expect(rect2.size.toList()).toEqual([2, 4]);
	});

	it("can be represented as a string", function() {
		point = new Fizz.Rectangle();
		expect(point.toString()).toMatch("[Point (x=0, y=0, width=0, height=0)]");
	});

});