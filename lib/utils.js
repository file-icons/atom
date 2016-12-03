"use strict";

const fs = require("fs");

module.exports = {
	
	/**
	 * Extract the first line from a block of text.
	 *
	 * @param {String} input
	 * @return {String}
	 */
	getFirstLine(input){
		return input ? input.split(/\r?\n/).shift() : "";
	},
	
	
	isString(input){
		return "[object String]" === Object.prototype.toString.call(input);
	},
	
	
	isRegExp(input){
		return "[object RegExp]" === Object.prototype.toString.call(input);
	},
	
	
	/**
	 * Return TRUE if a variable is a Number or number-like String.
	 * 
	 * The string-checking is intentionally restricted to "basic" notation only: strings
	 * using advanced notation like hexadecimal, exponential or binary literals are ignored.
	 * E.g., "0b11100100", "0xE4" or "3.1536e+10" would, if supplied as strings, test as FALSE.
	 * 
	 * @param {Mixed} i - Value to inspect
	 * @return {Boolean}
	 */
	isNumeric(i){
		return "" !== i && +i == i && (String(i) === String(+i) || !/[^\d\.]+/.test(i));
	},
	
	
	/**
	 * Monkey-patch an object's method with another function.
	 *
	 * @param {Object} subject
	 * @param {String} methodName
	 * @param {Function} handler
	 * @return {Function[]}
	 */
	punch(subject, methodName, handler){
		const originalMethod = subject[methodName];
		
		const punchedMethod = function(){
			const call = () => originalMethod.apply(this, arguments);
			const args = Array.from(arguments);
			return handler.call(this, call, args);
		};
		
		subject[methodName] = punchedMethod;
		return [originalMethod, punchedMethod];
	},
	
	
	/**
	 * Escape special regex characters within a string.
	 *
	 * @example "file.js" -> "file\\.js"
	 * @param {String} input
	 * @return {String}
	 */
	escapeRegExp(input){
		return input.replace(/([/\\^$*+?{}\[\]().|])/g, "\\$1");
	},
	
	
	/**
	 * Generate an instance of fs.Stats from an object.
	 *
	 * Instances of fs.Stats are returned unmodified.
	 *
	 * @param {Object} input
	 * @return {Stats}
	 */
	statify(input){
		if(!input) return null;
		
		if(input instanceof fs.Stats)
			return input;
		
		const output = Object.create(fs.Stats.prototype);
		for(const key in input){
			const value = input[key];
			
			switch(key){
				case "atime":
				case "ctime":
				case "mtime":
				case "birthtime":
					output[key] = !(value instanceof Date)
						? new Date(value)
						: value;
					break;
				default:
					output[key] = value;
			}
		}
		
		return output;
	},

	
	/**
	 * Generate a regex to match a string, bypassing intermediate punctuation.
	 *
	 * E.g., "CoffeeScript" matches "coffee-script", "cOfFeE sCRiPT" or even
	 * "C0FFEE.SCRIPT". Useful when words have multiple possible spellings.
	 *
	 * @param {String} input - A string, such as "reStructuredText" or "dBASE"
	 * @param {Function} format - Desired output format (String or RegExp)
	 * @return {String|RegExp}
	 */
	fuzzyRegExp(input, format = RegExp){
		
		/** Don't bother doing anything if this isn't a string */
		if("[object String]" !== Object.prototype.toString.call(input))
			return input;
		
		const output = input
			.replace(/([A-Z])([A-Z]+)/g, (a, b, c) => b + c.toLowerCase())
			.split(/\B(?=[A-Z])|[-\s]/g)
			.map(i => i.replace(/([/\\^$*+?{}\[\]().|])/g, "\\$1?"))
			.join("[\\W_ \\t]?")
			.replace(/[0Oo]/g, "[0o]");
		
		/** Author's requested the regex source, return a string */
		if(String === format)
			return output;
		
		/** Otherwise, crank the fuzz */
		return new RegExp(output, "i");
	},
	
	
	
	/**
	 * Synthesise case-insensitivity for a regexp string.
	 *
	 * JavaScript doesn't support scoped modifiers like (?i),
	 * so this method seeks to approximate the next best thing.
	 *
	 * @param {String} input
	 * @param {Boolean} noFuzz
	 * @return {String}
	 */
	caseKludge(input, noFuzz){
		
		let output = input.split("").map((s, index, array) => {
			
			if(/[A-Z]/.test(s)){
				const output = "[" + s + s.toLowerCase() + "]";
				const prev = array[index - 1];
				
				// Camel-case
				if(!noFuzz && prev && /[a-z]/.test(prev))
					return "[\\W_\\S]*" + output;
				
				return output;
			}
			
			if(/[a-z]/.test(s))
				return "[" + s.toUpperCase() + s + "]";
			
			if(noFuzz)
				return s.replace(/([/\\^$*+?{}\[\]().|])/g, "\\$1");
			
			if("0" === s)
				return "[0Oo]";
			
			if(/[\W_ \t]?/.test(s))
				return "[\\W_ \\t]?";
			
			return s;
		
		}).join("");
		
		if(!noFuzz)
			output = output.replace(/\[Oo\]/g, "[0Oo]");
		
		return output.replace(/(\[\w{2,3}\])(\1+)/g, (match, first, rest) => {
			return first + "{" + ((rest.length / first.length) + 1) + "}"
		});
	}
};
