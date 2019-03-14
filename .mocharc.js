"use strict";

require("mocha-when")({lowercaseIt: false});

module.exports = {
	bail: true,
	require: ["chai/register-should"],
	slow: 9999,
	specPattern: /[\\\/]\d+-\w+\.js$/,
};
