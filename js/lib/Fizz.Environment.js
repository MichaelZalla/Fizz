// Namespace
this.Fizz = this.Fizz || { };

(function() {

	function _isValid(value) {
		return _environments.keys().map(function(key) {
					return _environments[key];
				}).reduce(function(p, c) {
					return p || (c === value);
				}, false);
	}

	var _environments = {
		PRODUCTION: 'prod',
		DEVELOPMENT: 'dev'
	};

	var _environment = _environments.PRODUCTION;

	Fizz.getEnv = function() {
		return _environment;
	};

	Fizz.setEnv = function(env) {
		if(_isValid(env)) {
			_environment = env;
		}
	};

})();