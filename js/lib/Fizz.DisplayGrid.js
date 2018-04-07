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

		childAtCoordinate: function(columnIndex, rowIndex) {

			// Does not assume toroidal grid projection
			if(columnIndex < 0 || columnIndex >= this._columns) return null;
			if(rowIndex < 0 || rowIndex >= this._rows) return null;

			return this.childAt(rowIndex * this._columns + columnIndex);

		},

		addChild: function(children) {

			if(this._children.length === this.capacity) return false;

			// Normalize inputs (argument vs array lists)
			if(arguments.length > 1) {
				var args = Array.prototype.slice.call(arguments, 0);
				return this.addChild.call(this, args);
			}
			if(children instanceof Fizz.Entity) children = [children];
			if(!(children instanceof Array)) return false;

			var hitCapacity = false;

			children.foreach(function(child) {

				// Check whether we've hit capacity (full grid)
				if(this._children.length === this.capacity) {
					
					hitCapacity = true;
					
					return;
					
				}

				var len = this._children.length;
				var fromX, fromY, toX, toY;

				fromX = toX = len ? this._children[len - 1].x : this._cellWidth * Math.abs(this._scale.x) * -1;
				fromY = toY = len ? this._children[len - 1].y : 0;
				
				if(fromX < (this._columns - 1) * this._cellWidth * Math.abs(this._scale.x)) {
					toX += this._cellWidth * Math.abs(this._scale.x);
				} else {
					toX = 0;
					toY += this._cellHeight * Math.abs(this._scale.y);
				}

				child._position = new Fizz.Point(toX, toY);

				Fizz.DisplayGroup.prototype.addChildAt.call(this, child);

			}, this);

			return !hitCapacity;

		},

		copy: function(grid) {
			Fizz.DisplayGroup.prototype.copy.call(this, grid);
			if(grid instanceof Fizz.DisplayGrid) {
				this._rows = grid.rows;
				this._columns = grid.columns;
				// Reinitialize the child layout to match the grid settings
				this._children.foreach(this.addChild, this);
			}
		},

		clone: function() {
			var clone = new DisplayGrid();
			clone.copy(this);
			return clone;
		},

		toString: function() {
			return String.format("[DisplayGrid (name='{0}')]", this.name);
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

	Fizz.logger.filter('dev').log("Loaded module 'DisplayGrid'.");

}());