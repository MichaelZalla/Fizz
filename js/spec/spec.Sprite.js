describe("A Sprite", function() {

	var sheet = null,
		sprite = null;

	beforeEach(function() {
		sheet = new Fizz.Spritesheet();
		sprite = new Fizz.Sprite(sheet);
	});

	it("is a Sprite, and extends the DisplayEntity class", function() {
		
		expect(sprite instanceof Fizz.Sprite).toBeTruthy();
		expect(sprite instanceof Fizz.DisplayEntity).toBeTruthy();

	});

	it("can be passed a URI specifying its spritesheet at instantiation",
	function(done) {

		sprite = new Fizz.Sprite("/suites/assets/spritesheets/spy.png");
		sprite.spritesheet.on('load', function(e) {
			expect([ sprite.width, sprite.height ]).toEqual([ 184, 184 ]);
			done();
		});

	});

	it("can be passed an existing HTMLImageElement specifying its " +
	   "spritesheet at instantiation", function(done) {

	   	var spyImage = new Image();

   		spyImage.onload = function(e) {
		   	sprite = new Fizz.Sprite(spyImage);
			sprite.spritesheet.on('load', function(e) {
				expect([ sprite.width, sprite.height ]).toEqual([ 184, 184 ]);
				done();
			});
   		};

   		spyImage.src = "/suites/assets/spritesheets/spy.png";

	});

	it("accepts a settings object to configure the Sprite at instantiation",
	function() {

	   	sprite = new Fizz.Sprite({
	   		spritesheet: sheet,
	   		caching: true,
			snapToPixel: true,
			velocity: new Fizz.Point(8,8),
			density: 0
	   	});

	   	expect(sprite.spritesheet).toBe(sheet);
	   	expect(sprite.caching).toBeTruthy();
	   	expect(sprite.snapToPixel).toBeTruthy();

	});

	it("can be re-assigned its spritesheet after being instantiated",
	function() {

		sprite = new Fizz.Sprite();
		expect(sprite.spritesheet).toBeNull();
		sprite.spritesheet = new Fizz.Spritesheet();
		expect(sprite.spritesheet).not.toBeNull();

	});

	//@TODO Write unit tests for cache creation and updates

	it("offers 'play' and 'stop' methods for controllings its playback",
	function() {

		expect(sprite.paused).toBeTruthy();
		sprite.play();
		expect(sprite.paused).toBeFalsy();
		sprite.stop();
		expect(sprite.paused).toBeTruthy();

	});

	it("offers 'gotoAndPlay' and 'gotoAndStop' methods for changing " +
	   "the current (animation) frame", function(done) {

		sheet = new Fizz.Spritesheet({
			source: "/suites/assets/spritesheets/tiles.png",
			frames: {
				width: 16,
				height: 16,
				count: 3
			}
		});

		sprite.scale.x = 8;
		sprite.scale.y = 8;
		
		sprite.spritesheet = sheet;
		sprite.spritesheet.on('load', function(e) {

			sprite.updateCache(); // Get initial frame cache
			expect(sprite._currentFrame).toEqual(0);
			sprite.gotoAndStop(1);
			expect(sprite._currentFrame).toEqual(1);
			sprite.gotoAndPlay(2);
			expect(sprite._currentFrame).toEqual(2);
			
			done();

		});

	});

	it("offers methods for changing its current animation", function() {

		//@TODO Write unit test

	});

	it("can assume the properties of an existing Sprite", function() {

		//@TODO Write unit test

	});

	it("can be used to create new Sprites (clones)", function() {

		//@TODO Write unit test

	});

	it("can be represented by a string", function() {
		
		var name = "[Sprite (name='" + sprite.name + "')]";
		expect(sprite.toString()).toMatch(name);

	});

});