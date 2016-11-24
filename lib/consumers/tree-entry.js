"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const FileRegistry = require("../file-registry.js");
const IconRegistry = require("../icon-registry.js");
const IconDelegate = require("../icon-delegate.js");
const Resource     = require("../resource.js");
const System       = require("../system.js");


class TreeEntry extends Resource {
	
	constructor(source, element, isDirectory = false){
		super(source.path);
		this.entrySource = source;
		this.element = element;
		this.symlink = source.symlink;
		
		// Directory
		if(this.isDirectory = isDirectory){
			const iconEl = element.directoryName;
			this.submodule = source.submodule;
			this.delegate = new IconDelegate(this, iconEl);
			this.entries = new WeakSet();
			
			this.disposables.add(
				source.onDidDestroy(_=> this.destroy()),
				source.onDidExpand(_=> this.scanEntries()),
				source.onDidAddEntries(_=> this.scanEntries())
			);
		}
		
		// File
		else{
			const file = FileRegistry.get(this.path);
			this.entries = null;
			this.delegate = new IconDelegate(file, element.fileName);
		}
	}
	
	
	destroy(){
		if(!this.destroyed){
			this.delegate.destroy();
			super.destroy();
			this.entrySource = null;
			this.delegate = null;
			this.entries = null;
		}
	}
	
	
	onDidFindEntries(fn){
		return this.emitter.on("did-find-entries", fn);
	}
	
	
	toString(){
		return this.name;
	}
	
	
	get isExpanded(){
		return this.isDirectory && this.entrySource.expansionState.isExpanded;
	}
	
	
	scanEntries(){
		const newEntries = [];

		const {entries} = this.entrySource;
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
}


module.exports = TreeEntry;
