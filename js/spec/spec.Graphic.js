describe("A Graphic", function() {

	var spritesheet = null,
		graphic = null;

	beforeEach(function(done) {

		// Create a sample spritesheet
		spritesheet = new Fizz.Spritesheet({
			source: 'assets/spec/spritesheets/tiles.png',
			frames: {
				'width': 16,
				'height': 16,
				'count': 3
			}
		});

		// Create a graphic using the spritesheet
		graphic = new Fizz.Graphic({ 'spritesheet': spritesheet });

		// Run tests when spritesheet data has loaded
		spritesheet.on('load', done);

	});

	it("is a Graphic, and extends the DisplayEntity class", function() {
		expect(graphic instanceof Fizz.Graphic).toBeTruthy();
		expect(graphic instanceof Fizz.DisplayEntity).toBeTruthy();
	});

	it("will render as a blue bounding-box when no spritesheet data is available",
	function() {
		expect(graphic.fillStyle.equals(Fizz.Color.CLEAR)).toBeTruthy();
		expect(graphic.strokeStyle.equals(Fizz.Color.CYAN)).toBeTruthy();
		expect(graphic.lineWidth).toEqual(2);
	});

	it("can be instantiated from an existing Spritesheet object", function() {
		expect(graphic.spritesheet).toBe(spritesheet);
	});

	it("can be instantiated with a URI", function(done) {
		
		var uri = "assets/spec/spritesheets/spy.png";
		
		graphic = new Fizz.Graphic(uri);

		graphic.spritesheet.on('load', function() {

			expect(graphic.spritesheet instanceof Fizz.Spritesheet).toBeTruthy();
			expect(graphic.spritesheet.source).toMatch(uri);

			expect(graphic.width).toEqual(184);
			expect(graphic.height).toEqual(184);

			done();
			
		});

	});

	it("can be instantiated from an existing Image object", function(done) {

		var uri = "assets/spec/spritesheets/spy.png",
			spy = new Image(),
			graphic = null;

		spy.src = uri;

		graphic = new Fizz.Graphic(spy);

		// When the spritesheet data is available, 
		graphic.spritesheet.on('load', function() {

			expect(graphic.spritesheet instanceof Fizz.Spritesheet).toBeTruthy();
			expect(graphic.spritesheet.source).toMatch(uri);

			expect(graphic.width).toEqual(184);
			expect(graphic.height).toEqual(184);

			done();

		});

	});

	it("can be instantiated using a settings object", function() {

		var grass = new Fizz.Graphic({ spritesheet: spritesheet, texture: 1 });

		expect(grass.spritesheet).toBe(spritesheet);
		expect(grass.texture).toEqual(1);

		expect(grass.width).toEqual(16);
		expect(grass.height).toEqual(16);

	});

	it("can have its Spritesheet re-assigned after creation", function() {

		expect(graphic.spritesheet).toBe(spritesheet);

		var spysheet = new Fizz.Spritesheet("assets/spec/spritesheets/spy.png");

		graphic.spritesheet = spysheet;
		
		expect(graphic.spritesheet).not.toBe(spritesheet);
		expect(graphic.spritesheet).toBe(spysheet);

	});

	it("exposes the read-only property 'texture', which is an index value", function() {

		expect(graphic.texture).toEqual(0);
		graphic.texture = 2;
		expect(graphic.texture).toEqual(2);

	});

	it("defaults to a native scale of (1, 1)", function() {
		expect(graphic.scale.toList()).toEqual(Fizz.Graphic.NATIVE_SCALE.toList());
	});

	it("will use its assigned Spritesheet's texture cache for as long as possible", function() {

		var i;

		for(i = 0; i < 10; i++) {
			graphic.texture = 0;
			expect(graphic._localTexturesCache[graphic.texture])
				.toBe(spritesheet._framesCache[graphic.texture]);
		}

		for(i = 0; i < 10; i++) {
			graphic.texture = 1;
			expect(graphic._localTexturesCache[graphic.texture])
				.toBe(spritesheet._framesCache[graphic.texture]);
		}

	});

	it("will create a new local cache for its texture when the Graphic is scaled", function() {

		var dirtyCache = null;

		graphic.scaleX = 1;
		graphic.scaleY = 1;

		expect(graphic._localTexturesCache[graphic.texture])
			.toBe(spritesheet._framesCache[graphic.texture]);

		// Update the dirty cache reference
		dirtyCache = graphic._localTexturesCache[graphic.texture];

		graphic.scaleX = 2;
		expect(graphic._localTexturesCache[graphic.texture]).not.toBe(dirtyCache);

		// Update the dirty cache reference
		dirtyCache = graphic._localTexturesCache[graphic.texture];

		graphic.scaleY = 3;
		expect(graphic._localTexturesCache[graphic.texture]).not.toBe(dirtyCache);

	});

	it("can assume the properties of an existing Graphic", function() {

		var graphic1 = new Fizz.Graphic();
		var graphic2 = new Fizz.Graphic({ 'spritesheet': spritesheet, 'texture': 2 });

		graphic1.copy(graphic2);

		expect(graphic1.spritesheet).toBe(graphic2.spritesheet);
		expect(graphic1.texture).toBe(graphic2.texture);

	});

	it("can be used to create new Graphics (clones)", function() {

		var clone = graphic.clone();
		expect(clone.spritesheet).toBe(graphic.spritesheet);
		expect(clone.texture).toBe(graphic.texture);

	});

	it("can be represented by a string", function() {
		expect(graphic.toString()).toMatch("[Graphic (name='" + this.name + "')]");
	});

});