"use strict";

const {CompositeDisposable, Disposable} = require("atom");
const StrategyManager = require("./strategy-manager.js");
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
	
	
	addIconToElement(element, path){
		return IconNode.forElement(element, path);
	}
	
	
	suppressFOUC(){
		return {
			iconClassForPath(path){
				const file = FileSystem.get(path);
				return file.icon.getClasses() || null;
			},
			
			onWillDeactivate(){
				return new Disposable();
			}
		}
	}
}

IconService.prototype.isReady = false;

module.exports = new IconService();
