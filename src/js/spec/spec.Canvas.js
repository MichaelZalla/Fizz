describe("A Canvas", function() {

	var doc = null,
		wrapper = null,
		element = null;

	beforeEach(function() {

		// Clear the page of any canvases
		window.document.body.getElementsByTagName("CANVAS")
		.foreach(function(canvas) {
			if(canvas instanceof HTMLCanvasElement) {
				window.document.body.removeChild(canvas);
			}
		});
		
		// Construct an empty HTML document
		doc = window.document;
		
		// Create a HTMLCanvasElement and configure
		element = doc.createElement("canvas");
		element.width = 640;
		element.height = 480;
		element.style.width = element.width + 'px';
		element.style.height = element.height + 'px';
		
		// Append the canvas element to the detatched document
		// (Necessary for testing)
		doc.body.appendChild(element);

		// Wrap the element with Canvas functionality
		wrapper = new Fizz.Canvas(element);

	});

	afterEach(function() {
		if(element.parentNode === doc) {
			doc.body.removeChild(element);
		}
	});

	it("is a Canvas (wrapper), and extends the native Object", function() {
		
		expect(wrapper instanceof Fizz.Canvas).toBeTruthy();
		expect(wrapper instanceof Object).toBeTruthy();
		
	});

	it("exposes a reference to the current associated canvas element", function() {

		expect(wrapper.element.width).toEqual(640);
		expect(wrapper.element.height).toEqual(480);
		expect(wrapper.element.ownerDocument).toBe(doc);

	});

	it("restricts its 'element' property to be of type HTMLCanvasElement", function() {

		expect(wrapper.element instanceof HTMLCanvasElement).toBeTruthy();
		expect(wrapper.element).toBe(element);
		wrapper.element = 123;
		expect(wrapper.element).toBe(element);

	});

	it("exposes a windowPosition value describing its associated canvas " +
	   "element's position in its document relative to the window", function() {

	   	wrapper.element.style.assign({
	   		display: 'block',
	   		position: 'absolute',
	   		top: '0px',
	   		left: '0px' 
	   	});

	   	expect(wrapper.windowPosition.toList()).toEqual([ 0, 0 ]);

	   	wrapper.element.style.assign({
	   		display: 'block',
	   		position: 'absolute',
	   		top: '32px',
	   		left: '32px' 
	   	});

	   	expect((wrapper.windowPosition).toList()).toEqual([ 32, 32 ]);

	});

	it("yields a windowPosition of [0, 0] if the current associated canvas " +
	   "element is not attached to a document", function() {

	   	doc.body.removeChild(element);
	   	expect(wrapper.windowPosition.toList()).toEqual([ 0, 0 ]);

	});

	it("supports the dynamic properties 'width' and 'height' " +
	   "for updating the associated canvas element's dimensions", function() {

	   	expect(wrapper.width === wrapper.element.width).toBeTruthy();
		expect(wrapper.height === wrapper.element.height).toBeTruthy();
		expect(wrapper.width).toEqual(640);
		expect(wrapper.height).toEqual(480);

	});

	it("offers a method for returning a scaled copy of the canvas", function() {

	   	var scaledDown = wrapper.scale(0.5, 0.25);
	   	expect(scaledDown.width).toEqual(element.width * 0.5);
	   	expect(scaledDown.height).toEqual(element.height * 0.25);

	});
	
	it("offers a method for copying a portion (or all) of its associated " +
	   "canvas element's image data into a new canvas element", function() {

	   	var canvasCopy = wrapper.splice();

	   	expect(canvasCopy instanceof HTMLCanvasElement).toBeTruthy();
	   	expect(canvasCopy.width).toEqual(wrapper.element.width);
	   	expect(canvasCopy.height).toEqual(wrapper.element.height);
	   	expect(canvasCopy).not.toBe(wrapper.element);

	   	var partialCanvasCopy = wrapper.splice(150, 150, 50, 100);
	   	expect(partialCanvasCopy.width).toEqual(50);
	   	expect(partialCanvasCopy.height).toEqual(100);

	});

	it("can assume the properties of an existing Canvas wrapper", function(){

		var copyTo = new Fizz.Canvas();
	   		copyTo.copy(wrapper);
	   	
	   	expect(copyTo.width).toEqual(wrapper.width);
	   	expect(copyTo.height).toEqual(wrapper.height);
	   	expect(copyTo.element).not.toBe(wrapper.element);

	});
	
	it("can be used to create new Canvas wrappers (clones)", function(){

		var clone = wrapper.clone();
		expect(clone.width).toEqual(wrapper.width);
	   	expect(clone.height).toEqual(wrapper.height);
	   	expect(clone.element).not.toBe(wrapper.element);

	});
	
	it("can be represented by a string", function(){
		expect(wrapper.toString()).toMatch("[Stage (width='600', height='400')]");
	});

});
