"use strict";

const {join} = require("path");
const {statify} = require("../utils/fs.js");
const {normalisePath} = require("../utils/general.js");
const IconDelegate = require("../service/icon-delegate.js");
const EntityType = require("../filesystem/entity-type.js");
const IconNode = require("../service/icon-node.js");
const Resource = require("../filesystem/resource.js");


class ArchiveEntry extends Resource{
	
	constructor(view, entry, archivePath, isDirectory = false){
		const path = normalisePath(join(archivePath, entry.path));
		const type = (isDirectory = !!isDirectory)
			? EntityType.DIRECTORY
			: EntityType.FILE;
		super(path, statify({mode: type}), true);
		
		this.view        = view;
		this.entry       = entry;
		this.archivePath = normalisePath(archivePath);
		this.unreadable  = true;
		this.isVirtual   = true;
		this.isDirectory = isDirectory;
		this.isFile      = !isDirectory;
		this.icon        = new IconDelegate(this);
		
		const iconElement = isDirectory
			? view[0].querySelector(".directory.icon")
			: view[0].spacePenView.name[0];
		
		this.iconNode = new IconNode(this, iconElement);
	}
	
	
	destroy(){
		if(!this.destroyed){
			this.iconNode.destroy();
			this.iconNode = null;
			super.destroy();
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
	
	
	// Don't waste cycles searching for something that can't be found.
	getRepository(){ return null; }
	getSubmodule(){  return null; }
}


module.exports = ArchiveEntry;
