"use strict";

let fn = null;

module.exports = function(filename){
	return null !== fn
		? fn(filename)
		: "icon-file-text";
};



module.exports.setHandler = setHandler;

function setHandler(input){
	fn = input;
	delete module.exports.setHandler;
}
