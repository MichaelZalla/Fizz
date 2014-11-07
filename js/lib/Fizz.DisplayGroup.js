// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var DisplayGroup = Fizz.DisplayEntity.extend({

		init: function(settings, cacheOnCreation) {

			this._children = [ ];

			// Allow groups to be instantiated from single DisplayEntities
			if(arguments[0] instanceof Fizz.DisplayEntity ||
			   arguments[0] instanceof Array) {
			   	Fizz.DisplayEntity.prototype.init.call(this, null, cacheOnCreation);
			   	// Add child (or children) to display list
				this.addChild(arguments[0]);
			} else {
				Fizz.DisplayEntity.prototype.init.call(this, settings, cacheOnCreation);
			}

		},

		update: function(deltaT) {
			// Only update Entities that exist as children
			// before the 'update' method is invoked
			Fizz.DisplayEntity.prototype.update.call(this, deltaT);
			// Shallow copy, as we are modifying the array length
			this._children.slice(0).forEach(function(child) {
				child.update(deltaT);
			});
		},

		updateCache: function() {

			// Computed values
			this._width = this.width;
			this._height = this.height;

			// First, call the super method to prepare the cache canvas
			Fizz.DisplayEntities.prototype.updateCache.call(this);

			// Then, clear the current display group cache
			var ctx = this._cacheCanvasContext;
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

			// Finally, render children to the cache canvas recursively
			this.children.forEach(function(c) {
				if(c instanceof Fizz.DisplayEntity) {
					c.updateCache();
					c.draw(ctx);
				}
			});

		},

		draw: function(context) {

			// Either we draw all children recursively
			if(false === this._caching) {
				this.children.forEach(function(c) {
					c.draw(context);
				});
			}

			// Or we simply paint the entire display group cache
			Fizz.DisplayEntity.prototype.draw.call(this, context);

		},

		indexOf: function(child) {
			return this._children.indexOf(child);
		},

		childAt: function(index) {
			if(index < 0 || index >= this._children.length) return null;
			return this._children[index];
		},

		contains: function(child) {
			return this.indexOf(child) > -1;
		},

		// Could implement a tree for log-n lexigraphic search time
		getChildByName: function(name) {
			if(0 === this._children.length) return null;
			for(var i = 0; i < this._children.length; i++) {
				if(this._children[i].name == name) return this._children[i];
			}
			return null;
		},

		setIndexOfChild: function(child, index) {
			if(-1 === this.indexOf(child)) return false;
			var childCount = this._children.length;
			index = (index < 0) ? 0 : index;
			index = (index > childCount - 1) ? childCount : index;
			this.addChildAt(child, index); // Remove and re-add
		},

		addChild: function(child) {
			var args = Array.prototype.slice.call(arguments, 0);
			return this.addChildAt.call(this, args);
		},

		addChildAt: function(child, index) {

			// Normalize list inputs
			if(arguments.length > 2) {
				child = child[0, child.length - 2];
				index = child[child.length - 1];
			}

			index = (typeof index == "number") ? index : this._children.length;

			// Allow arrays of Entites to be passed
			if(child instanceof Array) {
				return child.reduce(function(result, c, i) {
					return (result && this.addChildAt(c, index + i));
				}.bind(this), true);
			}

			if(Fizz.Stage && child instanceof Fizz.Stage) return false;
			if(!(child instanceof Fizz.Entity)) return false;

			// Entities should not co-exist between display groups
			if(child.parent !== null) child.parent.removeChild(child);

			child.parent = this;

			this._children.splice(index, 0, child);

			// Emit 'added' event with child as its target
			child.emit(Fizz.Entity.EVENTS.ADDED, { });

			return true;

		},

		removeChild: function(child) {

			// Normalize list inputs
			if(arguments.length > 1) child = [child];

			// Allow arrays of Entities to be passed
			if(child instanceof Array) {
				return child.reduce(function(result, c) {
					return c;
				}.bind(this), null);
			}

			if(!(child instanceof Fizz.Entity)) return null;
			
			var index = this.indexOf(child);

			if(-1 === index) return null;

			child.parent = null;

			this._children.splice(index, 1);

			// Emit 'removed' event with child as its target
			child.emit(Fizz.Entity.EVENTS.REMOVED, { });

			return child;

		},

		removeChildAt: function(index) {

			// Check for invalid index
			if(index < 0 || index >= this._children.length) return null;
			
			var child = this._children[index];
			child.parent = null;
			
			this._children.splice(index, 1);
			
			// Emit 'removed' event with child as its target
			child.emit(Fizz.Entity.EVENTS.REMOVED, { });
			
			return child;

		},

		sort: function(sortFn) {
			this._children.sort(sortFn);
		},

		empty: function() {
			if(0 === this._children.length) return true;
			// Shallow copy, as we are modifying the array length
			var copy = this._children.slice(0);
			return copy.reduce(function(result, child) {
				return this.removeChild(this._children[0]);
			}.bind(this), true);
		},

		copy: function(group) {
			Fizz.DisplayEntity.prototype.copy.call(this, group);
			if(group instanceof Fizz.DisplayGroup) {
				this.empty();
				var that = this;
				group.children.forEach(function(child, i) {
					this.addChild(child.clone(), i);
				}.bind(that));
			}
		},

		clone: function() {
			var clone = new Fizz.DisplayGroup();
			clone.copy(this);
			return clone;
		},

		toString: function() {
			return "[DisplayGroup (name='" + this.name + "', " +
				   "childCount='" + this.children.length + "')]";
		},

		// Private methods

		_getChildrenBoundingBox: function() {

			if(0 === this._children.length) {
				return [new Fizz.Point(this._x, this._y),
						new Fizz.Point(this._x, this._y)];
			}
			
			var top = null, left = null, right = null, btm = null;

			//@TODO Leverage quad-tree boundaries to speed up computation

			this._children.forEach(function(c) {
				
				// Initialize boundaries with first child
				if(typeof top 	!== "number") top = c.y;
				if(typeof left 	!== "number") left = c.x;
				if(typeof right !== "number") right = c.x + c.width;
				if(typeof btm 	!== "number") btm = c.y + c.height;

				// Update the boundaries if necessary
				if(c.y < top) top = c.y;
				if(c.x < left) left = c.x;
				if(c.x + c.width > right) right = c.x + c.width;
				if(c.y + c.height > btm) btm = c.y + c.height;

			});

			return [new Fizz.Point(left, top),
					new Fizz.Point(right, btm)];

		}

	});

	// Static class members

	DisplayGroup.EVENTS = { };

	// Syntactic sugar
	
	DisplayGroup.prototype.add = DisplayGroup.prototype.addChild;
	DisplayGroup.prototype.remove = DisplayGroup.prototype.removeChild;
	
	// Public properties

	DisplayGroup.prototype.exposeProperty("children");

	// Public dynamic properties
	
	DisplayGroup.prototype.exposeProperty("width", function() {
		var cbb = this._getChildrenBoundingBox();
		var topLeft = cbb[0],
			bottomRight = cbb[1];
		return bottomRight.x - topLeft.x;
	});
	
	DisplayGroup.prototype.exposeProperty("height", function() {
		var cbb = this._getChildrenBoundingBox();
		var topLeft = cbb[0],
			bottomRight = cbb[1];
		return bottomRight.y - topLeft.y;
	});

	// Class export
	Fizz.DisplayGroup = DisplayGroup;

}());