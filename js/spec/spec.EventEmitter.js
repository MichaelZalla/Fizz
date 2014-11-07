describe("The EventEmitter constructor", function() {

	it("exposes an initializer method to give class functionality " +
	   "to existing prototypes", function() {

   		var Foo = Object.extend({
   			init: function() { this.bar = 'baz'; }
   		});
   		expect(Foo.prototype.addEventListener).toBeUndefined();

   		Fizz.EventEmitter.initialize(Foo.prototype);
		expect(Foo.prototype.addEventListener).toBeDefined();
		expect(typeof Foo.prototype.addEventListener == "function").toBeTruthy();

	});

	it("exposes an initializer method to give class functionality " +
	   "to existing instances of a class", function() {

	   	var Foo = Object.extend({
	   		init: function() { this.bar = 'baz'; }
	   	});

	   	var myFoo = new Foo();
	   	expect(myFoo.addEventListener).toBeUndefined();

	   	Fizz.EventEmitter.initialize(myFoo);
	   	expect(Foo.prototype.addEventListener).toBeUndefined();
	   	expect(myFoo.addEventListener).toBeDefined();
	   	expect(typeof myFoo.addEventListener == "function").toBeTruthy();

	});

});

describe("An EventEmitter", function() {

	var emitter = null;
	var out = null;

	beforeEach(function() {
		emitter = new Fizz.EventEmitter();
		out = [ ];
	});

	it("is an EventEmitter", function() {
		expect(emitter instanceof Fizz.EventEmitter).toBeTruthy();
	});

	it("has a method for registering callbacks (listeners) to trigger " +
       "when events of a specific type(s) are intercepted by the emitter", function() {

       	emitter.addEventListener('clickOnALot', console.log);
       	// Reaching inside of 'private' member data for testing
       	expect('clickOnALot' in emitter._events).toBeTruthy();
       	expect(emitter._events.clickOnALot).toBe(console.log);

	});

	it("will not register redundant callbacks for the same event type(s)", function() {

		// Reaching inside of 'private' member data (for testing)
		emitter.addEventListener('clickOnALot', console.log);
		expect(emitter._events.clickOnALot).toBe(console.log);
		
		emitter.addEventListener('clickOnALot', console.log);
		expect(emitter._events.clickOnALot instanceof Array).toBeFalsy();
		expect(emitter._events.clickOnALot).toBe(console.log);

	});

	it("supports multiple (unique) listeners to be registered to " +
	   "the same event type", function() {

	   	var callback1 = function(e) { console.log("Me first!"); };
	   	var callback2 = function(e) { console.log("Me second!"); };
	   	var callback3 = function(e) { console.log("Me third!"); };

	   	emitter.addEventListener('getInLine', callback1);
	   	expect(emitter._events.getInLine).toBe(callback1);

	   	emitter.addEventListener('getInLine', callback2);
	   	expect(emitter._events.getInLine instanceof Array).toBeTruthy();
	   	expect(emitter._events.getInLine[0]).toBe(callback1);
	   	expect(emitter._events.getInLine[1]).toBe(callback2);

	   	emitter.addEventListener('getInLine', callback3);
	   	expect(emitter._events.getInLine[2]).toBe(callback3);

	});

	it("has a method for de-registering registered event listeners", function() {
		
		var callback1 = function(e) { console.log("Me first!"); };
	   	var callback2 = function(e) { console.log("Me second!"); };
	   	var callback3 = function(e) { console.log("Me third!"); };

	   	emitter.addEventListener('getInLine', callback1);
	   	emitter.addEventListener('getInLine', callback2);
	   	emitter.addEventListener('getInLine', callback3);

	   	expect(emitter._events.getInLine[0]).toBe(callback1);

	   	emitter.removeEventListener('getInLine', callback1);
	   	expect(emitter._events.getInLine[0]).toBe(callback2);

	   	emitter.removeEventListener('getInLine', callback2);
	   	expect(emitter._events.getInLine).toBe(callback3);

	   	emitter.removeEventListener('getInLine', callback3);
	   	expect('getInLine' in emitter._events).toBeFalsy();

	});

	it("offers shortcut methods for adding and removing listeners", function() {

		expect(emitter.on).toBe(emitter.addEventListener);
		expect(emitter.off).toBe(emitter.removeEventListener);

	});

	it("has a method that can determine whether a listener is attached " +
	   "for a specific event type(s)", function() {

	   	var listener = function(e) { console.log("Reaction!"); };

	   	expect(emitter.listensFor('action')).toBeFalsy();
	   	emitter.addEventListener('action', listener);
	   	expect(emitter.listensFor('action')).toBeTruthy();

	});

	it("has a method for emitting Event instances", function() {

		var e = new Fizz.Event('Hapennins');
		emitter.emit(e);
		expect(e.target).toBe(emitter);

	});

	it("allows an event object to be decorated with arbitrary " +
	   "data before it is emitted", function() {

	   	var e = new Fizz.Event('keyDown');
	   	var data = { 'keyCode': 13 };
	   	emitter.emit(e, data);
	   	expect(e.keyCode).toEqual(data.keyCode);

	});

	it("facilitates the propagation (bubbling) of Events up through an " +
	   "object's parental hierarchy", function() {
		
	   	var e = new Fizz.Event('explosion', true, true);
	   	var emitter1 = new Fizz.EventEmitter();
	   	var emitter2 = new Fizz.EventEmitter();

	   	function explode() { out.push("KAABOOOOM!"); }
	   	function sizzle() { out.push("Sizzzzzzzllleeee *CRACK* ..."); }

	   	emitter1.addEventListener('explosion', explode);
	   	emitter2.addEventListener('explosion', sizzle);
	   	expect(out).toEqual([]);

	   	emitter1.emit(e);
	   	expect(out).toEqual(["KAABOOOOM!"]);
	   	emitter1.emit(e);
	   	expect(out).toEqual(["KAABOOOOM!","KAABOOOOM!"]);

	   	// Set up a new parental hierarchy between the emitters
	   	emitter1.parent = emitter2;
	   	emitter1.emit(e);
	   	expect(out).toEqual([
	   		"KAABOOOOM!",
	   		"KAABOOOOM!",
	   		"KAABOOOOM!",
	   		"Sizzzzzzzllleeee *CRACK* ..."
	   	]);

	});

	it("facilitates the propogation (capturing) of Events down through an " +
	   "object's children", function() {

	   	var GettingDressedEvent = Fizz.Event.extend({
	   		init: function() {
	   			this.type = 'gettingDressed';
	   			this.bubbles = true;
	   			this.cancelable = false;
	   		}
	   	});

	   	var req1 = new Fizz.EventEmitter();
	   		req1.addEventListener('gettingDressed', function(e) {
	   			out.push("Put on underwear");
	   		}, true);

	   	var req2 = new Fizz.EventEmitter();
	   		req2.addEventListener('gettingDressed', function(e) {
	   			out.push("Put on pants");
	   		}, true);

	   	var req3 = new Fizz.EventEmitter();
	   		req3.addEventListener('gettingDressed', function(e) {
	   			out.push("Put on belt");
	   		}, true);

	   	req3.parent = req2;
	   	req2.parent = req1;

	   	// Kinda weird, I know ...
	   	req3.emit(new GettingDressedEvent());

	   	expect(out).toEqual([
	   		"Put on underwear",
	   		"Put on pants",
	   		"Put on belt"
	   	]);

	});

	it("can accept callbacks which modify the referenced " +
	   "Event's properties", function() {

	   	var SingSongEvent = Fizz.Event.extend({
	   		init: function() {
	   			this.type = 'singSong';
	   		}
	   	});

	   	// Create a barber-shop quartet ...

	   	var musician1 = new Fizz.EventEmitter(),
	   		musician2 = new Fizz.EventEmitter(),
	   		musician3 = new Fizz.EventEmitter(),
	   		musician4 = new Fizz.EventEmitter();

		   	musician1.name = "Do";
		   	musician2.name = "Re";
		   	musician3.name = "Mi";
		   	musician4.name = "Bacon";
		   	
		   	musician1.parent = musician2;
		   	musician2.parent = musician3;
		   	musician3.parent = musician4;
		   	musician4.parent = null;

	   	function singNote() { out.push(this.name); }

	   	musician1.addEventListener('singSong', singNote);
	   	musician2.addEventListener('singSong', singNote);
	   	musician4.addEventListener('singSong', singNote);
	   	musician3.addEventListener('singSong', function(e) {
	   		singNote.call(this); // Function sing expects a specific context
	   		e.stopPropagation();
	   	});

	   	musician1.emit(new SingSongEvent());

	   	expect(out).toEqual(["Do","Re","Mi"]); out = [ ];

	});

	it("can be represented by a string", function() {
		emitter = new Fizz.EventEmitter();
		expect(emitter.toString()).toEqual("[EventEmitter]");
	});

});