"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const IconDelegate = require("../service/icon-delegate.js");
const FileRegistry = require("../filesystem/file-registry.js");
const Resource     = require("../filesystem/resource.js");
const System       = require("../filesystem/system.js");
const IconNode     = require("../service/icon-node.js");


class TreeEntry extends Resource {
	
	constructor(source, element, isDirectory = false){
		super(source.path);
		this.entrySource = source;
		this.element = element;
		this.symlink = source.symlink;
		
		// Directory
		if(this.isDirectory = isDirectory){
			this.submodule = !!source.submodule;
			this.icon      = new IconDelegate(this);
			this.iconNode  = new IconNode(this, element.directoryName);
			this.entries   = new WeakSet();
			
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
			this.iconNode = new IconNode(file, element.fileName);
		}
	}
	
	
	destroy(){
		if(!this.destroyed){
			this.iconNode.destroy();
			super.destroy();
			this.entrySource = null;
			this.iconNode = null;
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
	
	
	/**
	 * Pointer to the `iconNode` element's CSS classes.
	 *
	 * Included to simplify assertions during tests.
	 *
	 * @return {DOMTokenList}
	 * @readonly
	 */
	get classList(){
		return this.iconNode
			? this.iconNode.element.classList
			: null;
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
			this.emit("did-find-entries", newEntries);
	}
}


module.exports = TreeEntry;
