describe("An EntityPool", function() {

	var pool = null,
		entity = null;

	beforeEach(function() {
		entity = new Fizz.Entity();
	});

	it("is an EntityPool, and extends the native Object",
	function() {
		pool = new Fizz.EntityPool(entity);
		expect(pool instanceof Fizz.EntityPool).toBeTruthy();
		expect(pool instanceof Object).toBeTruthy();
	});

	it("must be initialized with an existing Entity to serve as the prototype",
	function() {
		pool = new Fizz.EntityPool(entity);
		expect(pool instanceof Fizz.EntityPool).toBeTruthy();
	});

	it("will throw an error if no prototype Entity is provided to the constructor",
	function() {
		function willThrowOnNoPrototype() {
			var pool = new Fizz.EntityPool();
			return pool;
		}
		function willThrowOnInvalidPrototype() {
			var pool = new Fizz.EntityPool(false);
			return pool;
		}
		expect(willThrowOnNoPrototype).toThrow();
		expect(willThrowOnInvalidPrototype).toThrow();
	});

	it("exposes a read-only 'size' property that defaults to zero",
	function() {
		pool = new Fizz.EntityPool(entity);
		expect(pool.size).toBeDefined();
		expect(pool.size).toEqual(0);
	});

	it("exposes a read-only 'activeEntityCount' property",
	function() {
		pool = new Fizz.EntityPool(entity);
		expect(pool.activeEntityCount).toBeDefined();
		expect(pool.activeEntityCount).toEqual(0);
	});

	it("has a 'sizeIsDynamic' property that holds a boolean",
	function() {
		pool = new Fizz.EntityPool(entity);
		expect(pool.sizeIsDynamic).toBeDefined();
		expect(pool.sizeIsDynamic).toBeTruthy();
	});

	it("will by default assign 'true' to its 'sizeIsDynamic' property",
	function() {
		pool = new Fizz.EntityPool(entity);
		expect(pool.sizeIsDynamic).toBeTruthy();
	});

	it("places a '_next' pointer onto each new Entity created for the pool",
	function() {
		pool = new Fizz.EntityPool(entity, 3);
		pool._pool.foreach(function(ent) {
			expect(ent._next).toBeDefined();
			expect(typeof ent._next).toMatch("object"); // May be null!
		});
	});

	it("uses the '_next' pointers to construct a null-terminated free-list " +
		"between a subset of the pool's entities",
	function() {
		
		pool = new Fizz.EntityPool(entity, 3);
		
		var i = 0,
			current = pool._pool[i];

		while(current._next !== null) {
			expect(current._next).toBe(pool._pool[i + 1]);
			current = current._next;
			i += 1;
		}

		expect(i).toEqual(2);

	});

	it("has a 'reserve' method that reserves an entity in the pool and returns it",
	function() {
		pool = new Fizz.EntityPool(entity, 1);
		expect(pool.activeEntityCount).toEqual(0);
		expect(pool.reserve() instanceof Fizz.Entity);
		expect(pool.activeEntityCount).toEqual(1);
	});

	it("will automatically grow its pool as necessary if the 'sizeIsDynamic' " +
		"property is set to 'true'",
	function() {
		
		// Test auto-growth for pools of zero size
		pool = new Fizz.EntityPool(entity);
		expect(pool.size).toEqual(0);
		
		pool.reserve();
		expect(pool.size).toEqual(1);
		expect(pool.activeEntityCount).toEqual(1);

		// Test auto-growth for pools of non-zero size
		pool = new Fizz.EntityPool(entity, 32);
		expect(pool.size).toEqual(32);

		var currentSize = pool.size;
		for(var i = 0; i <= currentSize; i++) {
			pool.reserve();
		}
		expect(pool.size).toEqual(64);
		expect(pool.activeEntityCount).toEqual(33);

	});

	it("will have its 'reserve' method return 'null' if no unused entities are " +
		"available, and the pool is not set to auto-grow", 
	function() {

		// Test for empty pool with no auto-growth
		pool = new Fizz.EntityPool(entity, 0, false);
		expect(pool.reserve()).toBeNull();

		// Test for non-empty pool with no auto-growth
		pool = new Fizz.EntityPool(entity, 8, false);
		var currentSize = pool.size;
		for(var i = 0; i <= currentSize; i++) {
			pool.reserve();
		}
		expect(pool.reserve()).toBeNull();

	});

	it("has a 'release' method that moves an entity back to the head of the "+
		"free-list and updates the pool's 'activeEntityCount' value",
	function() {

		pool = new Fizz.EntityPool(entity, 3);

		var entA = pool.reserve(),
			entB = pool.reserve(),
			entC = pool.reserve();

		expect(pool.size).toEqual(3);
		expect(pool.activeEntityCount).toEqual(3);
		expect(pool._firstAvailable).toBeNull();

		pool.release(entA);
		expect(pool.activeEntityCount).toBe(2);
		expect(pool._firstAvailable).toBe(entA);

		pool.release(entB);
		expect(pool.activeEntityCount).toBe(1);
		expect(pool._firstAvailable).toBe(entB);

		pool.release(entC);
		expect(pool.activeEntityCount).toBe(0);
		expect(pool._firstAvailable).toBe(entC);

	});

	it("has a 'drain' method that empties the pool and resets its size",
	function() {
		
		pool = new Fizz.EntityPool(entity, 10);

		pool.reserve();

		expect(pool.size).toEqual(10);
		expect(pool._pool.length).toEqual(10);
		// expect(pool._firstAvailable).toBe(pool._pool[1]);

		pool.drain();

		expect(pool.size).toEqual(0);
		expect(pool._pool.length).toEqual(0);
		// expect(pool._firstAvailable).toBe(null);

	});

	it("has a 'resetFn' property designed to hold a callback reference",
	function() {
		pool = new Fizz.EntityPool(entity);
		expect(pool.resetFn).toBeDefined();
		expect(typeof pool.resetFn).toMatch("function");
		expect(pool.resetFn).toBe(Fizz.noop);
	});

	it("will pass an entity to the 'resetFn' callback when the entity is reserved",
	function() {
		
		var count = 0;

		function resetCallback() {
			this.wasTouched = true;
			count += 1;
		}

		// Allocate a pool with a specified reset callback
		pool = new Fizz.EntityPool(entity, 4, false, resetCallback);

		// Reserve all entities in the pool to trigger resets
		for(var i = 0; i < pool.size; i++) {
			pool.reserve();
		}

		expect(count).toEqual(4);
		pool._pool.foreach(function(entity) {
			expect(entity.wasTouched);
		});

	});

	it("will try to use a 'reset' method defined on an entity when reserved " +
		"if no reset callback was passed to the pool at instantiation",
	function() {

		var count = 0;

		var Particle = Fizz.Entity.extend({
			reset: function() {
				count += 1;
			}
		});
		
		// Allocate a pool with no specified reset callback
		pool = new Fizz.EntityPool(new Particle(), 4, false);

		// Test that the pool defaults to calling Particle.reset on reserve
		for(var i = 0; i < pool.size; i++) {
			pool.reserve();
		}

		expect(count).toEqual(4);

	});

	it("can be grown to a specified size at instantiation",
	function() {
		pool = new Fizz.EntityPool(entity, 100);
		expect(pool.size).toEqual(100);
	});
	
	it("can have its 'sizeIsDynamic' property set at instantiation",
	function() {
		pool = new Fizz.EntityPool(entity, 1, true);
		expect(pool.sizeIsDynamic).toBeTruthy();
	});
	
	it("can have its 'resetFn' callback set at instantiation",
	function() {
		function resetCallback() { /* Do some work */ }
		pool = new Fizz.EntityPool(entity, 1, true, resetCallback);
		expect(pool.resetFn).toBeDefined();
		expect(typeof pool.resetFn).toMatch("function");
		expect(pool.resetFn).toBe(resetCallback);
	});

	it("can be represented as a string",
	function() {
		pool = new Fizz.EntityPool(entity);
		expect(pool.toString()).toMatch("[EntityPool (size='0')]");
	});

});