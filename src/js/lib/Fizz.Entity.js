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

			this.name = "Entity_" + this._guid;
			this.exists = true;

		},

		update: function(deltaT) {
			deltaT = (typeof deltaT === "number") ? deltaT : 1;
			if((this._life -= deltaT) < 1) {
				this.kill();
			}
			this._velocity.x += (this._acceleration.x * deltaT);
			this._velocity.y += (this._acceleration.y * deltaT);
			this.x += this._velocity.x * deltaT;
			this.y += this._velocity.y * deltaT;
		},

		kill: function() {
			this.emit(Fizz.Entity.EVENTS.DEATH);
			this.exists = false;
			//@TODO Should 'kill' remove from parent? Note that an entity's
			// given DisplayGroup will still hold a child reference to it
			this.parent = null;
			return this;
		},

		copy: function(entity) {
			if(!(entity instanceof Fizz.Entity) &&
			   !(entity instanceof Fizz.Rectangle)) { return false; }
			this.position = entity.position.clone();
			this.size = entity.size.clone();
			if(entity instanceof Fizz.Entity) {
				this.exists = entity.exists;
				this._scale = entity.scale.clone();
				this._velocity = entity.velocity.clone();
				this._acceleration = entity.acceleration.clone();
			}
			return this;
		},

		clone: function() {
			var clone = new Fizz.Entity();
			clone.copy(this);
			return clone;
		},

		toString: function() {
			return String.format("[Entity (name='{0}')]", this.name);
		},

		// Private methods

		_getGlobalPosition: function() {
			if(null === this.parent) { return new Fizz.Point(this.x, this.y); }
			return new Fizz.Point(this.x, this.y).add(this.parent._getGlobalPosition());
		}

	});

	// Apply Fizz.EventEmitter interface to Fizz.Entity class
	// (This is where the '_parent' property is given to Entity instances)
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

	// Public dynamic properties

	Entity.prototype.exposeProperty("globalPosition", function() {
		return this._getGlobalPosition();
	});

	Entity.prototype.exposeProperty("centerPoint", function() {
		return new Fizz.Point(
			this.position.x + (this.width / 2),
			this.position.y + (this.height / 2)
		);
	});

	Entity.prototype.exposeProperty("stage", function() {
		//@TODO Remove forward dependency ugliness
		if(null === this.parent || (Fizz.Stage && this.parent instanceof Fizz.Stage)) { return this.parent; }
		return this.parent.stage;
	});

	// Override Fizz.Rectangle's dynamic position properties to account for scale

	Entity.prototype.exposeProperty("right",  function() {
		return this._position.x + this._size.x * Math.abs(this._scale.x);
	});

	Entity.prototype.exposeProperty("bottom", function() {
		return this._position.y + this._size.y * Math.abs(this._scale.y);
	});

	// Override Fizz.Rectangle's dynamic position properties to account for scale

	Entity.prototype.exposeProperty("width", function() {
		return this.size.x * Math.abs(this.scale.x);
	});

	Entity.prototype.exposeProperty("height", function() {
		return this.size.y * Math.abs(this.scale.y);
	});

	// Class export
	Fizz.Entity = Entity;

	Fizz.logger.filter('dev').log("Loaded module 'Entity'.");

}());