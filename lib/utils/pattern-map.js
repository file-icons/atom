"use strict";

const {isRegExp} = require("./general.js");
const instancePatterns = new WeakMap();


/**
 * RegExp-aware variant of an ordinary ES6 Map.
 *
 * Because RegExp values are objects, an ordinary Map always considers two
 * patterns to be distinct, even when fundamentally identical. PatternMaps
 * solve this by keying "identical" expressions to the same value.
 *
 * @class
 */
class PatternMap extends Map {
	
	/**
	 * Create a new PatternMap, optionally with initial keys and values.
	 *
	 * @param {*} [iterable] - An iterable in the format expected by Map constructors.
	 * @throws {TypeError} Keys must be strings or {@link RegExp} instances.
	 * @constructor
	 */
	constructor(iterable = null){
		super();
		instancePatterns.set(this, new Map());
		
		if(null !== iterable)
			for(const entry of iterable)
				this.set(...entry);
	}
	
	
	/**
	 * Check if an entry exists that's keyed to the designated pattern.
	 *
	 * @param {String|RegExp} key
	 * @return {Boolean}
	 */
	has(key){
		const patterns = instancePatterns.get(this);
		const string = key.toString();
		return patterns.has(string);
	}
	
	
	/**
	 * Retrieve the value keyed to a pattern.
	 *
	 * @param {String|RegExp}
	 * @return {*}
	 */
	get(key){
		if(!key) return undefined;
		const patterns = instancePatterns.get(this);
		const string = key.toString();
		const regexp = patterns.get(string);
		return super.get(regexp);
	}
	
	
	/**
	 * Add or modify the value keyed to a specified pattern.
	 *
	 * @param  {String|RegExp} key
	 * @param  {*} value
	 * @throws {TypeError} Key must be a string or {@link RegExp}.
	 * @return {PatternMap} Reference to the calling `PatternMap`.
	 */
	set(key, value){
		let string = key.toString();
		let regexp = key;
		
		if(!isRegExp(key))
			throw new TypeError("PatternMap keys must be regular expressions");
		
		const patterns = instancePatterns.get(this);
		
		patterns.has(string)
			? regexp = patterns.get(string)
			: patterns.set(string, regexp);
		
		return super.set(regexp, value);
	}
	
	
	/**
	 * Delete the value that's keyed to a pattern, if any.
	 *
	 * @param {String|RegExp} key
	 * @return {Boolean} Whether the key existed and was deleted.
	 */
	delete(key){
		const patterns = instancePatterns.get(this);
		const string = key.toString();
		const regexp = patterns.get(string);
		
		if(regexp){
			patterns.delete(string);
			return super.delete(regexp);
		}
		
		else return false;
	}
	
	
	
	/**
	 * Remove all patterns and values held in the instance.
	 */
	clear(){
		const patterns = instancePatterns.get(this);
		patterns.clear();
		super.clear();
	}
	
	
	/**
	 * Match the instance's keys against a string.
	 *
	 * @param {String}  input
	 * @param {Boolean} [matchAllKeys=false]
	 * @return {Array|null}
	 */
	match(input, matchAllKeys = false){
		if(!input)
			return null;
		
		input = input.toString();
		
		if(matchAllKeys){
			const matches = [];
			for(const [pattern] of this){
				const match = input.match(pattern);
				if(null !== match)
					matches.push([pattern, match]);
			}
			return matches;
		}
		
		else{
			for(const [pattern] of this){
				const match = input.match(pattern);
				if(null !== match)
					return [pattern, match];
			}
			return null;
		}
	}
}


module.exports = PatternMap;
