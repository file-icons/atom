"use strict";

const path = require("path");
const Minimatch = require("minimatch");
const {CompositeDisposable, Disposable} = require("atom");
const MappedDisposable = require("../../utils/mapped-disposable.js");
const FileRegistry = require("../../filesystem/file-registry.js");
const IconTables = require("../icon-tables.js");
const Strategy = require("../strategy.js");


class LinguistStrategy extends Strategy {
	
	constructor(){
		super({
			name:          "linguist",
			priority:      3,
			matchesFiles:  true,
			matchesDirs:   false,
			ignoreVirtual: false
		});
		
		this.hasRules      = false;
		this.sourceFiles   = null;
		this.rulesBySource = null;
		this.languageIcons = null;
		this.languageRules = null;
	}
	
	
	enable(){
		if(!this.enabled){
			this.hasRules      = false;
			this.sourceFiles   = new MappedDisposable();
			this.rulesBySource = new Map();
			this.languageIcons = new Map();
			this.languageRules = new Map();
			
			FileRegistry.observe(file => {
				if(/^\.gitattributes$/.test(file.name))
					this.trackSource(file);
			});
		}
		return super.enable();
	}
	
	
	disable(){
		if(this.enabled){
			this.sourceFiles.dispose();
			this.languageIcons.clear();
			this.languageRules.clear();
			this.hasRules      = false;
			this.sourceFiles   = null;
			this.rulesBySource = null;
			this.languageIcons = null;
			this.languageRules = null;
		}
		return super.disable();
	}
	
	
	trackSource(file){
		if(file && !this.sourceFiles.has(file)){
			// TODO: Use `resources` instead of `sourceFiles`,
			// and make the former a MappedDisposable instance.
			this.sourceFiles.add(file,
				file.onDidDestroy(() => this.untrackSource(file)),
				file.onDidChangeData(() => this.updateRules(file)),
				file.onDidChangeOnDisk(() => file.loadData(true))
			);
			file.watchSystem();
			(file.isDataComplete || file.isOpenInEditor)
				? this.updateRules(file)
				: file.loadData(true);
		}
	}
	
	
	untrackSource(file){
		if(this.sourceFiles.has(file)){
			this.sourceFiles.dispose(file);
		}
	}
	
	
	matchIcon(resource){
		if(!this.hasRules)
			return null;
		
		for(const [pattern, icon] of this.languageRules)
			if(pattern.test(resource.path))
				return icon;
		
		return null;
	}
	
	
	updateRules(source){
		const rules = source.data
			.replace(/^[\t ]*#.*$|^\s+|\s+$/gm, "")
			.split(/\r?\n/)
			.filter(s => /\S+\s+linguist-language=\w+/.test(s))
			.map(line => {
				let [pattern, language] = line.split(/\s+linguist-language=/);
				pattern = pattern.trim();
				language = language.trim();
				
				// Look for this language's icon if we've not already done so.
				if(!this.languageIcons.has(language))
					this.languageIcons.set(language, IconTables.matchLanguage(language));
				
				const languageIcon = this.languageIcons.get(language);
				
				// Only acknowledge languages with icons
				if(!languageIcon)
					return null;
				
				pattern = path.join(path.dirname(source.path), pattern);
				pattern = Minimatch.makeRe(pattern, {nonegate: true, dot: true});
				return pattern
					? [pattern.toString(), [pattern, languageIcon]]
					: null;
			})
			.filter(a => a);
		
		const oldRules = this.rulesBySource.get(source) || new Map();
		const newRules = new Map([...rules]);
		this.rulesBySource.set(source, newRules);
		
		const [added, removed] = this.compareRulesets(oldRules, newRules);
		let hasChanged = false;
		
		if(removed.size){
			hasChanged = true;
			for(const [pattern] of removed)
				this.languageRules.delete(pattern);
		}
		
		if(added.size){
			hasChanged = true;
			for(const [pattern, icon] of added)
				this.languageRules.set(pattern, icon);
		}
		
		if(hasChanged){
			this.hasRules = !!this.languageRules.size;
			if(this.enabled)
				this.checkAll(false);
		}
	}
	
	
	compareRulesets(before, after){
		const added   = new Set();
		const removed = new Set();
		
		for(const [pattern, rule] of after)
			if(!before.has(pattern))
				added.add(rule);
		
		for(const [pattern, rule] of before)
			if(!after.has(pattern))
				removed.add(rule);
		
		return [added, removed];
	}
}


module.exports = new LinguistStrategy();
