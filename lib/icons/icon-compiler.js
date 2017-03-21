"use strict";

const IconDefinition = require("./icon-definition.js");
const {isString, isRegExp, escapeRegExp} = require("alhadis.utils");


/**
 * Interface for generating precompiled arrays of icon data.
 *
 * @class
 */
class IconCompiler{
	
	/**
	 * Compile working icon data from a CSON config file.
	 *
	 * @example compile("./config.cson", "./lib/service/.config.json");
	 * @param {String} configPath - Path to CSON source
	 * @param {String} outputPath - Path of compiled output
	 */
	compileConfigFile(configPath, outputPath){
		const fs = require("fs");
		const CoffeeScript = require("coffee-script");
		const config = fs.readFileSync(configPath).toString();
		const source = CoffeeScript.eval(config);
		const output = this.compileConfigData(config);
		fs.writeFileSync(outputPath, output);
	}
	
	
	/**
	 * Compile parsed config source into JavaScript source.
	 *
	 * @param {Object} data - Object parsed from JSON/CSON.
	 * @param {Boolean} [cson=false] - Precompile with CoffeeScript
	 * @return {String}
	 */
	compileConfigData(source, cson = false){
		if(cson) source = require("coffee-script").eval(source);
		const directoryIcons = this.compileList(source.directoryIcons);
		const fileIcons      = this.compileList(source.fileIcons);
		const indexedLists   = this.indexLists([directoryIcons, fileIcons]);
		return this.stringify(indexedLists);
	}
	
	
	/**
	 * Generate a list of {@link IconDefinition} instances.
	 *
	 * @param {Object} input - Object hash parsed from JSON data.
	 * @return {IconDefinition[]} Array of icon definitions.
	 */
	compileList(input){
		const result = [];
		const sortInfo = new WeakMap();
		
		for(const key in input){
			const defs = this.compileEntry(key, input[key]);
			const name = key.toLowerCase();
			defs.forEach((def, index) => sortInfo.set(def, {name, index}));
			result.push(... defs);
		}
		
		return result
			.sort((a, b) => {
				if(a.priority > b.priority) return -1;
				if(a.priority < b.priority) return 1;
				const A = sortInfo.get(a);
				const B = sortInfo.get(b);
				if(A.name < B.name) return -1;
				if(A.name > B.name) return 1;
				if(A.index < B.index) return -1;
				if(A.index > B.index) return 1;
				return 0;
			});
	}
	
	
	/**
	 * Compile a single config entry.
	 *
	 * Used internally by {@link IconCompiler#compileList}.
	 *
	 * @param {String} key
	 * @param {Object} value
	 * @return {Array}
	 * @private
	 */
	compileEntry(key, value){
		value = Object.assign({}, value);
		let {icon, match} = value;
		
		if(!Array.isArray(match)){
			const props = this.parseExtraProps(value);
			if(!props.noSuffix) icon += "-icon";
			match = this.parseMatchPattern(match, props.matchPath);
			return [ new IconDefinition(key, icon, match, value.colour, props) ];
		}
		
		const output = [];
		
		for(const i of match){
			let [match, colour, props] = i;
			
			const entryProps = this.parseExtraProps(props);
			props            = Object.assign({}, value, entryProps);
			match            = this.parseMatchPattern(match, props.matchPath);
			
			const entryIcon  = icon + (props.noSuffix ? "" : "-icon");
			const newIcon    = new IconDefinition(key, entryIcon, match, colour, props);
			const prevIcon   = output.find(def => this.canMergeDefinitions(def, newIcon));
			
			if(prevIcon)
				prevIcon.merge(newIcon);
			else
				output.push(newIcon);
			
			if(!entryProps.interpreter) delete value.interpreter;
			if(!entryProps.scope)       delete value.scope;
			if(!entryProps.alias)       delete value.alias;
		}
		
		return output;
	}
	
	
	/**
	 * Resolve the tertiary parameter for specifying additional properties.
	 *
	 * @param {String|Object} input
	 * @private
	 */
	parseExtraProps(input){
		
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
		output.priority    = input.priority;
		output.alias       = input.alias;
		output.scope       = input.scope;
		output.interpreter = input.interpreter;
		output.matchPath   = input.matchPath;
		output.signature   = input.signature;
		
		if(input.generic)  output.generic  = true;
		if(input.noFuzz)   output.noFuzz   = true;
		if(input.noSuffix) output.noSuffix = true;
		
		// Wipe null values so properties defined at entry-level aren't overwritten
		for(const key in output)
			if(null == output[key])
				delete output[key];
		
		return output;
	}
	
	
	/**
	 * Resolve an icon's path-matching pattern.
	 *
	 * @param {String|RegExp} input
	 * @param {Boolean} fixSeparators
	 * @return {RegExp}
	 * @private
	 */
	parseMatchPattern(input, fixSeparators = false){
		if(isRegExp(input))
			return input;
		
		if(!fixSeparators)
			return new RegExp(escapeRegExp(input) + "$", "i");
		
		input = input.split(/[\\\/]+/).map(s => escapeRegExp(s)).join("[\\\\\\/]");
		return new RegExp(input + "$", "i");
	}
	
	
	/**
	 * Check if two {@link IconDefinitions} can be merged together.
	 *
	 * @param {IconDefinition} input
	 * @return {Boolean}
	 */
	canMergeDefinitions(a, b){
		if(a.icon        !=  b.icon)        return false;
		if(a.colour[0]   !== b.colour[0])   return false;
		if(a.colour[1]   !== b.colour[1])   return false;
		if(a.priority    !=  b.priority)    return false;
		if(a.match.flags !== b.match.flags) return false;
		if(!!a.matchPath !== !!b.matchPath) return false;
		
		for(const name of ["alias", "scope", "interpreter", "signature"]){
			const A = a[name];
			const B = b[name];
			if(A && (B && (B.source !== A.source || B.flags !== A.flags))) return false;
			if(B && (A && (A.source !== B.source || A.flags !== B.flags))) return false;
		}
		return true;
	}
	
	
	/**
	 * Index each icon which supports special match criteria.
	 *
	 * @param {Array} lists
	 * @return {Array}
	 */
	indexLists(lists){
		const INTERPRETERS = 0x000;
		const LANGUAGES    = 0x001;
		const FULLPATHS    = 0x002;
		const SCOPES       = 0x003;
		const SIGNATURES   = 0x004;
		const indexedLists = [];
		for(const icons of lists){
			const indexes  = [[], [], [], [], []];
			let offset     = 0;
			for(const icon of icons){
				if(icon.interpreter) indexes[INTERPRETERS].push(offset);
				if(icon.lang)        indexes[LANGUAGES].push(offset);
				if(icon.matchPath)   indexes[FULLPATHS].push(offset);
				if(icon.scope)       indexes[SCOPES].push(offset);
				if(icon.signature)   indexes[SIGNATURES].push(offset);
				++offset;
			}
			indexedLists.push([icons, indexes]);
		}
		return indexedLists;
	}
	
	
	/**
	 * Convert icon-lists into readable JavaScript source.
	 *
	 * @param {Array} lists
	 * @return {String}
	 */
	stringify(lists){
		let output =
			'"use strict"; // Auto-generated by compiler. DO NOT EDIT. Seriously.\n' +
			"module.exports = [";
		for(const [iconList, indexList] of lists)
			output += "\n[["
				+ iconList.join(",\n")
				+ "],\n"
				+ JSON.stringify(indexList)
				+ "],";
		return output.replace(/,$/, "\n];\n");
	}
}


module.exports = new IconCompiler();
