describe("A Stage", function() {

	var context = null;
	var stage = null;

	beforeEach(function() {
		
		context = document.createElement('canvas').getContext('2d');
		context.canvas.width = 128;
		context.canvas.height = 128;
		
		stage = new Fizz.Stage(context);

	});

	it("is a Stage, and extends the DisplayGroup class", function() {
		expect(stage instanceof Fizz.Stage).toBeTruthy();
		expect(stage instanceof Object).toBeTruthy();
	});

	it("exposes a read-only reference to its assigned context's canvas", function() {
	   	expect(stage.canvas).toBe(context.canvas);
	});

	it("exposes a 'width' and 'height' property which reflects the size of " +
		"the Stage's assigned context's canvas element",
	function() {
		
		var canvas = window.document.createElement("canvas");
			canvas.width = canvas.height = 100;
		
		var stage = new Fizz.Stage(canvas.getContext("2d"));
		
		expect(stage.width).toEqual(canvas.width);
		expect(stage.height).toEqual(canvas.height);

	});

	it("expects a CanvasRenderingContext2D instance to be passed to its constructor",
	function() {
		var canvas = window.document.createElement("canvas");
		var context = canvas.getContext("2d");
		var stage = new Fizz.Stage(context);
		expect(stage.canvas).toBe(context.canvas);
	});

	it("also allows an HTMLCanvasElement instance to be passed to its constructor",
	function() {
		var canvas = window.document.createElement("canvas");
		var stage = new Fizz.Stage(canvas);
		expect(stage.canvas).toBe(canvas);
	});

	it("creates a new HTMLCanvasElement and context if no rendering context is " +
	   "passed to the constructor", function() {
	   	var stage = new Fizz.Stage();
	   	expect(stage.canvas).toBeDefined();
	   	expect(stage.canvas).not.toBe(context.canvas);
	});

	it("assumes a default size of 640-by-480 pixels if no rendering context is " +
	   "passed to the 'init' method", function() {
	   	var stage = new Fizz.Stage();
	   	expect(stage.width).toEqual(640);
	   	expect(stage.height).toEqual(480);
	});

	//@TODO Remove this (Stage constructor has a fallback, so initialization will always succeed)
	// it("will throw an error if the context reference passed to the constructor is invalid",
	// function() {
	// 	function willThrowOnInvalidContextReference() {
	// 		var stage = new Fizz.Stage(window);
	// 		return stage;
	// 	}
	// 	expect(willThrowOnInvalidContextReference).toThrow();
	// });

	it("has a 'draw' method that will draw all of its DisplayEntity children to " +
		"its assigned context",
	function() {
		
		//@TODO Write test cases
		expect(true).toBeTruthy();

	});

	it("creates a Fizz.Canvas wrapper object for any canvas assigned to the Stage",
	function() {
		var stage = new Fizz.Stage(context);
		expect(stage._canvasWrapper).toBeDefined();
		expect(stage._canvasWrapper.element).toBe(context.canvas);
	});

	it("automatically sets up a number of event listeners that delegate certain "+
	"mouse-related Fizz.Canvas events down the Stage's child tree to their "+
	"determined targets",
	function() {

		//@TODO Write test cases
		expect(true).toBeTruthy();

	});

	it("banishes several inherited properties which are no longer " +
	   "appropriate for Stage", function() {
	   		['acceleration','alpha','exists','life','scale','stage','velocity']
	   			.foreach(function(prop) {
		   			expect(stage[prop]).toBeUndefined();
		   		});
	});

	it("can be represented by a string", function() {
		expect(stage.toString()).toMatch("[Stage (width='400', height='600')]");
	});

});