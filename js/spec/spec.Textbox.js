describe("A Textbox", function() {

	var uri = "/suites/assets/fontsheets/font1.png",
		fontsheet = null,
		textbox = null;

	beforeEach(function(done) {

		fontsheet = new Fizz.Fontsheet({
			source: uri,
			glyphSet: {
				width: 86,
				height: 140,
				values: " !\"#$%&'()*+,-./0123456789:;<=>?@" +
						"ABCDEFGHIJKLMNOPQRSTUVWXYZ[/]^_`ab" +
						"cdefghijklmnopqrstuvwxyz{|}~"
			}
		});

		textbox = new Fizz.Textbox({
			'fontsheet': fontsheet,
			'content': "ABC"
		});

		fontsheet.on('load', done);

	});

	it("is a Textbox, and extends the DisplayGrid class", function() {
		expect(textbox instanceof Fizz.Textbox).toBeTruthy();
		expect(textbox instanceof Fizz.DisplayGrid).toBeTruthy();
	});

	it("exposes a 'content' property whose value defines its appearance",
	function() {
		var prose = "Something is rotten in the state of Denmark";
		textbox.content = prose;
		expect(textbox.content).toMatch(prose);
	});

	it("emits a 'contentchanged' event when its content is modified",
	function(done) {
		
		var textbox = new Fizz.Textbox({
			'fontsheet': fontsheet,
			'content': "Same old"
		});

		textbox.on('contentchanged', function() {
			expect(textbox.content).toMatch("Something completely different");
			done();
		});

		textbox.content = "Same old";
		textbox.content = "Same old";
		textbox.content = "Same old";

		textbox.content = "Something completely different!";

	});

	it("will pass a copy of its content along with every 'contentchanged' " +
	   "event that it emits", function(done) {

	   	var textbox = new Fizz.Textbox({
			'fontsheet': fontsheet,
			'content': "Elementary ..."
		});

		textbox.on('contentchanged', function(e) {
			expect(e.content).toMatch(textbox.content);
			done();
		});

		textbox.content = "... my dear Watson!";

	});

	it("will update its cache whenever its content has been modified",
	function() {

		textbox.content = "geraffes are so dumb";
		
		expect(textbox.columns).toEqual(20);
		expect(textbox.rows).toEqual(1);

		expect(textbox._cacheCanvas.width).toEqual(86 * textbox.columns);
		expect(textbox._cacheCanvas.height).toEqual(140 * textbox.rows);

		document.body.appendChild(textbox._cacheCanvas);

	});

	it("can assume the properties of an existing Textbox", function() {
		
		var helloWorld = new Fizz.Textbox({
			'fontsheet': fontsheet,
			'content': "Hello, world!"
		});

		textbox.copy(helloWorld);

		expect(textbox.content).toMatch(helloWorld.content);
		expect(textbox.maxColumnLength).toMatch(helloWorld.maxColumnLength);

		expect(textbox._cacheCanvas).not.toBe(helloWorld._cacheCanvas);
		expect(textbox._cacheCanvas.width).toEqual(86 * textbox.columns);
		expect(textbox._cacheCanvas.height).toEqual(140 * textbox.rows);

	});

	it("can be used to create new Textboxes (clones)", function() {
		var clone = textbox.clone();
		expect(clone.fontsheet).toMatch(textbox.fontsheet);
		expect(clone.content).toMatch(textbox.content);
		expect(clone.maxColumnLength).toMatch(textbox.maxColumnLength);
	});

	it("can be represented by a string", function() {
		expect(textbox.toString()).toMatch("[Textbox (content='" + this._content + "')]");
	});

});