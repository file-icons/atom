"use strict";

const {caseKludge, escapeRegExp, fuzzyRegExp, isNumeric, isRegExp, isString} = require("./utils.js");


class Icon{
	
	constructor(){
		
		// Unserialising from precompiled config
		if(arguments.length === 1){
			const [icon, colour, match, lang, interpreter, scope] = arguments[0];
			
			this.icon  = icon;
			this.match = new RegExp(match[0], match[1]);
			
			this.colour = "string" === typeof colour
				? [colour, colour]
				: !colour.length
					? [null, null]
					: colour;
			
			if(null != lang)        this.lang        = new RegExp(lang[0], lang[1]);
			if(null != interpreter) this.interpreter = new RegExp(interpreter[0], interpreter[1]);
			if(null != scope)       this.scope       = new RegExp(scope[0], scope[1]);
		}
		
		
		// Parsing from CSON config
		else{
			const [key, icon, match, colour, props = {}] = arguments;
			
			this.icon  = icon;
			this.match = isRegExp(match) ? match : new RegExp(escapeRegExp(match) + "$", "i");
			
			
			// Colour classes for dark and light themes, respectively
			if(colour){
				if("string" !== typeof colour){
					this.colour = colour;
					if(this.colour[1] == null)
						this.colour[1] = this.colour[0];
				}
				
				else{
					const auto = colour.match(/^auto-(\w+)/i);
					this.colour = auto
						? ["medium-" + auto[1], "dark-" + auto[1]]
						: [colour, colour];
				}
			}
			
			else this.colour = [null, null];
			
			
			const {alias, interpreter, noFuzz, priority, scope} = props;
			
			// Order in which this Icon gets checked before others.
			this.priority = isNumeric(priority) ? +priority : (priority || 1);
			
			
			// List of programs to match in hashbangs
			if(interpreter)
				this.interpreter = isRegExp(interpreter)
					? interpreter
					: new RegExp("^" + interpreter + "$");
			
			
			// TextMate grammars that activate this icon
			if(scope){
				if(isRegExp(scope))
					this.scope = scope;
				
				else{
					const source = "\\." + escapeRegExp(scope) + "$";
					this.scope = new RegExp(source, "i");
				}
				
				// Additional names to match in modelines or Linguist attributes
				if(alias){
					if(isRegExp(alias))
						this.lang = alias;
					
					else{
						const source = noFuzz ? escapeRegExp(alias) : fuzzyRegExp(alias);
						this.lang = new RegExp(source, "i");
					}
				}
				
				// Include key in alias, unless generic or identical
				if(!props.generic && (!alias || (isRegExp(alias) ? !alias.test(key) : key.toLowerCase() !== alias.toLowerCase()))){
					const keyPattern = this.lang && !this.lang.ignoreCase
						? caseKludge(key, noFuzz)
						: noFuzz
							? fuzzyRegExp(key, String)
							: escapeRegExp(key);
					
					const source = this.lang
						? keyPattern + "|" + this.lang.source
						: keyPattern;
					
					const flags = this.lang
						? this.lang.flags
						: "i";
					
					this.lang = new RegExp(source, flags);
				}
			}
		}
	}
	


	/**
	 * Serialise the Icon's properties as a JSON array.
	 *
	 * @return {Array}
	 */
	toJSON(){
		const output = [this.icon];
		
		let {colour} = this;
		if(null == colour[0])
			colour = [];
		else if(colour[0] === colour[1])
			colour = colour[0];
		output.push(colour);
		
		for(const name of ["match", "lang", "interpreter", "scope"]){
			const pattern = this[name];
			if(pattern){
				const {source, flags} = pattern;
				const array = [source];
				flags && array.push(flags);
				output.push(array);
			}
			else output.push(null);
		}
		
		// Optimise the length of the array by pruning trailing null values
		for(let i = output.length - 1; i >= 0; --i){
			if(output[i] == null)
				output.pop();
			else break;
		}
		
		return output;
	}



	/**
	 * Deserialise a list of Icons from their JSON representation.
	 *
	 * @param {Array} input
	 * @return {Array}
	 */
	static restore(input){
		return input.map(i => new Icon(i));
	}



	/**
	 * Generate a list of {Icon} instances from a loaded config file.
	 *
	 * @param {String} input - Config data in JSON format
	 * @return {Array}
	 */
	static compile(config){
		const icons = [];

		for(const name in config){
			const rules = this.compileConfigEntry(name, config[name]);
			rules.map((rule, order) => rule._tmp = {
				name: name.toLowerCase(),
				order
			});
			icons.push(... rules);
		}
		
		return icons
			.sort((a, b) => {
				if(a.priority > b.priority) return -1;
				if(a.priority < b.priority) return 1;
				const A = a._tmp;
				const B = b._tmp;
				if(A.name < B.name) return -1;
				if(A.name > B.name) return 1;
				if(A.order < B.order) return -1;
				if(A.order > B.order) return 1;
				return 0;
			})
			.map(icon => {
				delete icon._tmp;
				delete icon.priority;
				return icon;
			});
	}



	/**
	 * Compile a single config entry. Used internally by the {@link compile} method.
	 *
	 * @param {String} key
	 * @param {Object} value
	 * @return {Array}
	 * @private
	 */
	static compileConfigEntry(key, value){
		value = Object.assign({}, value);
		let {icon, match} = value;
		
		if(!Array.isArray(match)){
			const props = this.parseExtraProps(value);
			if(!props.noSuffix) icon += "-icon";
			return [ new Icon(key, icon, match, value.colour, props) ];
		}
		
		const output = [];
		
		for(const i of match){
			let [match, colour, props] = i;
			
			// TODO: Find a more rational-looking way to implement this
			const entryProps = this.parseExtraProps(props);
			props            = Object.assign({}, value, entryProps);
			
			const entryIcon  = icon + (props.noSuffix ? "" : "-icon");
			const newIcon    = new Icon(key, entryIcon, match, colour, props);
			const prevIcon   = output.find(this.prototype.canMerge, newIcon);
			
			if(prevIcon)
				prevIcon.merge(newIcon);
			else
				output.push(newIcon);
			
			if(!entryProps.alias)       delete value.alias;
			if(!entryProps.interpreter) delete value.interpreter;
			if(!entryProps.scope)       delete value.scope;
		}
		
		return output;
	}
	
	
	
	/**
	 * Determine if the {Icon} can be merged into another.
	 *
	 * @param {Icon} input
	 * @return {Boolean}
	 */
	canMerge(input){
		if(this.icon        !=  input.icon)        return false;
		if(this.colour[0]   !== input.colour[0])   return false;
		if(this.colour[1]   !== input.colour[1])   return false;
		if(this.priority    !=  input.priority)    return false;
		if(this.match.flags !== input.match.flags) return false;
		
		for(const name of ["alias", "scope", "interpreter"]){
			const A =  this[name];
			const B = input[name];
			if(A && (B && (B.source !== A.source || B.flags !== A.flags))) return false;
			if(B && (A && (A.source !== B.source || A.flags !== B.flags))) return false;
		}
		return true;
	}
	
	
	
	/**
	 * Concatenate this icon's matching-pattern with another's.
	 *
	 * @param {Icon} input
	 */
	merge(input){
		const src  = this.match.source + "|" + input.match.source;
		this.match = new RegExp(src, this.match.flags);
		
		if(!this.alias       && input.alias)       this.alias       = input.alias;
		if(!this.scope       && input.scope)       this.scope       = input.scope;
		if(!this.interpreter && input.interpreter) this.interpreter = input.interpreter;
	}
	
	
	
	/**
	 * Resolve the tertiary parameter for specifying additional properties.
	 *
	 * @param {String|Object} input
	 * @private
	 */
	static parseExtraProps(input){
		
		// Ignore blank input
		if(!input) return {};
		
		// Strings are shorthand to set 3 common properties at once
		if(isString(input))
			return {
				alias: input,
				scope: input,
				interpreter: input
			};
		
		const output = {};
		
		// Assign every property that's supported here
		output.priority    =   input.priority == null ? 1 : input.priority;
		output.alias       =   input.alias;
		output.scope       =   input.scope;
		output.interpreter =   input.interpreter;
		
		if(input.generic)  output.generic  = true;
		if(input.noFuzz)   output.noFuzz   = true;
		if(input.noSuffix) output.noSuffix = true;
		
		return output;
	}
}


module.exports = Icon;
