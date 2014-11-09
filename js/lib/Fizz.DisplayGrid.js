// Namespace
this.Fizz = this.Fizz || { };

(function() {

	var DisplayGrid = Fizz.DisplayGroup.extend({
			
		init: function(settings) {

			Fizz.DisplayGroup.prototype.init.call(this, null);

			this._rows 			= DisplayGrid.DEFAULT_ORDER;
			this._columns 		= DisplayGrid.DEFAULT_ORDER;
			this._cellWidth 	= DisplayGrid.DEFAULT_CELL_SIZE;
			this._cellHeight 	= DisplayGrid.DEFAULT_CELL_SIZE;

			// Copy over custom object settings
			if(typeof settings === "object" && settings !== null) {
				
				// We're keeping 'rows' and 'columns' as read-only for now,
				// so don't assign them via the normal means ('assign')
				
				if('rows' in settings && typeof settings.rows === "number") {
					this._rows = settings.rows;
					delete settings.rows;
				}
				
				if('columns' in settings && typeof settings.columns === "number") {
					this._columns = settings.columns;
					delete settings.columns;
				}
				
				if('cellWidth' in settings && typeof settings.cellWidth === "number") {
					this._cellWidth = settings.cellWidth;
					delete settings.cellWidth;
				}
				
				if('cellHeight' in settings && typeof settings.cellHeight === "number") {
					this._cellHeight = settings.cellHeight;
					delete settings.cellHeight;
				}
				
				this.assign(settings);

			}

		},

		addChild: function(children) {

			// Normalize inputs (argument vs array lists)
			if(arguments.length > 1) {
				var args = Array.prototype.slice.call(arguments, 0);
				return this.addChild.call(this, args);
			}

			if(children instanceof Fizz.DisplayEntity) children = [children];
			if(children instanceof Array) {

				var hitCapacity = false;

				children.forEach(function(child) {

					// Check whether we've hit capacity (full grid)
					if(this._children.length === this.capacity) {
						hitCapacity = true;
						return;
					}

					var len = this._children.length;
					var fromX, fromY, toX, toY;

					fromX = toX = len ? this._children[len - 1].x : this._cellWidth * -1;
					fromY = toY = len ? this._children[len - 1].y : 0;
					
					if(fromX < (this._columns - 1) * this._cellWidth) {
						toX += this._cellWidth;
					} else {
						toX = 0;
						toY += this._cellHeight;
					}

					child._position = new Fizz.Point(toX, toY);

					Fizz.DisplayGroup.prototype.addChildAt.call(this, child);

				}, this);

				return !hitCapacity;

			}

		},

		copy: function(grid) {
			
			if(!(grid instanceof Fizz.DisplayGroup)) return false;
			
			Fizz.DisplayGroup.prototype.copy.call(this, grid);
			this._rows = grid.rows;
			this._columns = grid.columns;
			
			// In case the entity we're copying from isn't a DisplayGrid
			this._updateChildLayout();

		},

		clone: function() {
			var clone = new DisplayGrid();
			clone.copy(this);
			return clone;
		},

		toString: function() {
			return "[DisplayGrid (name='" + this.name + "')]";
		}

	});

	// Static class members

	DisplayGrid.DEFAULT_ORDER = 8;
	DisplayGrid.DEFAULT_CELL_SIZE = 16;

	// Public properties

	DisplayGrid.prototype.exposeProperty("rows");
	DisplayGrid.prototype.exposeProperty("columns");
	DisplayGrid.prototype.exposeProperty("cellWidth");
	DisplayGrid.prototype.exposeProperty("cellHeight");

	// Public dynamic properties

	DisplayGrid.prototype.exposeProperty("capacity", function() {
		return this._rows * this._columns;
	});

	// Class export
	Fizz.DisplayGrid = DisplayGrid;

}());