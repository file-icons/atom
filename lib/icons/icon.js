"use strict";

/**
 * Immutable hash of icon data.
 *
 * These objects are accessed through {@link IconDelegate} instances, and
 * generated at startup from precomposed data by the {@link IconCompiler}.
 *
 * @class
 */
class Icon{
	
	/**
	 * Create a new icon object.
	 *
	 * @param {Number}  index - Index of the icon's appearance in the enclosing array
	 * @param {String}  icon - Icon's CSS class (e.g., "js-icon")
	 * @param {Array}   colour - Icon's colour classes
	 * @param {RegExp}  match - Pattern for matching names or pathnames
	 * @param {Boolean} [matchPath=false] - Match against system path instead of basename
	 * @param {RegExp}  [interpreter=null] - RegExp to match executable names in hashbangs
	 * @param {RegExp}  [scope=null] - RegExp to match grammar scope-names
	 * @param {RegExp}  [lang=null] - RegExp to match alias patterns
	 * @param {RegExp}  [sig=null] - RegExp to match file signatures
	 * @see {@link IconTables#read}
	 * @constructor
	 */
	constructor(index, icon, colour, match, matchPath = null, interpreter = null, scope = null, lang = null, sig = null){
		this.index       = index;
		this.icon        = icon;
		this.colour      = colour;
		this.match       = match;
		
		this.matchPath   = matchPath   || false;
		this.interpreter = interpreter || null;
		this.scope       = scope       || null;
		this.lang        = lang        || null;
		this.signature   = sig         || null;
	}
	
	
	/**
	 * Return the CSS classes for displaying the icon.
	 *
	 * @param {Number|null} colourMode
	 * @param {Boolean} asArray
	 * @return {String}
	 */
	getClass(colourMode = null, asArray = false){
		
		// No colour needed or available
		if(null === colourMode || this.colour[0] === null)
			return asArray ? [this.icon] : this.icon;
		
		return asArray
			? [this.icon, this.colour[colourMode]]
			: (this.icon + " " + this.colour[colourMode]);
	}
}


module.exports = Icon;
