"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const IconRegistry = require("../icon-registry.js");
const Options = require("../options.js");


class TreeEntry{
	
	constructor(source, element = null){
		this.disposables = new CompositeDisposable();
		this.emitter     = new Emitter();
		
		this.source      = source;
		this.name        = source.name;
		this.path        = source.path;
		this.symlink     = source.symlink;
		this.element     = element;
		this.isDirectory = false;
		this.isFile      = true;
		
		this.disposables.add(
			source.onDidDestroy(_=> this.destroy())
		);
		
		// Directory
		if("expansionState" in source){
			this.isDirectory = true;
			this.isFile      = false;
			this.entries     = new WeakSet();
			
			this.disposables.add(
				source.onDidExpand(_=> this.scanEntries()),
				source.onDidAddEntries(_=> this.scanEntries()),
				Options.onDidChange("coloured", _=> this.updateIcon())
			);
		}
	}
	
	
	destroy(){
		if(!this.destroyed){
			this.destroyed = true;
			this.disposables.dispose();
			this.disposables = null;
			this.emitter.emit("did-destroy");
			this.emitter.dispose();
			this.emitter = null;
			this.entries = null;
			this.source = null;
		}
	}
	
	
	onDidDestroy(fn){
		return this.emitter.on("did-destroy", fn);
	}
	
	onDidFindEntries(fn){
		return this.emitter.on("did-find-entries", fn);
	}

	
	isExpanded(){
		const state = this.source.expansionState;
		return state && state.isExpanded;
	}
	
	
	toString(){
		return this.name;
	}
	
	
	scanEntries(){
		const newEntries = [];
		
		const {entries} = this.source;
		for(const name in entries){
			const entry = entries[name];
			
			if(!this.entries.has(entry)){
				this.entries.add(entry);
				newEntries.push(entry);
			}
		}
		
		if(newEntries.length)
			this.emitter.emit("did-find-entries", newEntries);
	}
	
	
	updateIcon(){
		if(this.symlink)
			return;
		
		if(undefined === this.icon){
			this.icon = null;
			
			for(const icon of IconRegistry.directoryIcons){
				if(icon.match.test(this.name)){
					this.icon = icon;
					break;
				}
			}
		}
		
		if(this.icon){
			const label = this.element.directoryName;
			const iconClass = this.icon.getClass(Options.colourMode);
			label.className = "name icon " + iconClass;
		}
	}
}


module.exports = TreeEntry;
