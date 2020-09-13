describe("A Sprite", function() {

	var sheet = null,
		sprite = null;

	beforeEach(function() {
		sheet = new Fizz.Spritesheet();
		sprite = new Fizz.Sprite(sheet);
	});

	it("is a Sprite, and extends the Graphic class", function() {
		expect(sprite instanceof Fizz.Sprite).toBeTruthy();
		expect(sprite instanceof Fizz.Graphic).toBeTruthy();
	});

	it("accepts a settings object to configure the Sprite at instantiation",
	function() {

	   	sprite = new Fizz.Sprite({
	   		spritesheet: sheet,
			velocity: new Fizz.Point(8,8),
	   		caching: true
	   	});

	   	expect(sprite.spritesheet).toBe(sheet);
	   	expect(sprite.velocity.equals(new Fizz.Point(8,8))).toBeTruthy();
	   	expect(sprite.caching).toBeTruthy();

	});

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
			source: "assets/spec/spritesheets/tiles.png",
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

			// Get initial frame cache
			sprite.updateCache();
			expect(sprite.texture).toEqual(0);

			sprite.gotoAndStop(1);
			expect(sprite.texture).toEqual(1);

			sprite.gotoAndPlay(2);
			expect(sprite.texture).toEqual(2);
			
			done();

		});

	});

	it("offers methods for changing its current animation", function() {

		sheet = new Fizz.Spritesheet({
			source: "assets/spec/spritesheets/tiles.png",
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
		expect(sprite.currentAnimation.name).toMatch('dirt');
		expect(sprite.texture).toMatch(sprite.currentAnimation.begin);

		sprite.gotoAndStop('grass');
		expect(sprite.currentAnimation.name).toMatch('grass');
		expect(sprite.texture).toMatch(sprite.currentAnimation.begin);

	});

	it("can assume the properties of an existing Sprite", function() {

		sheet = new Fizz.Spritesheet({
			source: "assets/spec/spritesheets/tiles.png",
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
		expect(mysteryBlock.texture).toEqual(dirtBlock.texture);
		expect(mysteryBlock.currentAnimation).toEqual(dirtBlock.currentAnimation);
		expect(mysteryBlock).not.toBe(dirtBlock);

	});

	it("can be used to create new Sprites (clones)", function() {

		sheet = new Fizz.Spritesheet({
			source: "assets/spec/spritesheets/tiles.png",
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
		expect(clone.texture).toMatch(block.texture);
		expect(clone).not.toBe(block);

	});

	it("can be represented by a string", function() {
		var name = "[Sprite (name='" + sprite.name + "')]";
		expect(sprite.toString()).toMatch(name);
	});

});