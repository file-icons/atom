"use strict";

module.exports = {
	autoIt: true,
	bail: true,
	require: ["chai/register-should"],
	slow: 9999,
	specPattern: /[\\\/]\d+-\w+\.js$/,
};
