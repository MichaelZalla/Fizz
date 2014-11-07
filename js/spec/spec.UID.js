describe("A UID", function() {

	var uid = null;

	afterEach(function() {
		// Reach into the UID object and adjust its counter value
		Fizz.UID._nextID = 0;
	});

	it("cannot be directly instantiated", function() {
		var e = new Error("Error: UID object cannot be instantiated!");
		expect(function() { uid = new Fizz.UID(); }).toThrow(e);
	});

	it("creates an internal counter whose value begins at zero", function() {
		expect(Fizz.UID.get()).toEqual(0);
	});

	it("increments its counter variable once after every call to its 'get' method", function() {
		expect(Fizz.UID.get()).toEqual(0);
		expect(Fizz.UID.get()).toEqual(1);
		expect(Fizz.UID.get()).toEqual(2);
		expect(Fizz.UID.get()).toEqual(3);
	});

});