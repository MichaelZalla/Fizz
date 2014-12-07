// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var EntityPool = Object.extend({
			
		init: function(prototypeEntity, size, sizeIsDynamic, resetFn) {
			
			if(false === prototypeEntity instanceof Fizz.Entity) {
				throw new Error("EntityPool must be instantiated with a valid Entity prototype");
			}

			// Initialize class members
			this._pool = [ ];
			this._firstAvailable = null;
			this._prototypeEntity = null;
			this._resetFn = null;			
			this._size = 0;
			this._sizeIsDynamic = false;

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
			this.resetFn = resetFn;			
			this.sizeIsDynamic = sizeIsDynamic;

			size = (typeof size === "number") ? size : EntityPool.DEFAULT_SIZE;

			this._grow(size); // zero to 'size'

		},

		reserve: function() {
			
			var node = this._firstAvailable; // may be null!
			
			// If all entities are reserved (or pool is empty)
			if(null === node) {
				if(this._sizeIsDynamic) {
					this._grow(this._size); // double the pool size – O(ln)
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

			return node;

		},

		release: function(entity) {
			// Add the released entity to the front of the list
			entity._next = this._firstAvailable;
			this._firstAvailable = entity;
		},

		toString: function() {
			return "[EntityPool (size='" + this._size + "')]";
		},

		// Private methods

		_grow: function(size) {

			// Allow pool to grow based on an incremental value
			if(arguments.length && typeof size === "number" && size) {
				console.log("Growing pool to size ", this._size + size);
				for(var i = 0; i < size; i++) {
					this._grow();
				}
				return;
			}

			// Use metadata to create a linked list of free entities
			clone = this._prototypeEntity.clone();
			clone._next = this._firstAvailable;

			// Add the 'node' to the pool
			this._firstAvailable = clone;
			this._pool.push(clone);
			this._size += 1;

		},

		_getCountInactive: function() {
			var count = 0,
				ptr = this._firstAvailable;
			//@TODO Could store a size value that updates on reserve/release!
			while(ptr !== null) {
				ptr = ptr._next;
				count += 1;
			}
			// O(n) worst-case
			return count;
		}

	});

	// Static class members
	
	EntityPool.DEFAULT_SIZE = 100;

	// Public properties

	EntityPool.prototype.exposeProperty("size");
	
	EntityPool.prototype.exposeProperty("sizeIsDynamic", "_sizeIsDynamic",
		Fizz.restrict.toBoolean("_sizeIsDynamic"));
		
	EntityPool.prototype.exposeProperty("resetFn", "_resetFn",
		Fizz.restrict.toDataType("_resetFn", "function"));
	
	// EntityPool export
	Fizz.EntityPool = EntityPool;

}());