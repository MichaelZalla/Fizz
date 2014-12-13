// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var EntityPool = Object.extend({
			
		init: function(prototypeEntity, size, sizeIsDynamic, resetFn) {
			
			//@TODO Is it *really* necessary that the prototype must be an Entity?
			// All the entity should really (optionally) need is a 'clone' method
			if(false === prototypeEntity instanceof Fizz.Entity) {
				throw new Error("EntityPool must be instantiated with a valid Entity prototype");
			}

			this._pool = [ ];
			this._size = 0;
			this._sizeIsDynamic = true;
			this._activeEntityCount = 0;
			this._firstAvailable = null;

			// Update the prototype reference
			this._prototypeEntity = prototypeEntity;
			this._prototypeEntity.exists = false;
			
			// Set 'reset' callback for entity recycling
			if(typeof resetFn === "function") {
				this._resetFn = resetFn;
			} else if(this._prototypeEntity.reset) {
				this._resetFn = this._prototypeEntity.reset;
			} else {
				this._resetFn = Fizz.noop;
			}

			// Via dynamic setters
			this.sizeIsDynamic = sizeIsDynamic;

			size = (typeof size === "number") ? size : EntityPool.DEFAULT_SIZE;

			if(size > 0) { this._grow(size); }

		},

		reserve: function() {
			
			var node = this._firstAvailable; // may be null!
			
			// If all entities are reserved (or pool is empty)
			if(null === node) {
				if(this._sizeIsDynamic) {
					this._grow(this._size || 1); // double the pool size – O(ln)
					node = this._firstAvailable;
				} else {
					return node;
				}
			}

			// Update the unused list head
			this._firstAvailable = node._next;
			node._next = null;
			
			// Configure entity to be rendered, and return
			this._resetFn.call(node);
			node.exists = true;

			this._activeEntityCount += 1;

			return node;

		},

		release: function(entity) {
			// Add the released entity to the front of the list
			entity._next = this._firstAvailable;
			this._firstAvailable = entity;
			this._activeEntityCount -= 1;
		},
		
		drain: function() {
			// Lose all references local to the pool object. This will trigger
			// garbage collection for entities that aren't referenced elsewhere
			this._firstAvailable = null;
			this._size = 0;
			this._activeEntityCount = 0;
			this._pool = [ ];
		},

		toString: function() {
			return "[EntityPool (size='" + this._size + "')]";
		},

		// Private methods

		_grow: function(size) {

			size = (typeof size === "number" && 0 < size) ? size : 1;

			if(1 < size) {
				// console.log("Growing pool to size ", this._size + size);
			}

			for(var i = 0; i < size; i++) {

				var entity = this._prototypeEntity.clone();

				// Use metadata to create a free-list of entities
				entity._next = null;

				// Add a new entity to the pool and increment size
				this._pool.push(entity);
				this._size += 1;

				// Cleanup '_firstAvailable' reference if necessary
				if(null === this._firstAvailable) {
					this._firstAvailable = entity;
				} else {
					this._pool[this._size - 2]._next = entity; 
				}

			}

		}

	});

	// Static class members
	
	EntityPool.DEFAULT_SIZE = 0;

	// Public properties

	EntityPool.prototype.exposeProperty("size");
	EntityPool.prototype.exposeProperty("activeEntityCount");
	
	EntityPool.prototype.exposeProperty("sizeIsDynamic", "_sizeIsDynamic",
		Fizz.restrict.toBoolean("_sizeIsDynamic"));
		
	EntityPool.prototype.exposeProperty("resetFn", "_resetFn",
		Fizz.restrict.toDataType("_resetFn", "function"));
	
	// EntityPool export
	Fizz.EntityPool = EntityPool;

}());