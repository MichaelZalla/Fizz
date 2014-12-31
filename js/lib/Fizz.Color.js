// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var Color = Object.extend({

		init: function(r, g, b, a) {

			this._r = 0;
			this._g = 0;
			this._b = 0;
			this._alpha = 1;

			switch(arguments.length) {

				case 1:

					if(arguments[0] instanceof Array) {
						this.init.apply(this, arguments[0]);
					} else if(typeof arguments[0] === "string") {
						// Assign RGB values based on hexidecimal string
						var str = arguments[0].replace('#', '');
						for(var i = 0; i < str.length; i += 2) {
							var prop = ['_r','_g','_b'][i / 2];
							this[prop] = parseInt(str.substring(i, i + 2), 16);
						}
						this._alpha = 1; // Hex results in full transparency
					}
					
					break;

				case 4:
					this.alpha = a;
				/* falls through */
				case 3:
					this.r = r;
					this.g = g;
					this.b = b;
				/* falls through */
				default:

			}

		},

		add: function(color) {
			if(color instanceof Fizz.Color) {
				var prop;
				for(var i = 0; i < 3; i++) {
					prop = ['r','g','b'][i];
					this[prop] += color[prop];
				}
			}
			return this;
		},

		subtract: function(color) {
			if(color instanceof Fizz.Color) {
				var prop;
				for(var i = 0; i < 3; i++) {
					prop = ['r','g','b'][i];
					this[prop] -= color[prop];
				}
			}
			return this;
		},

		equals: function(color, considerAlpha) {

			if(!(color instanceof Fizz.Color)) { return false; }
			if(typeof considerAlpha !== "boolean") { considerAlpha = false; }

			var isHueMatch = (this._r === color._r &&
							  this._g === color._g &&
							  this._b === color._b);

			if(!considerAlpha) { return isHueMatch; }
			else { return (isHueMatch && this._alpha === color._alpha); }

		},

		copy: function(color) {
			if(color instanceof Fizz.Color) {
				this.init.call(this, color.toList(true));
			}
			return this;
		},

		clone: function() {
			var clone = new Color();
			clone.copy(this);
			return clone;
		},

		toRGB: function(includeAlpha) {
			var mode = includeAlpha ? "rgba" : "rgb";
			return mode + "(" + this.toList(includeAlpha).toString() + ")";
		},

		toHex: function() {
			var values = ['_r','_g','_b'].map(function(p) {
				return ('0' + this[p].toString(16)).slice(-2);
			}.bind(this));
			return "#" + values.toString().replace(/,/g,'');
		},

		toList: function(includeAlpha) {
			if(typeof includeAlpha !== "boolean") { 
				includeAlpha = false;
			}
			return [this._r,this._g,this._b]
				.concat(includeAlpha ? this._alpha : []);
		},

		toString: function() {
			return "[Color (" + this.toList(true) + ")]";
		}

	});

	// Static class members

	// Expose dynamic getters for built-in Color configurations
	// (We need to provide copies so the built-in configs aren't modified)
	// (Note that we exposing these on the constructor and not the prototype)

	Color.exposeProperty('BLACK', 	function() { return new Color("#000000"); });
	Color.exposeProperty('BLUE', 	function() { return new Color("#0000FF"); });
	Color.exposeProperty('CYAN', 	function() { return new Color("#00FFFF"); });
	Color.exposeProperty('GRAY', 	function() { return new Color("#808080"); });
	Color.exposeProperty('GREEN', 	function() { return new Color("#008000"); });
	Color.exposeProperty('MAGENTA', function() { return new Color("#FF00FF"); });
	Color.exposeProperty('RED', 	function() { return new Color("#FF0000"); });
	Color.exposeProperty('WHITE', 	function() { return new Color("#FFFFFF"); });
	Color.exposeProperty('YELLOW', 	function() { return new Color("#FFFF00"); });
	Color.exposeProperty('CLEAR', 	function() { return new Color(0,0,0,0.0); });

	// Public properties

	var byteRange = [0, Math.pow(2,8)];
	
	Color.prototype.exposeProperty("r", "_r", Fizz.restrict.toRange("_r", byteRange));
	Color.prototype.exposeProperty("g", "_g", Fizz.restrict.toRange("_g", byteRange));
	Color.prototype.exposeProperty("b", "_b", Fizz.restrict.toRange("_b", byteRange));
	
	Color.prototype.exposeProperty("alpha", "_alpha",
		Fizz.restrict.toRange("_alpha", [0, 1]));

	// Class export
	Fizz.Color = Color;

	Fizz.logger.filter('all').log("Loaded module 'Color'.");

}());