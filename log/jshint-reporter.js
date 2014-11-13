"use strict";

require("string-format");

module.exports = {
	
	reporter: function(results, config, options) {
		
		var notices = [ ];
		var sp = new Array(3).join(' ');
		var noticeTemplate = "{0.file!getBaseFileName}:{0.error.line}" +
							 ":" + sp + "{0.error.reason}\n>>>" + sp +
							 "{0.error.evidence}";

		String.prototype.format.transformers.getBaseFileName = function() {
			var p = this.split('/');
			return p[p.length-1];
		};

		results.forEach(function(notice) {
			notice.error.evidence = notice.error.evidence.replace(/\t/g, '');
			notices.push(noticeTemplate.format(notice));
		});

		delete String.prototype.format.transformers.getBaseFileName; // Cleanup

		if(notices.length) console.log(notices.join("\n\n") + "\n");

		console.log("({0.length} errors)\n".format(notices));

	}

};