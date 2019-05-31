"use strict";

require("mocha-when")({lowercaseIt: false});

module.exports = {
	bail: !AtomMocha.isCI,
	require: ["chai/register-should"],
	slow: 9999,
	specPattern: /[\\\/]\d+-\w+\.js$/,
};
