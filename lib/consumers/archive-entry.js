"use strict";

const {join} = require("path");

const IconDelegate = require("../service/icon-delegate.js");
const EntityType = require("../filesystem/entity-type.js");
const IconNode = require("../service/icon-node.js");
const Resource = require("../filesystem/resource.js");


class ArchiveEntry extends Resource{
	
	constructor(view, entry, archivePath, isDirectory = false){
		const path = join(archivePath, entry.path);
		const type = isDirectory ? EntityType.DIRECTORY : EntityType.FILE;
		super(path, type);
		
		this.view        = view;
		this.entry       = entry;
		this.archivePath = archivePath;
		this.isVirtual   = true;
		this.isDirectory = isDirectory;
		this.icon        = new IconDelegate(this);
		
		const iconElement = isDirectory
			? view[0].querySelector(".directory.icon")
			: view[0].spacePenView.name[0];
		
		this.iconNode = new IconNode(this, iconElement);
	}
	
	
	destroy(){
		if(!this.destroyed){
			this.iconNode.destroy();
			this.icon.destroy();
			super.destroy();
			this.iconNode = null;
			this.source = null;
			this.entry = null;
			this.icon = null;
			this.view = null;
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
