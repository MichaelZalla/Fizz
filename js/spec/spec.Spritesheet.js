describe("A Spritesheet", function() {

	var sheet = null,
		uri = "/suites/assets/spritesheets/tiles.png";

	beforeEach(function(done) {
		sheet = new Fizz.Spritesheet(uri);
		sheet.addEventListener('load', done);
	});

	it("is a Spritesheet, and extends the native Object", function() {
		expect(sheet instanceof Fizz.Spritesheet).toBeTruthy();
		expect(sheet instanceof Object).toBeTruthy();
	});

	it("has a 'source' property that references the image " +
	   "file's URI", function() {
		expect(sheet.source).toEqual(uri);
	});

	it("will attempt to load its assigned source image once " +
	   "instantiated", function() {
		expect(sheet.sourceWidth).toEqual(128);
		expect(sheet.sourceHeight).toEqual(128);
	});

	it("maintains a 'loaded' property which is set on a " +
	   "successful image load", function(done) {
		
		sheet = new Fizz.Spritesheet();
		expect(sheet.loaded).toBeFalsy();

		sheet.source = uri;
		sheet.addEventListener('load', function() {
			expect(sheet.loaded).toBeTruthy();
			done();
		});

	});

	it("will throw an Error if the requested source image " +
	   "can't be found", function(done) {
		
	   	sheet = new Fizz.Spritesheet("In a galaxy far, far away ...");
	   	sheet.addEventListener('error', function(e) {
	   		expect(e.type).toEqual('error');
	   		done();
	   	});

	});

	it("can determine the height and width of its assigned sourceImage", function() {
		expect(sheet.sourceWidth).toEqual(128);
		expect(sheet.sourceHeight).toEqual(128);
	});

	it("can load a different image to replace its current image", function(done) {
		
		expect(sheet.sourceWidth).toEqual(128);
		sheet.source = "/suites/assets/spritesheets/spy.png";
		sheet.addEventListener('load', function() {
			expect(sheet.sourceWidth).toEqual(184);
			done();
		});

	});

	it("can be instantiated using a settings object", function() {
		
		sheet = new Fizz.Spritesheet({
			source: uri,
			foo: 'bar',
			baz: true
		});

		expect(sheet.source).toEqual(uri);

	});

	it("can have frames defined in the settings object", function(done) {
		
		sheet = new Fizz.Spritesheet({
			source: uri,
			frames: [
				[ 0, 0, 16, 16],
				[16, 0, 16, 16],
				[32, 0, 16, 16]
			]
		});

		sheet.addEventListener('load', function() {
			
			expect(this.getFrame(0)).toBeDefined();
			expect(this.getFrame(1)).toBeDefined();
			expect(this.getFrame(2)).toBeDefined();
			expect(this.getFrame(-1)).toBeNull();
			expect(this.getFrame(3)).toBeNull();
			
			expect(this.getFrame(0).width).toEqual(16);
			expect(this.getFrame(0).height).toEqual(16);

			done();

		});

	});

	it("can have animations defined in the settings object", function(done) {
		
		sheet = new Fizz.Spritesheet({
			source: uri,
			frames: [
				[ 0, 0, 16, 16],
				[16, 0, 16, 16],
				[32, 0, 16, 16]
			],
			animations: {
				"jump": [0, 2]
			}
		});

		sheet.addEventListener('load', function() {
			expect(sheet.getAnimation('jump').begin).toEqual(0);
			expect(sheet.getAnimation('jump').end).toEqual(2);
			done();
		});

	});
	
	it("can return a specific frame as a Canvas instance", function(done) {

		sheet = new Fizz.Spritesheet({
			source: uri,
			frames: [ [0, 0, 16, 16] ]
		});

		sheet.addEventListener('load', function() {
			var frame = sheet.getFrame(0);
			expect(frame instanceof HTMLCanvasElement).toBeTruthy();
			done();
		});

	});

	it("can be represented by a string", function() {
		expect(sheet.toString()).toEqual("[Spritesheet (source='" + uri + "')]");
	});

});