"use strict";

const {CompositeDisposable, Disposable} = require("atom");
const StrategyManager = require("./strategy-manager.js");
const EntityType = require("../filesystem/entity-type.js");
const FileSystem = require("../filesystem/filesystem.js");
const IconTables = require("../icons/icon-tables.js");
const IconNode = require("./icon-node.js");


class IconService{
	
	init(paths){
		this.disposables = new CompositeDisposable();
		StrategyManager.init();
		this.isReady = true;
	}
	
	
	reset(){
		this.disposables.dispose();
		this.disposables.clear();
		this.disposables = null;
		
		StrategyManager.reset();
		this.isReady = false;
	}
	
	
	addIconToElement(element, path, options = {}){
		const {
			isDirectory,
			isSymlink,
			isTabIcon,
		} = options;
		
		let type = isDirectory
			? EntityType.DIRECTORY
			: EntityType.FILE;
		
		if(isSymlink)
			type |= EntityType.SYMLINK;
		
		return IconNode.forElement(element, path, type, isTabIcon);
	}
	
	
	suppressFOUC(){
		return {
			iconClassForPath(path, context = ""){
				const file = FileSystem.get(path);
				
				// HACK: Fix #550 by ignoring old icon-service if consumed by Tabs
				// package, and the user disabled tab-icons. This can be deleted if
				// atom/tabs#412 is accepted by the Atom team. Since (we hope) this
				// code-block to be shortlived, we're being sloppy by not bothering
				// to `require` the Options class beforehand.
				if("tabs" === context && !atom.config.get("file-icons.tabPaneIcon"))
					return null;
				
				return file && file.icon
					? file.icon.getClasses() || null
					: null;
			},
			
			onWillDeactivate(){
				return new Disposable();
			}
		}
	}
}

IconService.prototype.isReady = false;

module.exports = new IconService();
