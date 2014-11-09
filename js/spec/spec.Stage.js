describe("A Stage", function() {

	var context = null;
	var stage = null;

	beforeEach(function() {
		context = document.createElement('canvas').getContext('2d');
		stage = new Fizz.Stage(context);
	});

	it("exposes a read-only reference to its assigned context's canvas", function() {
	   	expect(stage.canvas).toBe(context.canvas);
	});

	it("creates a new HTMLCanvasElement and context if no rendering context is " +
	   "passed to the 'init' method", function() {

	   	var defaultStage = new Fizz.Stage();
	   	expect(defaultStage.canvas).toBeDefined();
	   	expect(defaultStage.canvas).not.toBe(context.canvas);

	});

	it("assumes a default size of 600x400 pixels if no rendering context is " +
	   "passed to the 'init' method", function() {

	   	var defaultStage = new Fizz.Stage();
	   	expect(defaultStage.width).toEqual(600);
	   	expect(defaultStage.height).toEqual(400);

	});

	// Pretty print framerate
	var framerate = Fizz.Stage.DEFAULT_FRAME_RATE;
		framerate = framerate.toString().split('.');
		framerate = framerate[0] + '.' + framerate[1].substr(0,2);

	it("exposes a read-only 'framerate' property which defaults to " +
	   framerate + " frames per second", function() {
	   	expect(stage.framerate).toBeDefined();
	   	expect(stage.framerate).toEqual(Fizz.Stage.DEFAULT_FRAME_RATE);
	});

	it("banishes several inherited properties which are no longer " +
	   "appropriate for Stage", function() {

	   		var banished = [
	   			'parent',
	   			'stage',
	   			'exists',
	   			'life',
	   			'scale',
	   			'velocity',
	   			'acceleration',
	   			'density',
	   			'alpha'
	   		];

	   		banished.forEach(function(prop) {
	   			expect(stage[prop]).toBeUndefined();
	   		});

	});

	it("can be represented by a string", function() {
		expect(stage.toString()).toMatch("[Stage (width='400', height='600')]");
	});

});