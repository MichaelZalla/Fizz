describe("A RAFRenderer (RequestAnimationFrame Renderer)", function() {

	var canvas = null,
		stage = null,
		renderer = null;

	beforeEach(function() {
		canvas = window.document.createElement("canvas");
		stage = new Fizz.Stage(canvas.getContext("2d"));
		renderer = new Fizz.RAFRenderer(stage);
	});

	afterEach(function() {
		canvas = stage = renderer = null;
	});

	it("has a 'stage' property that can be used to re-assign the renderer's " +
	   "stage instance, which it uses to render its frames to a canvas", function() {
		
		expect(renderer.stage instanceof Fizz.Stage).toBeTruthy();
		expect(renderer.stage).toBe(stage);
		
		// Go home renderer, you're drunk
		renderer.stage = "foosball";
		expect(renderer.stage).toBe(stage);

	});

	it("has a 'framerate' property that can be used to set a target render rate", function() {
		expect(typeof renderer.framerate).toMatch("number");
	});

	it("has a 'logFPS' flag that can be set to a boolean", function() {
		expect(typeof renderer.logFPS).toMatch("boolean");
		expect(renderer.logFPS).toBeFalsy();
		renderer.logFPS = true;
		expect(renderer.logFPS).toBeTruthy();
	});

	it("can have its 'stage', 'framerate', and 'logFPS' values passed to its constructor", function() {
		
		var stage2 = new Fizz.Stage(canvas.getContext("2d"));
		var framerate = (1000 / 30);
		var logFPS = true;
		var renderer = new Fizz.RAFRenderer(stage2, framerate, logFPS);

		expect(renderer.stage).toBe(stage2);
		expect(renderer.framerate).toEqual(1000 / 30);
		expect(renderer.logFPS).toBeTruthy();

	});

	it("has a read-only 'rendering' property describing its activity", function() {
		expect(typeof renderer.rendering).toMatch("boolean");
	});

	it("has a read-only 'actualFramerate' property that holds the number " +
	   "of milliseconds between the two most-recent render callbacks", function() {
	   	expect(typeof renderer.actualFramerate).toMatch("number");
	   	expect(renderer.actualFramerate).toEqual(0);
	});

	it("defaults to a target render rate of 60 frames per seconds if an " +
	   "alternative framerate was not specified at instantiation", function() {
	   	expect(renderer.framerate).toEqual(Fizz.RAFRenderer.DEFAULT_FRAME_RATE);
	   	expect(renderer.framerate).toEqual(1000 / 60);
	});

	it("will not begin rendering the stage's contents to its contexts by default", function() {
		expect(renderer.rendering).toBeFalsy();
	});

	it("has a 'startRendering' method and 'stopRendering' method", function() {
		renderer.startRendering();
		expect(renderer.rendering).toBeTruthy();
		renderer.stopRendering();
		expect(renderer.rendering).toBeFalsy();
	});

	it("Sets a low-bound of 10ms on its framerate value for consistent browser behavior", function() {
		expect(renderer.framerate).toEqual(1000 / 60);
		renderer.framerate = 10;
		expect(renderer.framerate).toEqual(10);
		renderer.framerate = 1;
		expect(renderer.framerate).toEqual(10);
	});

	it("can be represented by a string", function() {
		expect(renderer.toString()).toMatch("[RAFRenderer " +
			"(rendering='true', framerate='16.66', logFPS='false')]");
	});

});