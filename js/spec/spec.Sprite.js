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
		sprite.spritesheet.on('load', function() {
			expect([ sprite.width, sprite.height ]).toEqual([ 184, 184 ]);
			done();
		});

	});

	it("can be passed an existing HTMLImageElement specifying its " +
	   "spritesheet at instantiation", function(done) {

	   	var spyImage = new Image();

   		spyImage.onload = function() {
		   	sprite = new Fizz.Sprite(spyImage);
			sprite.spritesheet.on('load', function() {
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
		sprite.spritesheet.on('load', function() {

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

		sheet = new Fizz.Spritesheet({
			source: "/suites/assets/spritesheets/tiles.png",
			frames: {
				width: 16,
				height: 16,
				count: 3
			},
			animations: {
				'dirt': 0,
				'grass': 1,
				'stone': 2
			}
		});

		sprite.spritesheet = sheet;

		sprite.gotoAndStop('dirt');
		expect(sprite._currentAnimation.name).toMatch('dirt');
		expect(sprite._currentFrame).toMatch(sprite._currentAnimation.begin);

		sprite.gotoAndStop('grass');
		expect(sprite._currentAnimation.name).toMatch('grass');
		expect(sprite._currentFrame).toMatch(sprite._currentAnimation.begin);

	});

	it("can assume the properties of an existing Sprite", function() {

		sheet = new Fizz.Spritesheet({
			source: "/suites/assets/spritesheets/tiles.png",
			frames: {
				width: 16,
				height: 16,
				count: 3
			},
			animations: {
				'dirt': 0,
				'grass': 1,
				'stone': 2
			}
		});

		var mysteryBlock = new Fizz.Sprite(),
			dirtBlock = new Fizz.Sprite(sheet);

		dirtBlock.gotoAndStop('dirt');
		
		expect(mysteryBlock.spritesheet).toBeNull();

		mysteryBlock.copy(dirtBlock);

		expect(mysteryBlock.spritesheet).toBe(dirtBlock.spritesheet);
		expect(mysteryBlock.currentFrame).toEqual(dirtBlock.currentFrame);
		expect(mysteryBlock.currentAnimation).toEqual(dirtBlock.currentAnimation);
		expect(mysteryBlock).not.toBe(dirtBlock);

	});

	it("can be used to create new Sprites (clones)", function() {

		sheet = new Fizz.Spritesheet({
			source: "/suites/assets/spritesheets/tiles.png",
			frames: {
				width: 16,
				height: 16,
				count: 3
			},
			animations: {
				'dirt': 0,
				'grass': 1,
				'stone': 2
			}
		});

		var block = new Fizz.Sprite(sheet);
			block.gotoAndStop('stop');

		var clone = block.clone();

		expect(clone.spritesheet).toBe(block.spritesheet);
		expect(clone.currentAnimation).toMatch(block.currentAnimation);
		expect(clone.currentFrame).toMatch(block.currentFrame);
		expect(clone).not.toBe(block);

	});

	it("can be represented by a string", function() {
		
		var name = "[Sprite (name='" + sprite.name + "')]";
		expect(sprite.toString()).toMatch(name);

	});

});