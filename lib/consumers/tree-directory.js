"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const IconRegistry = require("../icon-registry.js");


class TreeDirectory{
	
	constructor(source, element = null){
		this.disposables = new CompositeDisposable();
		this.emitter     = new Emitter();
		this.entries     = new WeakSet();
		
		this.source      = source;
		this.name        = source.name;
		this.path        = source.path;
		this.symlink     = source.symlink;
		this.element     = element;
		
		this.disposables.add(
			source.onDidDestroy(_=> this.destroy()),
			source.onDidExpand(_=> this.scanEntries()),
			source.onDidAddEntries(_=> this.scanEntries())
		);
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
	
	onDidChangeIcon(fn){
		return this.emitter.on("did-change-icon", fn);
	}

	
	get isExpanded(){
		return this.source.expansionState.isExpanded;
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
	
	
	getIcon(){
		if(this.icon)
			return this.icon;
		
		if(this.symlink)
			return null;
		
		this.icon = IconRegistry.matchDirectory(this);
		return this.icon;
	}
	
	
	setIcon(to){
		if(to !== this.icon){
			const from = this.icon;
			this.icon = to;
			this.emitter.emit("did-change-icon", {from, to});
		}
	}
}


module.exports = TreeDirectory;
