describe("A Fontsheet", function() {

	var sheet = null,
		uri = "/suites/assets/fontsheets/font1.png";

	beforeEach(function(done) {

		sheet = new Fizz.Fontsheet({
			source: uri,
			fontName: "My Cool Font",
			glyphSet: {
				width: 86,
				height: 140,
				values: " !\"#$%&'()*+,-./0123456789:;<=>?@" +
						"ABCDEFGHIJKLMNOPQRSTUVWXYZ[/]^_`ab" +
						"cdefghijklmnopqrstuvwxyz{|}~"
			}
		});

		sheet.on(Fizz.Spritesheet.EVENTS.LOAD, done);

	});

	it("is a Fontsheet, and extends the Spritesheet class", function() {
		expect(sheet instanceof Fizz.Fontsheet).toBeTruthy();
		expect(sheet instanceof Fizz.Spritesheet).toBeTruthy();
	});

	it("requires that its glyph set be defined inside of a settings object " +
	   "passed to its constructor", function() {

	   	expect(Fizz.Fontsheet.prototype.init.bind({ }, null)).toThrow();
	   	expect(Fizz.Fontsheet.prototype.init.bind({ }, [ ])).toThrow();
	   	expect(Fizz.Fontsheet.prototype.init.bind({ }, [{ foo: "bar" }])).toThrow();

	   	expect(function() {
	   		new Fizz.Fontsheet({
		   		glyphSet: {
		   			width: 16,
		   			height: 16,
		   			values: "ABC"
		   		}
		   	});
	   	}).not.toThrow();

	});

	it("can retrieve individual glyphs from the fontsheet, given a glyph value", function() {
		expect(sheet.getGlyph('a') instanceof HTMLCanvasElement).toBeTruthy();
		expect(sheet.getGlyph('a').width).toEqual(86);
		expect(sheet.getGlyph('a').height).toEqual(140);
		expect(sheet.getGlyph('a')).toBe(sheet.getGlyph('a'));
		expect(sheet.getGlyph('a')).not.toBe(sheet.getGlyph('b'));
	});

	it("can retrieve some basic information about the loaded glyph set", function() {
		var metrics = sheet.getMetrics();
		expect(metrics.glyphCount).toEqual(95);
		expect(metrics.glyphWidth).toEqual(86);
		expect(metrics.glyphHeight).toEqual(140);
	});

	it("exposes the read-only 'fontName' property for identifying fontsheets", function() {
		expect(sheet.fontName).toMatch("My Cool Font");
	});

	it("can be represented by a string", function() {
		expect(sheet.toString()).toMatch("[Fontsheet (fontName='My Cool Font')]");
	});

});