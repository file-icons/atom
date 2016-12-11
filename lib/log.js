"use strict";

class Log{
	
	constructor(){
		this.errors = [];
	}
	
	
	error(description, ...args){
		this.errors.push([
			new Date(),
			description,
			...args
		]);
	}
}

module.exports = new Log();
