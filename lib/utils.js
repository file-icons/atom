"use strict";

module.exports = {
	caseKludge,
	collectStrings,
	escapeRegExp,
	findBasePath,
	forceNonCapturing,
	fuzzyRegExp,
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
 * @return {String}
 */
function caseKludge(input){
	return input.split("").map(match =>
		/[A-Z]/.test(match) ? "[" + match + match.toLowerCase() + "]" :
		/[a-z]/.test(match) ? "[" + match + match.toUpperCase() + "]" :
		match
	).join("").replace(/(\[\w{2,3}\])(\1+)/g, (match, first, rest) =>
		first + "{" + ((rest.length / first.length) + 1) + "}");
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
	if("string" !== typeof input)
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
