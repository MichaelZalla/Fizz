describe("The Math module", function() {

	var withGreatProbability = function(conditionalTestFn, expectedProbability) {
		
		expectedProbability = (typeof expectedProbability === "number") ? expectedProbability : 0.9;
		
		var pLowerBound = expectedProbability - 0.1,
			pUpperBound = expectedProbability + 0.1,
			totalTrials = 999,
			expectedOccurredCount = 0;

		for(var i = 0; i < totalTrials; i++) {
			if(conditionalTestFn()) {
				expectedOccurredCount++;
			}
		}

		var frequency = expectedOccurredCount / totalTrials;
		
		return (frequency >= pLowerBound && frequency <= pUpperBound);

	};

	it("introduces the 'Math' component of the Fizz library", function() {
		expect(Fizz.Math).toBeDefined();
	});

	describe("the 'randomInt' method", function() {
		it("Returns a pseudo-random integer within the range [min, max]", function() {
		   	expect(withGreatProbability(function() {
		   		var random = Fizz.Math.randomInt(-25, 25);
		   		return (random >= -25 && random <= 25);
		   	})).toBeTruthy();
		});
		it("assumes the range [0, 1] when none is provided", function() {
			expect(withGreatProbability(function() {
				var random = Fizz.Math.randomInt();
				return (random > -1 && random < 2);
			})).toBeTruthy();
		});
		it("assumes the range [0, max] when a single parameter is passed", function() {
			expect(withGreatProbability(function() {
				var random = Fizz.Math.randomInt(50);
				return (random > -1 && random < 51);
				
			})).toBeTruthy();
		});
	});

	describe("the 'randomFloat' method", function() {
		it("Returns a pseudo-random floating-point value within the range [min, max]", function() {
			expect(withGreatProbability(function() {
				var random = Fizz.Math.randomFloat(-50.25, 200.75);
				return (random >= -50.25 && random <= 200.75);
			})).toBeTruthy();
		});
		it("assumes the range [0.0, 1.0] when none is provided", function() {
			expect(withGreatProbability(function() {
				var random = Fizz.Math.randomFloat();
				return (random >= 0.0 && random <= 1.0);
			})).toBeTruthy();
		});
		it("assumes the range [0.0, max] when a single parameter is passed", function() {
			expect(withGreatProbability(function() {
				var random = Fizz.Math.randomFloat(144.0);
				return (random >= 0.0 && random <= 144.0);
			})).toBeTruthy();
		});
	});

	describe("the 'mapToDomain' method", function() {
		it("is used to scale a value into a given domain, using a given value range", function() {
			// Suppose we wanted to know room temperature (~70F) in Celsius
			var Farhenheit = [32, 212],
				Celsius = [0, 100];
			var converted = Fizz.Math.mapToDomain(Celsius, Farhenheit, 70.0);
			expect(parseInt(converted)).toEqual(21);
		});
		it("assumes the domain [0, max] when a number is passed as the domain", function() {
			expect(Fizz.Math.mapToDomain(100, [0,10], 5)).toEqual(50);
		});
		it("assumes the range [0, max] when a number is passed as the range", function() {
			expect(Fizz.Math.mapToDomain([-50, 50], 50, 25)).toEqual(0);
		});
		it("allows larger sets to be passed as domains or ranges", function() {
			var domain = [10,9,8,7,6,5,4,3,2,1,0];
			var range = [0, 25, 50, 75, 100];
			expect(Fizz.Math.mapToDomain(domain, range, 50)).toEqual(5);
		});
	});

	describe("the 'wrapAround' method", function() {
		it("resolves a value into a bounded domain", function() {
			expect(Fizz.Math.wrapAround([0, 3], 4)).toEqual(0);
		});
		it("assumes the domain [0, max] when a number is passed as the range", function() {
			expect(Fizz.Math.wrapAround(9, 10)).toEqual(0);
		});
		it("can be useful to resolving array indices", function() {
			var list = [1,2,3,4,5];
			expect(Fizz.Math.wrapAround(list.length - 1, 7)).toEqual(2);
		});
	});

});