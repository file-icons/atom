"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const IconRegistry = require("./icon-registry.js");


class TreeDirectory{
	
	constructor(source, element = null){
		this.disposables = new CompositeDisposable();
		this.emitter     = new Emitter();
		
		this.source      = source;
		this.name        = source.name;
		this.path        = source.path;
		this.symlink     = source.symlink;
		this.element     = element;
		
		this.disposables.add(
			source.onDidDestroy(_=> this.destroy()),
			source.onDidExpand(_=> this.scanEntries())
		);
		
		this.showIcon();
	}
	
	
	destroy(){
		if(!this.destroyed){
			this.destroyed = true;
			this.disposables.dispose();
			this.disposables = null;
			this.emitter.emit("did-destroy");
			this.emitter.dispose();
			this.emitter = null;
			this.source = null;
		}
	}
	
	
	onDidDestroy(fn){
		return this.emitter.on("did-destroy", fn);
	}
	
	onDidFindSubdirs(fn){
		return this.emitter.on("did-find-subdirs", fn);
	}

	
	isDirectory(entry){
		return "expansionState" in entry;
	}
	
	
	get isOpen(){
		return !!this.source.expansionState.isExpanded;
	}
	
	
	toString(){
		return this.name;
	}
	
	
	scanEntries(){
		const subdirs = [];
		
		const {entries} = this.source;
		for(const name in entries){
			const entry = entries[name];
			if(this.isDirectory(entry))
				subdirs.push(entry);
		}
		
		if(subdirs.length)
			this.emitter.emit("did-find-subdirs", subdirs);
	}


	getIcon(){
		if(this.icon)
			return icon;
		
		else{
			for(const icon of IconRegistry.directoryIcons){
				if(icon.match.test(this.name)){
					this.icon = icon;
					return icon;
				}
			}
		}
	}
	
	
	showIcon(){
		if(!this.element || this.symlink)
			return;
		
		const icon = this.getIcon();
		if(icon){
			const label = this.element.header.firstElementChild;
			const classes = "name icon " + icon.getClass();
			label.className = classes;
		}
	}
}


module.exports = TreeDirectory;
