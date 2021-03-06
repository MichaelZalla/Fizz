describe("A DisplayEntity", function() {

	var entity = null;

	beforeEach(function() {
		entity = new Fizz.DisplayEntity();
		entity.updateCache();
	});

	it("is a DisplayEntity, and extends the Entity class", function() {
		expect(entity instanceof Fizz.DisplayEntity).toBeTruthy();
		expect(entity instanceof Fizz.Entity).toBeTruthy();
	});

	it("has an alpha value with a range restricted to [0.0, 1.0]", function() {
		expect(entity.alpha).toEqual(1.0);
		entity.alpha = 0.5;
		expect(entity.alpha).toEqual(0.5);
		entity.alpha = -1.0;
		expect(entity.alpha).toEqual(0);
	});

	it("can be initialized with a settings object", function() {

		entity = new Fizz.DisplayEntity({
			position: new Fizz.Point(0, 0),
			size: new Fizz.Point(32, 32),
			alpha: 1.0,
			caching: true,
			snapToPixel: false,
		});

		expect(entity.position.toList()).toEqual([0, 0]);
		expect(entity.size.toList()).toEqual([32, 32]);
		expect(entity.alpha).toEqual(1);
		expect(entity.caching).toBeTruthy();
		expect(entity.snapToPixel).toBeFalsy();

	});

	it("can determine whether it is 'visible' within local space", function() {

		// DisplayEntity instance with non-zero dimensions and non-zero alpha
		var entity1 = new Fizz.DisplayEntity({ 'size': [10, 10] });

		expect(entity1.visible).toBeTruthy();

		// DisplayEntity instance with zero area
		var entity2 = new Fizz.DisplayEntity({ 'size': [0, 0] });

		expect(entity2.visible).toBeFalsy();

		// DisplayEntity instance with an x-scale of zero
		var entity3 = new Fizz.DisplayEntity({ 'size': [10, 10] });
			entity3.scale.x = 0;

		expect(entity3.visible).toBeFalsy();

		// DisplayEntity instance with a y-scale of zero
		var entity4 = new Fizz.DisplayEntity({ 'size': [10, 10] });
			entity4.scale.y = 0;

		expect(entity4.visible).toBeFalsy();

		// DisplayEntity instance with an alpha value of zero
		var entity5 = new Fizz.DisplayEntity({ 'size': [10, 10] });
			entity5.scale.y = 0;

		expect(entity5.visible).toBeFalsy();

		// DisplayEntity instance with a false 'exists' value
		var entity6 = new Fizz.DisplayEntity({ 'size': [10, 10] });
			entity6.exists = false;

		expect(entity6.visible).toBeFalsy();

	});

	it("can maintain its own image cache to optimize rendering performance", function() {

		entity = new Fizz.DisplayEntity({ 'size': [50, 50], 'caching': true });

		entity.updateCache();

		// Reaching into 'private' member space for testing
		expect(entity._cacheCanvas).toBeDefined();
		expect(entity._cacheCanvasContext).toBeDefined();

		var previousCacheWidth = entity._cacheCanvas.width;
		entity.size.x = 25;
		entity.updateCache();
		expect(entity._cacheCanvas.width).not.toEqual(previousCacheWidth);

	});

	it("will update its cache based on a '_caching' flag (defaults to true)", function() {

		var context = document.createElement("canvas").getContext('2d');

		// Create an caching instance and a non-caching
		// instance (set cacheImmediately flag to true)

		var entity1 = new Fizz.DisplayEntity({
			'size': [0, 50],
			'caching': true
		});

		var entity2 = new Fizz.DisplayEntity({
			'size': [0, 50],
			'caching': false
		});

		entity1.updateCache();
		entity2.updateCache();

		// Record the original width of both caches
		var previousCacheWidth1 = entity1._cacheCanvas.width;
		var previousCacheWidth2 = entity2._cacheCanvas.width;

		// Update the dimensions of both entities
		entity1.size.x = entity2.size.x = 200;
		entity1.draw__optimized(context); // Should trigger caching
		entity2.draw__optimized(context); // Should not trigger caching

		// Compare old cache dimension to current cache dimension
		expect(previousCacheWidth1).toEqual(entity1._cacheCanvas.width);
		expect(previousCacheWidth2).not.toEqual(entity2._cacheCanvas.width);

	});

	it("exposes the dynamic setter properties 'scaleX' and 'scaleY'", function() {

		expect(entity.scaleX).toEqual(1.0);
		expect(entity.scaleY).toEqual(1.0);

		entity.scale = new Fizz.Point(0.5, 2.5);

		expect(entity.scaleX).toEqual(0.5);
		expect(entity.scaleY).toEqual(2.5);

	});

	it("will update its cache when the entity's scale setters are called", function() {

		var dirtyCache = null;

		entity.size.x = 256;
		entity.size.y = 256;

		//@TODO Should this trigger re-caching automatically?
		entity.updateCache();

		dirtyCache = entity._cacheCanvas;

		entity.scaleX = 0.5; // Cache will update automatically

		expect(entity.scale.x).toEqual(0.5);
		expect(entity._cacheCanvas.width).toEqual(128 + 1);
		expect(entity._cacheCanvas.height).toEqual(256 + 1);

		dirtyCache = entity._cacheCanvas;

		entity.scaleY = 0.5; // Cache will update automatically

		expect(entity.scale.y).toEqual(0.5);
		expect(entity._cacheCanvas.width).toEqual(128 + 1);
		expect(entity._cacheCanvas.height).toEqual(128 + 1);

	});

	it("can assume the properties of an existing DisplayEntity", function() {

		var entity1 = new Fizz.DisplayEntity();
		var entity2 = new Fizz.DisplayEntity({
			'position': [15, -15],
			'size': [32, 32],
			'alpha': 0.25,
			'fillStyle': Fizz.Color.GREEN,
			'strokeStyle': Fizz.Color.BLACK,
			'lineWidth': 2
		});

		entity1.copy(entity2);

		expect(entity1.x).toEqual(entity2.x);
		expect(entity1.y).toEqual(entity2.y);
		expect(entity1.width).toEqual(entity2.width);
		expect(entity1.height).toEqual(entity2.height);
		expect(entity1.alpha).toEqual(entity2.alpha);

		expect(entity1.fillStyle
			.equals(entity2.fillStyle))
			.toBeTruthy();

		expect(entity1.strokeStyle
			.equals(entity2.strokeStyle))
			.toBeTruthy();

		expect(entity1.lineWidth).toEqual(entity2.lineWidth);

	});

	it("can be used to create new DisplayEntities (clones)", function() {

		var entity1 = new Fizz.DisplayEntity({
			'position': [50, 50],
			'size': [5, 5]
		});

		entity1.updateCache();

		var entity2 = entity1.clone();

		expect(entity2.alpha).toEqual(entity1.alpha);

		expect(entity2.lineWidth).toEqual(entity1.lineWidth);

		expect(entity1.fillStyle
			.equals(entity2.fillStyle))
			.toBeTruthy();

		expect(entity1.strokeStyle
			.equals(entity2.strokeStyle))
			.toBeTruthy();

		expect(entity2._cacheCanvas).not.toBe(entity1._cacheCanvas);
		expect(entity2._cacheCanvas.width).toEqual(entity1._cacheCanvas.width);
		expect(entity2._cacheCanvas.height).toEqual(entity1._cacheCanvas.height);
		expect(entity2._cacheCanvasContext.canvas).toBe(entity2._cacheCanvas);

	});

	it("can be represented by a string", function() {
		expect(entity.toString()).toEqual("[DisplayEntity (name='" + entity.name + "')]");
	});

});