describe("A DisplayGroup", function() {

	var group = null,
		child1 = null,
		child2 = null,
		child3 = null;

	beforeEach(function() {

		group = new Fizz.DisplayGroup();		
		child1 = new Fizz.DisplayEntity({ name: "myChild1" });
		child2 = new Fizz.DisplayEntity({ name: "myChild2" });
		child3 = new Fizz.DisplayEntity({ name: "myChild3" });

	});

	it("is a DisplayEntity, and extends the DisplayEntity class", function() {
		expect(group instanceof Fizz.DisplayGroup).toBeTruthy();
		expect(group instanceof Fizz.DisplayEntity).toBeTruthy();
	});

	it("can hold a list of children entities", function() {
		expect(group.children.length).toEqual(0);
	});

	it("can add existing Entities to its list of children", function() {

		group.addChild(child1);
		group.addChild(child2);

		expect(group.children.length).toEqual(2);
		expect(group.childAt(0)).toBe(child1);
		expect(group.childAt(1)).toBe(child2);

	});

	it("can be created from a single entity which begins " +
	   "the display list", function() {

	   	var group = new Fizz.DisplayGroup(child1);
	   	expect(group.children.length).toEqual(1);
	   	expect(group.childAt(0)).toBe(child1);

	});

	it("can be created from a list of entities, which begin " +
	   "the display list", function() {

	   	var group = new Fizz.DisplayGroup([ child1, child2 ]);
	   	expect(group.children.length).toEqual(2);
	   	expect(group.childAt(0)).toBe(child1);
	   	expect(group.childAt(1)).toBe(child2);

	});

	it("can add multiple Entities to its list of children at once", function() {

		group.addChild(child1, child2, child3);
		expect(group.children.length).toEqual(3);

		group.empty();

		group.addChild( [ child1, child2, child3 ] );
		expect(group.children.length).toEqual(3);

	});

	it("can add existing Entities to its list of children " +
	   "at specific display indices (z-depth)", function() {

		group.addChildAt(child1, 0);
		group.addChildAt(child2, 0);

		expect(group.childAt(0)).toBe(child2);
		expect(group.childAt(1)).toBe(child1);

	});

	it("emits a '" + Fizz.Entity.EVENTS.ADDED + "' event when a " +
	   "child is added to its display list", function() {

	   	function onAdded(e) { expect(e.target).toBe(child1); }
	   	child1.addEventListener('added', onAdded);
	   	group.addChild(child1);

	});

	it("can retrieve the index of any of its children Entities", function() {
		
		group.addChild(child1);
		group.addChild(child2);

		expect(group.indexOf(child1)).toEqual(0);
		expect(group.indexOf(child2)).toEqual(1);

	});

	it("can retrieve any of its children by name (returns first match)", function() {
		
		group.addChild(child1);
		group.addChild(child2);
		
		expect(group.getChildByName(child1.name)).toBe(child1);
		expect(group.getChildByName(child2.name)).toBe(child2);

	});

	it("can determine whether it has a certain Entity as a child", function() {

		group.addChild(child1, child2);

		expect(group.contains(child1)).toBeTruthy();
		expect(group.contains(child2)).toBeTruthy();
		expect(group.contains(child3)).toBeFalsy();

	});

	it("can remove Entities from its list of children", function() {

		group.addChild(child1, child2);

		expect(group.children.length).toEqual(2);
		
		group.removeChild(child1);
		expect(group.children.length).toEqual(1);
		expect(group.childAt(0)).toEqual(child2);
		
		group.removeChild(child2);
		expect(group.children.length).toEqual(0);
		expect(group.childAt(0)).toBeNull();

	});

	it("can remove Entities from its list of children by index", function() {

		group.addChild(child1, child2);
		group.removeChildAt(1);

		expect(group.children.length).toEqual(1);
		expect(group.childAt(0)).toBe(child1);

	});

	it("emits a '" + Fizz.Entity.EVENTS.REMOVED + "' event when a " +
	   "child is removed from its display list", function() {

	   	function onRemoved(e) { expect(e.target).toBe(child1); }
	   	child1.addEventListener('removed', onRemoved);
	   	group.addChild(child1);
	   	group.removeChild(child1);

	});	

	it("can remove all of its children at once", function() {

		group.addChild(child1, child2);
		group.empty();

		expect(group.children.length).toEqual(0);
		expect(group.indexOf(child1)).toEqual(-1);
		expect(group.indexOf(child2)).toEqual(-1);

	});

	it("can move a child to a new (valid) index", function() {

		group.addChild(child1, child2, child3);
		expect(group.indexOf(child1)).toEqual(0);
		expect(group.indexOf(child2)).toEqual(1);
		expect(group.indexOf(child3)).toEqual(2);

		group.setIndexOfChild(child3, 0);
		expect(group.indexOf(child1)).toEqual(1);
		expect(group.indexOf(child2)).toEqual(2);
		expect(group.indexOf(child3)).toEqual(0);

	});

	it("can trigger an update on all of its children", function() {

		var velocity = new Fizz.Point(1, 1);

		child1 = new Fizz.DisplayEntity({ velocity: velocity.clone() });
		child2 = new Fizz.DisplayEntity({ velocity: velocity.clone() });

		expect(child1.velocity.x).toEqual(1);

		group.addChild(child1, child2);
		
		expect(child1.x).toEqual(0);
		expect(child2.x).toEqual(0);

		group.update(1);

		expect(child1.x).toEqual(1);
		expect(child2.x).toEqual(1);

	});

	it("supports recursive updates on all Entity and " +
	   "DisplayGroup descendents", function() {

	   	var velocity = new Fizz.Point(1, 1);

	   	var top = new Fizz.DisplayGroup({
   			velocity: velocity.clone()
   		});

	   	var middle = new Fizz.DisplayGroup({
   			velocity: velocity.clone()
   		});

	   	var bottom = new Fizz.DisplayEntity({
   			velocity: velocity.clone()
   		});

	   	middle.addChild(bottom);
	   	top.addChild(middle);

	   	expect(top.x).toEqual(0);
	   	expect(middle.x).toEqual(0);
	   	expect(bottom.x).toEqual(0);

	   	top.update(1);

	   	// Check local position updates
	   	expect(top.x).toEqual(1);
	   	expect(middle.x).toEqual(1);
	   	expect(bottom.x).toEqual(1);

	   	// Check global position updates
	   	expect(top.globalPosition.x).toEqual(1);
	   	expect(middle.globalPosition.x).toEqual(2);
	   	expect(bottom.globalPosition.x).toEqual(3);

	});

	it("supports the read-only dynamic properties 'width' and 'height'", function() {

		expect(group.width).toEqual(0);
		expect(group.height).toEqual(0);

		var child1 = new Fizz.DisplayEntity({
			position: [20,50],
			size: [10,10]
		});

		var child2 = new Fizz.DisplayEntity({
			position: [-50,100],
			size: [30,30]
		});

		group.addChild(child1, child2);
		expect(group.width).toEqual(80);
		expect(group.height).toEqual(80);

	});

	it("can assume the properties of an existing DisplayGroup", function() {

		var group2 = new Fizz.DisplayGroup();
			group2.addChild(child1, child2, child3);

		group.copy(group2);

		expect(group.childAt(0)).not.toBe(child1);
		expect(group.childAt(0).name).toMatch(child1.name);
		expect(group.childAt(1)).not.toBe(child2);
		expect(group.childAt(0).name).toMatch(child1.name);
		expect(group.childAt(2)).not.toBe(child3);
		expect(group.childAt(0).name).toMatch(child1.name);

	});

	it("can be used to create new DisplayGroups (clones)", function() {

		child1 = new Fizz.DisplayEntity({
			position: [128,128],
			size: [16,16]
		});		

		child2 = new Fizz.DisplayEntity({
			position: [16,16],
			size: [0,0]
		});

		var group1 = new Fizz.DisplayGroup();
			group1.addChild(child1, child2);

		var group2 = group1.clone();

		expect(group2).not.toBe(group);
		expect(group2.children.length).toEqual(group1.children.length);
		
		expect(group2.childAt(0)).not.toBe(child1);
		expect(group2.childAt(0).position.equals(child1.position)).toBeTruthy();
		expect(group2.childAt(0).size.equals(child1.size)).toBeTruthy();

		expect(group2.childAt(1)).not.toBe(child2);
		expect(group2.childAt(1).position.equals(child2.position)).toBeTruthy();
		expect(group2.childAt(1).size.equals(child2.size)).toBeTruthy();

	});

	it("can be represented by a string", function() {
		var name = "[DisplayGroup (name='" + group.name + "', " +
			"childCount='" + group.children.length + "')]";
		expect(group.toString()).toEqual(name);
	});

});