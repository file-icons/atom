"use strict";

const path = require("path");
const {Disposable} = require("atom");
const IconTables = require("../../icons/icon-tables.js");
const Strategy = require("../strategy.js");


class LinguistStrategy extends Strategy {
	
	constructor(){
		super({
			name:          "linguist",
			priority:      4,
			matchesFiles:  true,
			matchesDirs:   false,
			ignoreVirtual: false
		});
		
		this.hasRules      = false;
		this.rules         = null;
		this.sources       = null;
		this.languageIcons = null;
	}
	

	enable(){
		if(!this.enabled){
			this.hasRules      = false;
			this.rules         = new Map();
			this.sources       = new Map();
			this.languageIcons = new Map();
		}
		return super.enable();
	}
	
	
	disable(){
		if(this.enabled){
			super.disable();
			this.rules.clear();
			this.sources.clear();
			this.languageIcons.clear();
			this.hasRules      = false;
			this.rules         = null;
			this.sources       = null;
			this.languageIcons = null;
			return true;
		}
		
		else return false;
	}
	
	
	matchIcon(resource){
		if(!this.hasRules)
			return null;
		
		for(const [pattern, icon] of this.rules)
			if(pattern.test(resource.path))
				return icon;
		
		return null;
	}
	
	
	registerResource(file){
		const isNew = super.registerResource(file);
		
		if(isNew && !file.unreadable && /^\.gitattributes$/.test(file.name)){
			this.sources.set(file, new Map());
			
			const disposables = this.resourceEvents.get(file);
			disposables.add(
				new Disposable(() => file.unwatchSystem()),
				file.onDidMove(() => this.updateSource(file)),
				file.onDidChangeData(() => this.updateSource(file)),
				file.onDidChangeOnDisk(() => {
					try{ file.loadData(true); }
					catch(e){ disposables.dispose(); }
				})
			);
			file.watchSystem();
			(file.isDataComplete || file.isOpenInEditor)
				? this.updateSource(file)
				: file.loadData(true);
		}
		
		else return isNew;
	}
	
	
	updateSource(file){
		const sourceRules = this.sources.get(file);
		const parsedRules = new Map(this.parseSource(file.data, file.path));
		const updatePaths = new Set();
		
		// Deleted rules
		for(const [pattern] of sourceRules)
			if(!parsedRules.has(pattern)){
				updatePaths.add(pattern);
				sourceRules.delete(pattern);
				this.rules.delete(pattern);
			}
		
		// Added/changed rules
		for(const [pattern, icon] of parsedRules)
			if(sourceRules.get(pattern) !== icon){
				this.rules.set(pattern, icon);
				sourceRules.set(pattern, icon);
				updatePaths.add(pattern);
			}
		
		this.hasRules = !!this.rules.size;
		
		for(const path of updatePaths)
			this.updatePath(path);
	}
	
	
	updatePath(path){
		for(const [resource] of this.resources)
			if(path.test(resource.path)){
				this.deleteIcon(resource);
				const icon = this.rules.get(path) || null;
				if(null !== icon)
					this.addIcon(resource, icon);
			}
	}
	
	
	parseSource(fileData, filePath){
		if(!fileData)
			return [];
		
		return fileData
			.replace(/^[\t ]*#.*$|^[ \t]+|[ \t]+$/gm, "")
			.split(/(?:\r?\n)+/g)
			.filter(s => /\S+[ \t]+linguist-language=\w+/.test(s))
			.map(line => {
				let [pattern, language] = line.split(/\s+linguist-language=/);
				
				// Look for this language's icon if we've not already done so.
				if(!this.languageIcons.has(language))
					this.languageIcons.set(language, IconTables.matchLanguage(language));
				
				const languageIcon = this.languageIcons.get(language);
				
				// Only acknowledge languages with icons
				if(!languageIcon)
					return null;

				// Lazily require the micromatch dependency due to its weight.
				const Micromatch = require("micromatch");
				
				pattern = path.dirname(filePath) + "/" + (/^\//.test(pattern) ? "" : "**") + "/" + pattern;
				pattern = path.resolve(pattern);
				pattern = Micromatch.makeRe(pattern, {nonegate: true, dot: true});
				return pattern
					? [pattern, languageIcon]
					: null;
			})
			.filter(a => a);
	}
}


module.exports = new LinguistStrategy();
