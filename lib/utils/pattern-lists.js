"use strict";

const {isRegExp} = require("./general.js");
const instancePatterns = new WeakMap();


/**
 * RegExp-aware version of an ES6 Map.
 *
 * Regular expressions are treated as primitives, not objects: two
 * fundamentally identical expressions will always be keyed to the
 * same value.
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
	 * Return the PatternMap's default textual description.
	 *
	 * @return {String}
	 */
	get [Symbol.toStringTag](){
		return "PatternMap";
	}


	/**
	 * Match a string against each of the PatternMap's keys.
	 *
	 * @param {String}  input
	 * @param {Boolean} [matchAll=false]
	 * @return {Array|null}
	 * @see {@link matchPatternList}
	 */
	match(input, matchAll = false){
		return execPatternList(input, matchAll, ...this.keys());
	}
}



/**
 * RegExp-aware version of an ES6 Set.
 *
 * Regular expressions are treated as primitives, not objects: two
 * fundamentally identical expressions will always be keyed to the
 * same value.
 *
 * @class
 */
class PatternSet extends Set {

	/**
	 * Instantiate a new PatternSet, optionally with initial patterns.
	 *
	 * @param {*} [iterable] - An iterable of patterns to add
	 * @constructor
	 */
	constructor(iterable = null){
		super();
		instancePatterns.set(this, new Map());
		
		if(null === iterable)
			return;
		
		for(const entry of iterable)
			if(null != entry)
				this.add(entry);
	}
	
	
	/**
	 * Add a new pattern to the PatternSet.
	 *
	 * @param {RegExp} pattern
	 * @throws {TypeError} Values must be {@link RegExp} objects.
	 * @return {PatternSet} The calling instance
	 */
	add(pattern){
		if(!pattern || !isRegExp(pattern))
			throw new TypeError("Values added to a PatternSet must be regular expressions");
		
		const patterns = instancePatterns.get(this);
		const string   = pattern.toString();
		if(!patterns.has(string)){
			patterns.set(string, pattern);
			return super.add(pattern);
		}
		return this;
	}
	
	
	/**
	 * Remove a pattern from the PatternSet.
	 *
	 * @param {RegExp} pattern
	 * @return {Boolean} Whether the specified pattern was found and deleted.
	 */
	delete(pattern){
		const patterns = instancePatterns.get(this);
		const string = pattern.toString();
		const regexp = patterns.get(string);
		if(regexp){
			patterns.delete(string);
			return super.delete(regexp);
		}
		return false;
	}
	
	
	/**
	 * Empty the contents of the PatternSet.
	 */
	clear(){
		const patterns = instancePatterns.get(this);
		patterns.clear();
		super.clear();
	}
	
	
	/**
	 * Check if a pattern exists in the PatternSet.
	 *
	 * @param {String|RegExp} pattern
	 * @return {Boolean}
	 */
	has(pattern){
		const patterns = instancePatterns.get(this);
		const string = pattern.toString();
		return patterns.has(string);
	}
	
	
	/**
	 * Return the PatternSet's default textual description.
	 *
	 * @return {String}
	 */
	get [Symbol.toStringTag](){
		return "PatternSet";
	}
	
	
	/**
	 * Match a string against each pattern held in the PatternSet.
	 *
	 * @param {String} input
	 * @param {Boolean} matchAll
	 * @return {Array}
	 * @see {@link matchPatternList}
	 */
	match(input, matchAll = false){
		return execPatternList(input, matchAll, ...this.keys());
	}
}


/**
 * Match an iterable's items against a string.
 *
 * @param {String}    input
 * @param {Boolean}   [matchAll=false]
 * @param {...RegExp} [patterns] 
 * @return {Array|null}
 */
function execPatternList(input, matchAll = false, ...patterns){
	if(!input)
		return null;
	
	input = input.toString();
	
	if(matchAll){
		const matches = [];
		for(const pattern of patterns){
			const match = input.match(pattern);
			if(null !== match)
				matches.push([pattern, match]);
		}
		return matches;
	}
	
	else{
		for(const pattern of patterns){
			const match = input.match(pattern);
			if(null !== match)
				return [pattern, match];
		}
		return null;
	}
}


module.exports = {
	PatternMap,
	PatternSet,
	execPatternList
};
