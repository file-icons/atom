"use strict";

module.exports = {
	collectStrings,
	escapeRegExp,
	findBasePath,
	forceNonCapturing,
	rgbToHSL,
	wait,
};


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
	return input.replace(/[/\\^$*+?{}[\]().|]/g, "\\$&");
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
