// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var Entity = Fizz.Rectangle.extend({
			
		init: function(position, size) {

			Fizz.Rectangle.prototype.init.call(this, position, size);

			this._guid = Fizz.UID.get();
			this._life = Infinity;
			this._scale = new Fizz.Point(1,1);
			this._velocity = new Fizz.Point(0,0);
			this._acceleration = new Fizz.Point(0,0);
			this._density = 0;

			this.name = "Entity_" + this._guid;
			this.exists = true;

		},

		update: function(deltaT) {
			deltaT = (typeof deltaT === "number") ? deltaT : 1;
			if((this._life -= deltaT) < 1) {
				this.exists = false;
			}
			this._velocity.x += (this._acceleration.x * deltaT);
			this._velocity.y += (this._acceleration.y * deltaT);
			this.x += this._velocity.x * deltaT;
			this.y += this._velocity.y * deltaT;
		},

		kill: function() {
			this.emit(Fizz.Entity.EVENTS.DEATH);
			this.exists = false;
			this.parent = null;
			return this;
		},

		copy: function(entity) {
			if(!(entity instanceof Fizz.Entity) &&
			   !(entity instanceof Fizz.Rectangle)) { return false; }
			this.position = entity.position.clone();
			this.size = entity.size.clone();
			if(entity instanceof Fizz.Entity) {
				this.name = entity.name;
				this.exists = entity.exists;
				this._scale = entity.scale.clone();
				this._velocity = entity.velocity.clone();
				this._acceleration = entity.acceleration.clone();
				this._density = entity.density;
			}
			return this;
		},

		clone: function() {
			var clone = new Fizz.Entity();
			clone.copy(this);
			return clone;
		},

		toString: function() {
			return "[Entity (name='" + this.name + "')]";
		},

		// Private methods

		_getGlobalPosition: function() {
			if(Fizz.Stage && this instanceof Fizz.Stage) { return new Fizz.Point(0, 0); }
			if(null === this.parent) { return new Fizz.Point(this.x, this.y); }
			return new Fizz.Point(this.x, this.y).add(this.parent._getGlobalPosition());
		}

	});

	// Apply Fizz.EventEmitter interface to Fizz.Entity class
	Fizz.EventEmitter.initialize(Entity.prototype);

	// Static class members
	
	Entity.EVENTS = { };

	Entity.EVENTS.CLICK 	= 'click';
	Entity.EVENTS.DBLCLICK  = 'dblclick';
	Entity.EVENTS.MOUSEMOVE = 'mouseMove';
	Entity.EVENTS.MOUSEDOWN = 'mousedown';
	Entity.EVENTS.MOUSEUP 	= 'mouseup';
	Entity.EVENTS.ADDED   	= 'added';
	Entity.EVENTS.REMOVED 	= 'removed';
	Entity.EVENTS.DEATH   	= 'death';

	// Public properties

	Entity.prototype.exposeProperty("guid");

	Entity.prototype.exposeProperty("parent", "_parent",
		Fizz.restrict.toInstanceType("_parent", "Fizz.Entity"));

	Entity.prototype.exposeProperty("life", "_life",
		Fizz.restrict.toNumber("_life"));
	
	Entity.prototype.exposeProperty("scale", "_scale",
		Fizz.restrict.toInstanceType("_scale", "Fizz.Point"));
	
	Entity.prototype.exposeProperty("velocity", "_velocity",
		Fizz.restrict.toInstanceType("_velocity", "Fizz.Point"));
	
	Entity.prototype.exposeProperty("acceleration", "_acceleration",
		Fizz.restrict.toInstanceType("_acceleration", "Fizz.Point"));

	Entity.prototype.exposeProperty("density", "_density",
		Fizz.restrict.toNumber("_density"));

	// Public dynamic properties

	Entity.prototype.exposeProperty("globalPosition",
		function() { return this._getGlobalPosition(); });

	Entity.prototype.exposeProperty("stage", function() {
		if(null === this.parent || (Fizz.Stage && this.parent instanceof Fizz.Stage)) { return this.parent; }
		return this.parent.stage;
	});
	
	Entity.prototype.exposeProperty("onStage", function() {
		//@TODO Make use of quad-tree when implemented!
		if(null === this.stage) { return false; }
		return this.intersects(this.stage);
	});

	// Class export
	Fizz.Entity = Entity;

}());