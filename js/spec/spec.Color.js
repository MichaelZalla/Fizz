describe("A Color", function() {

	var color = null;

	it("is a Color, and extends the native Object", function() {
		color = new Fizz.Color("#000000");
		expect(color instanceof Fizz.Color).toBeTruthy();
		expect(color instanceof Object).toBeTruthy();
	});

	it("has a set of (r,g,b) values describing the color's hue", function() {
		color = new Fizz.Color();
		expect(color.r).toBeDefined();
		expect(color.g).toBeDefined();
		expect(color.b).toBeDefined();
	});

	it("has an alpha value with a range restricted to [0.0, 1.0]", function() {
		
		color = new Fizz.Color();
		expect(color.alpha).toBeDefined();
		
		color.alpha = 1;
		expect(color.alpha).toEqual(1);

		color.alpha = 0;
		color.alpha = "transparent-ish";
		expect(color.alpha).toEqual(0);

	});

	it("represents black by default", function() {
		color = new Fizz.Color();
		expect(color.r).toEqual(0);
		expect(color.g).toEqual(0);
		expect(color.r).toEqual(0);
		expect(color.alpha).toEqual(1);
	});

	it("can be instantiated with a list of arguments (or an array)", function() {
		
		color = new Fizz.Color(255,255,255);
		expect(color.r === color.g &&
			   color.g === color.b &&
			   color.b === 255).toBeTruthy();

		color = new Fizz.Color([50, 150, 75]);
		expect(color.r).toEqual(50);
		expect(color.g).toEqual(150);
		expect(color.b).toEqual(75);

	});

	it("can be instantiated using a hexadecimal string", function() {
		color = new Fizz.Color('#FFFFFF');
		expect(color.r === color.g &&
			   color.r === color.b &&
			   color.b === 255).toBeTruthy();
	});

	it("can have an existing hue added to its hue", function() {
		var color1 = new Fizz.Color(10,10,10);
		var color2 = new Fizz.Color(50,75,100);
		expect(color1.add(color2).toList()).toEqual([60,85,110]);
	});

	it("can have an existing hue substracted from its hue", function() {
		var color1 = new Fizz.Color(50,75,100);
		var color2 = new Fizz.Color(10,10,10);
		expect(color1.subtract(color2).toList()).toEqual([40,65,90]);
	});

	it("can be tested for equality with an existing color", function() {
		var color1 = new Fizz.Color(33,66,99);
		var color2 = new Fizz.Color(33,66,99);
		var color3 = new Fizz.Color(34,67,100);
		expect(color1.equals(color2)).toBeTruthy();
		expect(color1.equals(color3)).toBeFalsy();
		expect(color2.equals(color3)).toBeFalsy();
	});

	it("can assume the properties of an existing color", function() {
		var color1 = new Fizz.Color(255,0,255);
		var color2 = new Fizz.Color();
			color2.copy(color1);
		expect(color2.equals(color1)).toBeTruthy();
	});

	it("can be used to create new colors (clones)", function() {
		var color1 = new Fizz.Color(33,66,99);
		var color2 = color1.clone();
		expect(color1.equals(color2)).toBeTruthy();
	});

	it("can supply its RGB(a) values as a list", function() {
		color = new Fizz.Color(33,66,99);
		expect(color.toList()).toEqual([33,66,99]);
	});

	it("can be represented as an RGB(a) string", function() {
		color = new Fizz.Color(33,66,99);
		expect(color.toRGB()).toEqual("rgb(33,66,99)");
	});

	it("can be represented by a hexadecimal string", function() {
		color = new Fizz.Color(255,255,255);
		expect(color.toHex()).toEqual("#ffffff");
	});

	it("can be represented by a string", function() {
		color = new Fizz.Color();
		expect(color.toString()).toEqual("[Color (0,0,0,1)]");
	});

});

describe("The Color constructor", function() {

	it("exposes dynamic getters for several pre-defined Color " +
	   "configurations", function() {

	   	var black = Fizz.Color.BLACK;
	   	var white = Fizz.Color.WHITE;
	   	expect(black.toList()).toEqual([0, 0, 0]);
	   	expect(white.toList()).toEqual([255, 255, 255]);

	});

	it("yields copies of these configurations which won't " +
	   "modify them", function() {

	   	var violet = Fizz.Color.CYAN;
	   		violet.r = 255;
	   	
	   	expect(violet.toList()).not.toEqual(Fizz.Color.CYAN.toList());

	});

});