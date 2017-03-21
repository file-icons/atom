"use strict";

const path = require("path");
const {CompositeDisposable, Disposable} = require("atom");
const {escapeRegExp} = require("alhadis.utils");
const IconTables = require("../../icons/icon-tables.js");
const Strategy = require("../strategy.js");


class UsertypeStrategy extends Strategy {
	
	constructor(){
		super({
			name:          "usertypes",
			priority:      3,
			matchesFiles:  true,
			matchesDirs:   false,
			ignoreVirtual: false
		});
		
		this.configDisposable = null;
		this.customTypes      = null;
		this.customTypeIcons  = null;
		this.hasCustomTypes   = false;
	}
	
	
	enable(){
		if(!this.enabled && !this.configDisposable){
			this.customTypes      = new Map();
			this.customTypeIcons  = new Map();
			this.hasCustomTypes   = false;
			
			this.configDisposable = new CompositeDisposable(
				atom.config.onDidChange("core.customFileTypes", types => {
					this.updateCustomTypes(types.newValue);
					this.checkAll(false);
				})
			);
			
			const types = atom.config.get("core.customFileTypes");
			this.updateCustomTypes(types);
		}
		return super.enable();
	}
	
	
	disable(){
		if(this.enabled && this.configDisposable){
			this.configDisposable.dispose();
			this.configDisposable = null;
			this.customTypes      = null;
			this.customTypeIcons  = null;
			this.hasCustomTypes   = false;
		}
		return super.disable();
	}


	matchIcon(resource){
		if(!this.hasCustomTypes)
			return null;
		
		for(const [scopeName, patterns] of this.customTypes){
			const {names, paths} = patterns;
			if((null !== names && names.test(resource.name))
			||  null !== paths && paths.test(resource.path))
				return this.customTypeIcons.get(scopeName);
		}
		
		return null;
	}
	
	
	updateCustomTypes(types){
		this.customTypes.clear();
		this.customTypeIcons.clear();
		
		for(const scopeName in types){
			const icon = IconTables.matchScope(scopeName);
			if(!icon)
				continue; // Skip types without icons
			this.customTypeIcons.set(scopeName, icon);
			
			const names = [];
			const paths = [];
			
			const patterns = types[scopeName];
			for(const pattern of patterns)
				(-1 === pattern.indexOf(path.sep))
					? names.push(pattern)
					: paths.push(pattern);
			
			this.customTypes.set(scopeName, {
				names: this.makeNamePattern(names),
				paths: this.makePathPattern(paths)
			});
		}
		
		this.hasCustomTypes = !!this.customTypes.size;
	}
	
	
	
	/**
	 * Compile an expression to match one or more file extensions.
	 *
	 * @param {String[]} names
	 * @return {RegExp|null}
	 * @private
	 */
	makeNamePattern(names){
		const {length} = names;
		
		if(!length)
			return null;
		
		names = names.map(s => escapeRegExp(s.replace(/^\./, ""))).join("|");
		
		if(length > 1)
			names = `(?:${names})`;
		
		return new RegExp("(?:^|\\.)" + names + "$", "i");
	}
	
	
	/**
	 * Compile an expression to match one or more pathnames.
	 *
	 * @param {String[]} paths
	 * @return {RegExp|null}
	 * @private
	 */
	makePathPattern(paths){
		const {length} = paths;
		
		if(!length)
			return null;
		
		paths = paths.map(s => escapeRegExp(s)).join("|");
		
		if(length > 1)
			paths = `(?:${paths})`;
		
		return new RegExp("(?:^|[\\/\\\\])" + paths + "$", "i");
	}
}


module.exports = new UsertypeStrategy();
