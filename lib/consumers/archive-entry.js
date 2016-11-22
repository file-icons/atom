"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const path = require("path");

const FileRegistry = require("../file-registry.js");
const IconDelegate = require("../icon-delegate.js");
const IconRegistry = require("../icon-registry.js");
const Resource     = require("../resource.js");


class ArchiveEntry extends Resource {
	
	constructor(view, entry, archivePath, isDirectory = false){
		super(path.join(archivePath, entry.path));
		this.view        = view;
		this.entry       = entry;
		this.archivePath = archivePath;
		this.isDirectory = isDirectory;
		
		const iconElement = isDirectory
			? view[0].querySelector(".directory.icon")
			: view[0].spacePenView.name[0];
		
		this.delegate = new IconDelegate(this, iconElement);
	}
	
	
	destroy(){
		if(!this.destroyed){
			this.delegate.destroy();
			super.destroy();
			this.delegate = null;
			this.element = null;
			this.source = null;
		}
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
