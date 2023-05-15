var config = require('../../config');

module.exports = {
	
	log: function (payload, preJumpLineCount, postJumpLineCount) {
        if (config.platform.enableLogging) {
			if (Number.isInteger(preJumpLineCount) && preJumpLineCount > 0) {
				for (var i = 0; i < preJumpLineCount; i++) {
					console.log('');
				}
			}
			if (payload) {
				console.log(payload);
			}
			if (Number.isInteger(postJumpLineCount) && postJumpLineCount > 0) {
				for (var i = 0; i < postJumpLineCount; i++) {
					console.log('');
				}
			}
		}
	}

};