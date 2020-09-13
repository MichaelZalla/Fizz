describe("A DisplayGrid", function() {

	var grid = null;

	beforeEach(function() {
		grid = new Fizz.DisplayGrid({
			cellWidth: 50,
			cellHeight: 50
		});
	});

	it("is a DisplayGrid, and extends the DisplayGroup class", function() {
		expect(grid instanceof Fizz.DisplayGrid).toBeTruthy();
		expect(grid instanceof Fizz.DisplayGroup).toBeTruthy();
	});

	it("exposes the read-only properties 'rows' and 'columns' that " +
	   "describe the grid", function() {
	   	expect(grid.rows).toEqual(8);
	   	expect(grid.columns).toEqual(8);
	});

	it("exposes the read-only property 'capacity' which yields the maxiumum " +
	   "number of elements that can be placed on the grid", function() {
	   	grid = new Fizz.DisplayGrid({ rows: 5, columns: 5 });
	   	expect(grid.capacity).toEqual(25);
	});

	it("allows a row and column value to be passed in a settings object", function() {
		grid = new Fizz.DisplayGrid({ rows: 5, columns: 5 });
		expect(grid.rows).toEqual(5);
		expect(grid.columns).toEqual(5);
	});

	it("allows a cellWidth and cellHeight value to be passed in a settings object", function() {
		grid = new Fizz.DisplayGrid({ cellWidth: 64, cellHeight: 64 });
		expect(grid.cellWidth).toEqual(64);
		expect(grid.cellHeight).toEqual(64);
	});

	it("will position each child into the next available grid cell " +
	   "when added", function() {	 

	   	for(var i = 0; i < grid.capacity; i++) {
	   		
	   		var row = parseInt(i / grid.rows),
	   			col = i % grid.columns,
	   			child = new Fizz.DisplayEntity();

	   		grid.addChild(child);

	   		expect(child.position.x).toEqual(col * grid.cellWidth);
	   		expect(child.position.y).toEqual(row * grid.cellHeight);

	   	}
	   	
	});

	it("will stop adding children to the grid when there is no capacity", function() {

		for(var i = 0; i < grid.capacity; i++) {
			expect(grid.addChild(new Fizz.DisplayEntity())).toBeTruthy();
		}

		expect(grid.addChild(new Fizz.DisplayEntity())).toBeFalsy();

	});

	var size = Fizz.DisplayGrid.DEFAULT_ORDER;

	it("will default to a size of " + size + "-by-" + size + " unless " +
	   "otherwise specified", function() {
		expect(grid.rows).toEqual(8);
	   	expect(grid.columns).toEqual(8);
	});

});