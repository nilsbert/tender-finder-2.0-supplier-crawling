'use strict';

var tokens = require('@porsche-design-system/components-js/tokens');



Object.keys(tokens).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return tokens[k]; }
	});
});
