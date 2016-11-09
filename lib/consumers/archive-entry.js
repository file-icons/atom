"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const path = require("path");

const FileRegistry = require("../file-registry.js");
const IconDelegate = require("../icon-delegate.js");
const IconRegistry = require("../icon-registry.js");


class ArchiveEntry{
	
	constructor(view, entry, archivePath, isDirectory = false){
		this.disposables = new CompositeDisposable();
		this.emitter     = new Emitter();
		
		this.view        = view;
		this.entry       = entry;
		this.name        = entry.name;
		this.path        = path.join(archivePath, entry.path);
		this.archivePath = archivePath;
		this.isDirectory = isDirectory;
		
		// Directory
		if(isDirectory){
			const iconElement  = view[0].querySelector(".directory.icon");
			this.delegate      = new IconDelegate(this, iconElement, true);
			if(this.getIcon())
				iconElement.classList.remove("icon-file-directory");
		}
		
		// File
		else{
			const file        = FileRegistry.get(this.path);
			const iconElement = view[0].spacePenView.name[0];
			this.delegate     = new IconDelegate(file, iconElement);
			
			// Save extra filesystem calls by stopping scans early
			file.isBinary = true;
			file.cancelScan();
		}
	}
	
	
	destroy(){
		if(!this.destroyed){
			this.destroyed = true;
			
			this.disposables.dispose();
			this.disposables.clear();
			this.disposables = null;
			
			this.emitter.emit("did-destroy");
			this.emitter.dispose();
			this.emitter = null;
			
			this.element = null;
			this.source = null;
		}
	}
	
	
	onDidDestroy(fn){
		return this.emitter.on("did-destroy", fn);
	}
	
	onDidChangeIcon(fn){
		return this.emitter.on("did-change-icon", fn);
	}
	
	
	getIcon(){
		if(this.icon)
			return this.icon;
		
		for(const icon of IconRegistry.directoryIcons)
			if(icon.match.test(this.name))
				return this.icon = icon;
		
		return null;
	}
	
	
	linkPaneItem(view){
		if(!this.paneItem && view){
			this.paneItem = view;
			
			if("function" === typeof view.onDidDestroy)
				this.disposables.add(view.onDidDestroy(_=> this.destroy()));
		}
	}
}


module.exports = ArchiveEntry;
