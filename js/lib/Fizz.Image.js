// Namespace
this.Fizz = this.Fizz || { };

(function() {

	//@TODO Create a test suite for the Fizz.image module!

	Fizz.image = { };

	Fizz.image.spliceCanvasArea = function(canvas, data) {

		if(!(canvas instanceof HTMLCanvasElement)) {
			throw new Error("Value for 'canvasElem' argument must be a Canvas element!");
		}

		var x = 0,
			y = 0,
			w = canvas.width,
			h = canvas.height;

		if(data instanceof Array && 4 === data.length) {
			x = data[0];
			y = data[1];
			w = data[2];
			h = data[3];
		}

		var clipping = document.createElement('canvas');
			clipping.width = w;
			clipping.height = h;

		var ctx = clipping.getContext('2d');
			ctx.drawImage.apply(ctx, [
				canvas, // clipping source
				x, y, 	// xPos and yPos of clipping
				w, h, 	// width and height of clipping
				0, 0, 	// xPos and yPos of drawing
				w, h 	// width and height of drawing
			]);

		return clipping;

	};

}());