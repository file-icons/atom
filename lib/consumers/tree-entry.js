"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const IconDelegate = require("../service/icon-delegate.js");
const FileSystem   = require("../filesystem/filesystem.js");
const System       = require("../filesystem/system.js");
const IconNode     = require("../service/icon-node.js");
const Log          = require("../log.js").tag("TREE ENTRY");


class TreeEntry{
	
	constructor(source, element){
		this.disposables = new CompositeDisposable();
		this.emitter = new Emitter();
		this.path = source.path;
		this.source = source;
		this.element = element;
		
		const iconEl = element.directoryName || element.fileName;
		iconEl.className = "name icon";
		
		this.resource = FileSystem.get(this.path);
		
		// Directory
		if(this.isDirectory = this.resource.isDirectory){
			this.entries = new WeakSet();
			
			if(source.submodule)
				this.resource.isSubmodule = true;
			
			"function" === typeof source.onDidExpand
				? this.disposables.add(source.onDidExpand(() => this.scanEntries()))
				: Log.error("Oddball - `onDidExpand` expected on directory", this.path, source);
			
			"function" === typeof source.onDidAddEntries
				? this.disposables.add(source.onDidAddEntries(() => this.scanEntries()))
				: Log.error("Oddball - `onDidAddEntries` expected on directory", this.path, source);
		}
		
		this.iconNode = new IconNode(this.resource, iconEl);
		this.disposables.add(this.resource.onDidDestroy(() => this.destroy()));
	}
	
	
	destroy(){
		if(!this.destroyed){
			this.destroyed = true;
			
			this.emitter.emit("did-destroy");
			this.emitter.dispose();
			this.iconNode.destroy();
			this.disposables.dispose();

			this.disposables = null;
			this.emitter     = null;
			this.iconNode    = null;
			this.source      = null;
			this.entries     = null;
		}
	}
	
	
	onDidFindEntries(fn){
		return this.emitter.on("did-find-entries", fn);
	}
	
	
	toString(){
		return this.name;
	}
	
	
	get isExpanded(){
		return this.isDirectory && this.source.expansionState.isExpanded;
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
	
	
	/**
	 * Pointer to the `className` property of the entry's icon-element.
	 *
	 * @todo Move this (and the `classList`-getter) somewhere more suitable.
	 * @return {String}
	 * @readonly
	 */
	get className(){
		return this.iconNode
			? this.iconNode.element.className
			: null;
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
		
		if(newEntries.length && this.emitter)
			 this.emitter.emit("did-find-entries", newEntries);
	}
}


module.exports = TreeEntry;
