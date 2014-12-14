describe("An Entity", function() {

	var entity = null;

	it("is an Entity, and extends the Rectangle class", function() {
		entity = new Fizz.Entity();
		expect(entity instanceof Fizz.Entity).toBeTruthy();
		expect(entity instanceof Fizz.Rectangle).toBeTruthy();
	});

	it("is given a unique global identifier during instantiation", function() {
		entity = new Fizz.Entity();
		expect(typeof Fizz.UID.get()).toMatch("number");
		expect(Fizz.UID.get()).toBeGreaterThan(-1);
	});

	it("is given an empty instance name during instantiation", function() {
		entity = new Fizz.Entity();
		expect(entity.name).toMatch('');
	});

	it("exists by default", function() {
		entity = new Fizz.Entity();
		expect(entity.exists).toBeTruthy();
	});

	it("is given a default lifespan of Infinity", function() {
		entity = new Fizz.Entity();
		expect(entity.life).toEqual(Infinity);
		expect(entity.exists).toBeTruthy();
	});

	it("has an 'update' method which is used to advance its state by a time delta", function() {
		
		entity = new Fizz.Entity();
		entity.velocity = new Fizz.Point(2,-2);
		entity.update(1);

		expect(entity.x).toEqual(2);
		expect(entity.y).toEqual(-2);

	});

	it("has its lifespan decremented with every call to its 'update' method", function() {
		
		entity = new Fizz.Entity();
		expect(entity.exists).toBeTruthy();
		
		entity.life = 1;
		entity.update();
		
		expect(entity.life).toEqual(0);
		expect(entity.exists).toBeFalsy();
		
	});

	it("can be given a parent Entity", function() {
		
		var entity1 = new Fizz.Entity(new Fizz.Point(10,10));
		var entity2 = new Fizz.Entity(new Fizz.Point(20, 25));
		
		entity1.parent = entity2;
		expect(entity1.parent).toBe(entity2);

	});

	it("can use its parent-chain to determine its position in global space", function() {
		
		// Instantiate a set of Entities
		var entity1 = new Fizz.Entity(new Fizz.Point(10,10));
		var entity2 = new Fizz.Entity(new Fizz.Point(20, 25));
		var entity3 = new Fizz.Entity(new Fizz.Point(-50, 300));
		
		// Set up a parent-chain between the Entities
		entity3.parent = entity2;
		entity2.parent = entity1;
		
		// Test global space resolution
		expect(entity1.globalPosition.equals(new Fizz.Point(10, 10))).toBeTruthy();
		expect(entity2.globalPosition.equals(new Fizz.Point(30, 35))).toBeTruthy();
		expect(entity3.globalPosition.equals(new Fizz.Point(-20, 335))).toBeTruthy();

	});

	it("can use its parent-chain to resolve its 'stage' instance, if one exists", function() {
		entity = new Fizz.Entity();
		expect(entity.stage).toBeNull();
	});

	it("can determine whether its bounding box intersects with that of an " +
	   "existing Entity in global space", function() {
		
		var entity1 = new Fizz.Entity(new Fizz.Point(10,10), new Fizz.Point(20, 20));
		var entity2 = new Fizz.Entity(new Fizz.Point(15,15), new Fizz.Point(20, 20));
		var entity3 = new Fizz.Entity(new Fizz.Point(45,45), new Fizz.Point(20, 20));
		
		// Test first entity
		expect(entity1.intersects(entity2)).toBeTruthy();
		expect(entity1.intersects(entity3)).toBeFalsy();
		
		// Test second entity
		expect(entity2.intersects(entity2)).toBeTruthy();
		expect(entity2.intersects(entity3)).toBeFalsy();
		
		// Test third entity
		expect(entity3.intersects(entity1)).toBeFalsy();
		expect(entity3.intersects(entity2)).toBeFalsy();

	});

	it("can be killed", function() {
		
		entity = new Fizz.Entity();
		
		var parent = new Fizz.Entity();
		
		entity.parent = parent;
		expect(entity.parent).toBe(parent);
		
		entity.kill();
		expect(entity.parent).toBeNull();

	});

	it("emits a 'death' event when killed", function() {
		
		var alive = true;
		
		entity = new Fizz.Entity();
		entity.addEventListener('death', function() { alive = false; });
		entity.kill();
		
		expect(alive).toBeFalsy();

	});

	it("has a scale, velocity, and acceleration, each represented by a Point object", function() {
		
		entity = new Fizz.Entity();
		
		expect(entity.scale instanceof Fizz.Point).toBeTruthy();
		expect(entity.velocity instanceof Fizz.Point).toBeTruthy();
		expect(entity.acceleration instanceof Fizz.Point).toBeTruthy();

	});
	
	it("protects its Point-type properties from being assigned non-Point-type values",  function() {
		
		entity = new Fizz.Entity();
		expect(entity.scale instanceof Fizz.Point).toBeTruthy();
		
		entity.scale = "what's your point?";
		expect(entity.scale instanceof Fizz.Point).toBeTruthy();

	});
	
	it("can assume the properties of an existing Rectangle", function() {
		
		var entity = new Fizz.Entity(),
			rectangle = new Fizz.Rectangle(new Fizz.Point(15, 30),
										   new Fizz.Point(50, 50));
		
		entity.copy(rectangle);
		
		expect(entity.x).toEqual(rectangle.x);
		expect(entity.y).toEqual(rectangle.y);
		expect(entity.width).toEqual(rectangle.width);
		expect(entity.height).toEqual(rectangle.height);

	});

	it("can assume the properties of an existing Entity", function() {
		
		var entity1 = new Fizz.Entity();
		
		var entity2 = new Fizz.Entity(new Fizz.Point(50, 50), new Fizz.Point(20, 20));
			entity2.scale = new Fizz.Point(2, 0.5);
			entity2.velocity = new Fizz.Point(0, 4);

		entity1.copy(entity2);

		expect(entity1.x).toEqual(entity2.x);
		expect(entity1.y).toEqual(entity2.y);
		expect(entity1.width).toEqual(entity2.width);
		expect(entity1.height).toEqual(entity2.height);		
		expect(entity1.scale.equals(entity2.scale)).toBeTruthy();
		expect(entity1.velocity.equals(entity2.velocity)).toBeTruthy();
		expect(entity1.acceleration.equals(entity2.acceleration)).toBeTruthy();
	
	});

	it("can be used to create new Entities (clones)", function() {
		
		var entity = new Fizz.Entity(new Fizz.Point(5, 5), new Fizz.Point(64, 64));
		
		var clone = entity.clone();

		expect(clone.x).toEqual(entity.x);
		expect(clone.y).toEqual(entity.y);
		expect(clone.width).toEqual(entity.width);
		expect(clone.height).toEqual(entity.height);		
		expect(clone.scale.equals(entity.scale)).toBeTruthy();
		expect(clone.velocity.equals(entity.velocity)).toBeTruthy();
		expect(clone.acceleration.equals(entity.acceleration)).toBeTruthy();

	});

	it("can be represented by a string", function() {
		entity = new Fizz.Entity();
		expect(entity.toString()).toEqual("[Entity (name='" + entity.name + "')]");
	});

});