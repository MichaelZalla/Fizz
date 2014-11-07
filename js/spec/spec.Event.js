describe("An Event", function() {

	var e = null;

	it("is an Event", function() {
		e = new Fizz.Event();
		expect(e instanceof Fizz.Event).toBeTruthy();
	});

	it("can be given a type, bubbling behavior, and cancelability " +
	   "value at instantiation", function() {
		e = new Fizz.Event('FooEvent', true, true);
		expect(e.type).toEqual('FooEvent');
		expect(e.bubbles).toBeTruthy();
		expect(e.cancelable).toBeTruthy();
	});

	it("can be instantiated with a settings object", function() {
		e = new Fizz.Event({
			type: 'FooEvent',
			bubbles: true,
			cancelable: true
		});
		expect(e.type).toEqual('FooEvent');
		expect(e.bubbles).toBeTruthy();
		expect(e.cancelable).toBeTruthy();
	});

	it("defaults to the NONE event phase", function() {
		e = new Fizz.Event();
		expect(e.eventPhase).toEqual(Fizz.Event.PHASE.NONE);
	});

	it("can be stopped before propogating (bubbling) up " +
	   "the hierarchy", function() {
		e = new Fizz.Event({ bubbles: true })
		expect(e.canceled).toBeFalsy();
		e.stopPropagation();
		expect(e.canceled).toBeTruthy();
	});

	it("can be stopped before triggering subsequent listeners at " +
	   "the same hierarchy level", function() {
	   	e = new Fizz.Event();
	   	expect(e.immediatelyCanceled).toBeFalsy();
	   	e.stopPropagation();
	   	expect(e.immediatelyCanceled).toBeFalsy();
	   	e.stopImmediatePropagation();
	   	expect(e.immediatelyCanceled).toBeTruthy();
	});

	it("can be represented by a string", function() {
		e = new Fizz.Event('FooEvent');
		expect(e.toString()).toEqual("[Event (type='FooEvent', target='null')]");
	});

});