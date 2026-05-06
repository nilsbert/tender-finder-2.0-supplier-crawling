'use strict';

var emotion = require('@porsche-design-system/components-js/emotion');



Object.keys(emotion).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return emotion[k]; }
	});
});
