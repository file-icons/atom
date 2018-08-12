"use strict";

module.exports = {
	caseKludge,
	collectStrings,
	escapeRegExp,
	findBasePath,
	forceNonCapturing,
	fuzzyRegExp,
	isNumeric,
	isRegExp,
	isString,
	rgbToHSL,
	wait,
};


/**
 * Synthesise case-insensitivity for a regexp string.
 *
 * JavaScript doesn't support scoped modifiers like (?i),
 * so this function attempts to approximate the closest thing.
 *
 * @param {String} input - Case-insensitive text
 * @param {Boolean} fuzz - Apply {@link fuzzyRegExp} to input
 * @return {String}
 */
function caseKludge(input, fuzz = false){
	let output = input.split("").map((s, index, array) => {
		if(/[A-Z]/.test(s)){
			const output = "[" + s + s.toLowerCase() + "]";
			const prev   = array[index - 1];
			if(fuzz && prev && /[a-z]/.test(prev))
				return "[\\W_\\S]*" + output;
			return output;
		}
		if(/[a-z]/.test(s))     return "[" + s.toUpperCase() + s + "]";
		if(!fuzz)               return s.replace(/([/\\^$*+?{}[\]().|])/g, "\\$1");
		if("0" === s)           return "[0Oo]";
		if(/[\W_ \t]?/.test(s)) return "[\\W_ \\t]?";
		return s;
	}).join("");
	
	if(fuzz)
		output = output.replace(/\[Oo\]/g, "[0Oo]");
	return output.replace(/(\[\w{2,3}\])(\1+)/g, (match, first, rest) => {
		return first + "{" + ((rest.length / first.length) + 1) + "}";
	});
}


/**
 * "Flatten" a (possibly nested) list of strings into a single-level array.
 *
 * Strings are split by whitespace as separate elements of the final array.
 *
 * @param {Array|String} input
 * @return {String[]} An array of strings
 */
function collectStrings(input, refs = null){
	refs = refs || new WeakSet();
	input = "string" === typeof input
		? [input]
		: refs.add(input) && Array.from(input);
	
	const output = [];
	for(const value of input){
		if(!value) continue;
		switch(typeof value){
			case "string":
				output.push(...value.split(/\s+/));
				break;
			case "object":
				if(refs.has(value)) continue;
				refs.add(value);
				output.push(...collectStrings(value, refs));
		}
	}
	return output;
}


/**
 * Escape special regex characters within a string.
 *
 * @example "file.js" -> "file\\.js"
 * @param {String} input
 * @return {String}
 */
function escapeRegExp(input){
	return input.replace(/([/\\^$*+?{}[\]().|])/g, "\\$1");
}


/**
 * Locate the root directory shared by multiple paths.
 *
 * @param {String[]} paths - A list of filesystem paths
 * @return {String} root
 */
function findBasePath(paths){
	const POSIX = -1 !== paths[0].indexOf("/");
	let matched = [];
	
	// Spare ourselves the trouble if there's only one path.
	if(1 === paths.length){
		matched = (paths[0].replace(/[\\/]+$/, "")).split(/[\\/]/g);
		matched.pop();
	}
	else{
		const rows   = paths.map(d => d.split(/[\\/]/g));
		const width  = Math.max(...rows.map(d => d.length));
		const height = rows.length;
		let x;
		X: for(x = 0; x < width; ++x){
			const str = rows[0][x];
			for(let y = 1; y < height; ++y)
				if(str !== rows[y][x]) break X;
			matched.push(str);
		}
	}
	
	return matched.join(POSIX ? "/" : "\\");
}

/**
 * Turn capturing groups in an expression into non-capturing groups.
 *
 * @example forceNonCapturing(/([A-Z]+)/) == /(?:[A-Z]+)/
 * @param {RegExp} pattern
 * @return {RegExp}
 */
function forceNonCapturing(pattern){
	const source = pattern.source
		.split(/\((?!\?[=<!])/)
		.map((segment, index, array) => {
			if(!index) return segment;
			return !/^(?:[^\\]|\\.)*\\$/.test(array[index - 1])
				? segment.replace(/^(?:\?:)?/, "(?:")
				: segment.replace(/^/, "(");
		})
		.join("");
	return new RegExp(source, pattern.flags);
}


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
function fuzzyRegExp(input, format = RegExp){
	if("[object String]" !== Object.prototype.toString.call(input))
		return input;
	
	const output = input
		.replace(/([A-Z])([A-Z]+)/g, (a, b, c) => b + c.toLowerCase())
		.split(/\B(?=[A-Z])|[-\s]/g)
		.map(i => i.replace(/([/\\^$*+?{}[\]().|])/g, "\\$1?"))
		.join("[\\W_ \\t]?")
		.replace(/[0Oo]/g, "[0o]");
	
	// Author's requested the regex source, return a string
	if(String === format)
		return output;
	
	// Otherwise, crank the fuzz
	return new RegExp(output, "i");
}


/**
 * Return true if a variable is a {@link Number} or number-like {@link String}.
 * 
 * String-checking is intentionally restricted to "basic" numeric forms only.
 * Advanced notation like hexadecimal, exponential or binary literals are ignored:
 * strings like "0b10100100", "0xE4" and "3.1536e+10" will each return `false`.
 * 
 * @param {Mixed} i - Value to inspect
 * @return {Boolean}
 */
function isNumeric(i){
	// eslint-disable-next-line
	return "" !== i && +i == i && (String(i) === String(+i) || !/[^\d.]+/.test(i));
}


/**
 * Return true if the given value is a {@link RegExp|regular expression}.
 *
 * @param {*} input
 * @return {Boolean}
 */
function isRegExp(input){
	return "[object RegExp]" === Object.prototype.toString.call(input);
}


/**
 * Return true if the given value is a {@link String}.
 *
 * @param {*} input
 * @return {Boolean}
 */
function isString(input){
	return "[object String]" === Object.prototype.toString.call(input);
}


/**
 * Convert an RGB colour to HSL.
 *
 * @param {Number[]} channels - An array holding each RGB component
 * @return {Number[]}
 */
function rgbToHSL(channels){
	if(!channels) return;
	
	const r     = channels[0] / 255;
	const g     = channels[1] / 255;
	const b     = channels[2] / 255;
	const min   = Math.min(r, g, b);
	const max   = Math.max(r, g, b);
	const lum   = (max + min) / 2;
	const delta = max - min;
	const sat   = lum < .5
		? (delta / (max + min))
		: (delta / (2 - max - min));
	
	let hue;
	switch(max){
		case r:  hue =     (g - b) / delta; break;
		case g:  hue = 2 + (b - r) / delta; break;
		default: hue = 4 + (r - g) / delta; break;
	}
	
	hue /= 6;
	
	if(hue < 0)
		hue += 1;
	
	return [ hue || 0, sat || 0, lum || 0 ];
}


/**
 * Return a {@link Promise} which auto-resolves after a delay.
 *
 * @param {Number} [delay=100] - Delay in milliseconds
 * @return {Promise}
 */
function wait(delay = 100){
	return new Promise(resolve => {
		setTimeout(() => resolve(), delay);
	});
}
