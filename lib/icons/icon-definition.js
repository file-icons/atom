"use strict";

const {escapeRegExp, forceNonCapturing} = require("../utils.js");


/**
 * Intermediate representation of an uncompiled {@link Icon} object.
 *
 * Generated from human-readable CSON source during compilation.
 * Written to disk as JavaScript arrays to quicken startup time.
 *
 * @class
 */
class IconDefinition{
	
	/**
	 * Define a new icon from loaded CSON/JSON source.
	 *
	 * @param {String}        key - Name of config key which defined this icon.
	 * @param {String}       icon - Icon's CSS class.
	 * @param {RegExp}      match - Pattern that matches file/directory paths.
	 * @param {String[]}   colour - Colour classes used by this icon.
	 * @param {Object} [props={}] - Additional/advanced properties.
	 */
	constructor(key, icon, match, colour, props = {}){
		this.key   = key;
		this.icon  = icon;
		this.match = match;
		
		this.setColours(colour);
		this.setPriority(props.priority);
		this.setInterpreter(props.interpreter);
		this.signature = props.signature || null;
		
		if(props.scope){
			this.setScope(props.scope);
			this.setName(props.alias, props.generic);
		}
		
		// Whether to match against a full path instead of a filename
		if(props.matchPath)
			this.matchPath = true;
		
		// Improve performance by forcing groups to be non-capturing
		for(const name in this){
			const value = this[name];
			if(value instanceof RegExp && !/\\[1-9]/.test(value.source.replace(/\\[^1-9]/g, "")))
				this[name] = forceNonCapturing(value);
		}
	}
	
	
	/**
	 * Define the CSS classes for displaying the icon's colour.
	 *
	 * @param {String[]} classes
	 * @private
	 */
	setColours(classes){
		
		if("string" === typeof classes){
			const auto = classes.match(/^auto-(\w+)/i);
			this.colour = auto
				? ["medium-" + auto[1], "dark-" + auto[1]]
				: [classes, classes];
		}
		
		else if(Array.isArray(classes)){
			this.colour = classes;
			if(null == this.colour[1])
				this.colour[1] = this.colour[0];
		}
		
		else this.colour = [null, null];
	}
	
	
	/**
	 * Define the order in which the icon is matched before others.
	 *
	 * @param {Number} [priority=1]
	 * @private
	 */
	setPriority(priority){
		this.priority = !Number.isNaN(+priority)
			? +priority
			: (priority || 1);
	}
	
	
	/**
	 * Define the executable names to match in interpreter directives.
	 *
	 * @param {String|RegExp} pattern
	 * @private
	 */
	setInterpreter(pattern){
		if(!pattern) return;
		this.interpreter = !(pattern instanceof RegExp)
			? new RegExp("^" + pattern + "$")
			: pattern;
	}
	
	
	/**
	 * Define the language grammars which trigger the icon.
	 *
	 * @param {String|RegExp} pattern - Grammar scopes
	 * @private
	 */
	setScope(pattern){
		if(!pattern) return;
		this.scope = !(pattern instanceof RegExp)
			? new RegExp(`\\.${escapeRegExp(pattern)}$`, "i")
			: pattern;
	}
	
	
	/**
	 * Construct a pattern to match the icon's human-readable names.
	 *
	 * The definition's config key is always included unless `noKey` is set.
	 *
	 * @param {Array.<String|RegExp>} aliases - Additional patterns to match as names
	 * @param {Boolean} [noKey=false] - Omit the config key when generating pattern.
	 * @private
	 */
	setName(aliases = null, noKey = false){
		if(!Array.isArray(aliases))
			aliases = [aliases].filter(Boolean);
		
		// Include the icon's config key, unless it already matches an alias
		if(!noKey){
			const key = this.key.toLowerCase();
			const covered = aliases.some(alias => {
				if(alias instanceof RegExp)
					return alias.test(key);
				alias = String(alias).trim().toLowerCase();
				return key === alias;
			});
			covered || aliases.unshift(this.key);
		}
		
		if(aliases.length){
			const src = aliases.map(alias => {
				if(alias instanceof RegExp)
					return alias.source;
				
				// Split segments of purely-PascalCase identifers
				alias = String(alias).trim();
				if(/^[A-Z][a-z]+(?:[A-Z][a-z]+|CSS|JS|HTML)+$/.test(alias))
					alias = alias.replace(/(?<=[a-z])(?=[A-Z])/g, " ");
				
				// Accept dashes as word separators instead of blanks
				return `^${alias.split(/\s+/).map(word => {
					
					// HACK: Use key's original casing in regexp; it gives VSCode's import
					// script another (case-sensitive) language ID to work with.
					if(word === alias && word.toLowerCase() === this.key.toLowerCase())
						word = this.key;
					
					return escapeRegExp(word);
				}).join("[-_ ]?")}$`;
			}).join("|");
			this.lang = new RegExp(src, "i");
		}
	}
	
	
	/**
	 * Concatenate the instance's patterns with those of another definition.
	 *
	 * @param {IconDefinition} input
	 */
	merge(input){
		const src  = this.match.source + "|" + input.match.source;
		this.match = new RegExp(src, this.match.flags);
		
		if(!this.alias       && input.alias)       this.alias       = input.alias;
		if(!this.scope       && input.scope)       this.scope       = input.scope;
		if(!this.interpreter && input.interpreter) this.interpreter = input.interpreter;
		if(!this.signature   && input.signature)   this.signature   = input.signature;
		if(!this.tag         && input.tag)         this.tag         = input.tag;
	}
	
	
	/**
	 * Generate the JavaScript code to define this definition's {@link Icon}.
	 *
	 * @return {String}
	 */
	toString(){
		
		// Order of values must match what Icon's constructor expects
		const args = [
			this.icon,
			this.colour,
			this.match,
			this.priority,
			this.matchPath,
			this.interpreter,
			this.scope,
			this.lang,
			this.signature,
		];
		
		// Shorten array by pruning trailing null values.
		for(let i = args.length - 1; i >= 0; --i)
			if(null == args[i])
				args.pop();
			else break;
		
		
		// Shorten array further by pruning trailing defaults:
		if(false === args[4] && 5 === args.length)  // → matchPath=false
			args.pop();
		
		if(1 === args[3]) args.length !== 4         // → priority=1
			? args[3] = null
			: args.pop();
		
		
		return "[" + args.map(
			arg => null === arg
				? ""
				: arg instanceof RegExp
					? arg.toString()
					: JSON.stringify(arg)
		).join(",") + "]";
	}
	
	
	/**
	 * Force stringification when converted to JSON.
	 *
	 * @return {String}
	 */
	toJSON(){
		return this.toString();
	}
}


Object.assign(IconDefinition.prototype, {
	icon:        null,
	colour:      null,
	match:       null,
	matchPath:   false,
	interpreter: null,
	scope:       null,
	lang:        null,
	signature:   null,
});


module.exports = IconDefinition;
