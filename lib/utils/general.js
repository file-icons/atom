"use strict";

module.exports = {
	
	/**
	 * Return true if the given value is a {@link String}.
	 *
	 * @param {Mixed} input
	 * @return {Boolean}
	 */
	isString(input){
		return "[object String]" === Object.prototype.toString.call(input);
	},
	
	
	/**
	 * Return true if the given value is a {@link RegExp}.
	 *
	 * @param {Mixed} input
	 * @return {Boolean}
	 */
	isRegExp(input){
		return "[object RegExp]" === Object.prototype.toString.call(input);
	},
	
	
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
	isNumeric(i){
		return "" !== i && +i == i && (String(i) === String(+i) || !/[^\d\.]+/.test(i));
	},
	
	
	/**
	 * "Flatten" a (possibly nested) list of strings into a single-level array.
	 *
	 * Strings are split by whitespace as separate elements of the final array.
	 *
	 * @param {Array|String} input
	 * @return {String[]} An array of strings
	 */
	collectStrings(input, refs = null){
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
	},
	
	
	/**
	 * Locate the root directory shared by multiple paths.
	 *
	 * @param {Array} paths - A list of filesystem paths
	 * @return {String}
	 */
	findBasePath(paths){
		const POSIX = paths[0].indexOf("/") !== -1;
		let matched = [];
		
		/** Spare ourselves the trouble if there's only one path */
		if(1 === paths.length){
			matched = (paths[0].replace(/[\\/]+$/, "")).split(/[\\/]/g);
			matched.pop();
		}
		
		/** Otherwise, comb each array */
		else{
			const rows   = paths.map(d => d.split(/[\\/]/g));
			const width  = Math.max(...rows.map(d => d.length));
			const height = rows.length;
			
			let x, y;
			X: for(x = 0; x < width; ++x){
				const str = rows[0][x];
				for(let y = 1; y < height; ++y)
					if(str !== rows[y][x]) break X;
				matched.push(str);
			}
		}
		
		return matched.join(POSIX ? "/" : "\\");
	},
	
	
	/**
	 * Generate an exception-proof version of a function.
	 *
	 * @param {Function} fn
	 * @param {Object} [context]
	 * @return {Function}
	 */
	nerf(fn, context = null){
		if("function" !== typeof fn)
			throw new TypeError("Argument must be a function");
		
		let lastError = null;
		const handler = function(...args){
			let result = null;
			try{result = fn.call(context, ...args)}
			catch(e){lastError = e}
			finally{return result}
		};
		return Object.defineProperty(handler, "lastError", {
			get(){ return lastError; },
			set(e){ lastError = e; }
		});
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
	 * Bind each of an object's methods to itself.
	 *
	 * @param {Object} subject
	 * @return {Object} The object that was passed.
	 */
	bindMethods(subject){
		const proto = subject.constructor.prototype;
		const keys = new Set([
			...Object.getOwnPropertyNames(proto),
			...Object.keys(subject)
		]);
		for(const key of keys)
			if("function" === typeof subject[key] && "constructor" !== key)
				subject[key] = subject[key].bind(subject);
		return subject;
	},
	
	
	/**
	 * Synchronous, callback-aware version of Promise.all.
	 *
	 * Functions are resolved using their return values.
	 * All other values are resolved normally.
	 *
	 * An array of values may also be used instead of multiple
	 * arguments. The array must be the only argument given.
	 *
	 * @example chain(() => promise1, "string"…);
	 * @param {...*} values
	 * @return {Promise}
	 */
	chain(...values){
		if(1 === values.length && Array.isArray(values[0]))
			values = [...values[0]];
		
		let promise = Promise.resolve();
		let rejection = null;
		const results = [];
		
		for(const value of values)
			promise = promise.then(result => {
				results.push(result);
				return "function" === typeof value ? value() : value;
			}).catch(error => {
				if(null === rejection)
					rejection = null == error ? true : error;
				return Promise.reject(error);
			});
		
		return promise.then(result => {
			results.push(result);
			results.shift();
			return null !== rejection
				? Promise.reject(rejection)
				: Promise.resolve(results);
		});
	},
	
	
	/**
	 * Return a {Promise} that resolves after a delay.
	 *
	 * @param {Number} [delay=100] - Milliseconds to wait
	 * @return {Promise}
	 */
	wait(delay = 100){
		return new Promise(resolve => {
			setTimeout(() => resolve(), delay);
		});
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
	 * Turn capturing groups in an expression into non-capturing groups.
	 *
	 * @todo Think of a shorter name for this?
	 * @param {RegExp} pattern
	 * @return {RegExp}
	 */
	forceNonCapturing(pattern){
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
		
		// Don't bother doing anything if this isn't a string
		if("[object String]" !== Object.prototype.toString.call(input))
			return input;
		
		const output = input
			.replace(/([A-Z])([A-Z]+)/g, (a, b, c) => b + c.toLowerCase())
			.split(/\B(?=[A-Z])|[-\s]/g)
			.map(i => i.replace(/([/\\^$*+?{}\[\]().|])/g, "\\$1?"))
			.join("[\\W_ \\t]?")
			.replace(/[0Oo]/g, "[0o]");
		
		// Author's requested the regex source; return a string
		if(String === format)
			return output;
		
		// Otherwise, crank the fuzz
		return new RegExp(output, "i");
	},
	
	
	
	/**
	 * Synthesise case-insensitivity for a regexp string.
	 *
	 * JavaScript doesn't support scoped modifiers like (?i),
	 * so this method seeks to approximate the next best thing.
	 *
	 * @param {String} input - Case-insensitive text
	 * @param {Boolean} fuzz - Apply {@link fuzzyRegExp} to input
	 * @return {String}
	 */
	caseKludge(input, fuzz = false){
		
		let output = input.split("").map((s, index, array) => {
			
			if(/[A-Z]/.test(s)){
				const output = "[" + s + s.toLowerCase() + "]";
				const prev = array[index - 1];
				
				// camelCase
				if(fuzz && prev && /[a-z]/.test(prev))
					return "[\\W_\\S]*" + output;
				
				return output;
			}
			
			if(/[a-z]/.test(s))
				return "[" + s.toUpperCase() + s + "]";
			
			if(!fuzz)
				return s.replace(/([/\\^$*+?{}\[\]().|])/g, "\\$1");
			
			if("0" === s)
				return "[0Oo]";
			
			if(/[\W_ \t]?/.test(s))
				return "[\\W_ \\t]?";
			
			return s;
		
		}).join("");
		
		if(fuzz)
			output = output.replace(/\[Oo\]/g, "[0Oo]");
		
		return output.replace(/(\[\w{2,3}\])(\1+)/g, (match, first, rest) => {
			return first + "{" + ((rest.length / first.length) + 1) + "}"
		});
	},
	
	
	/**
	 * Convert an RGB colour to HSL.
	 *
	 * @param {Number[]} channels - An array holding each RGB component
	 * @return {Number[]}
	 */
	rgbToHSL(channels){
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
};
