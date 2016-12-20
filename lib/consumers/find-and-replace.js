"use strict";

const {CompositeDisposable, Disposable} = require("atom");
const {join, resolve}   = require("path");
const {punch, isRegExp} = require("../utils/general.js");

const FileRegistry      = require("../filesystem/file-registry.js");
const IconNode          = require("../service/icon-node.js");


class FindAndReplace{
	
	init(){
		this.active = false;
		this.iconNodes = new Set();
		
		setImmediate(_=> this.checkPackage());
		this.disposables = new CompositeDisposable(
			atom.packages.onDidActivatePackage(_=> this.checkPackage()),
			atom.packages.onDidDeactivatePackage(_=> this.checkPackage()),
			atom.packages.onDidActivateInitialPackages(_=> this.checkPackage())
		);
	}
	
	
	reset(){
		this.disposables.dispose();
		this.disposables = null;
		this.resetNodes();
		this.package = null;
		this.active = false;
	}
	
	
	resetNodes(){
		this.iconNodes.forEach(node => node.destroy());
		this.iconNodes.clear();
	}
	
	
	checkPackage(){
		const findPackage = atom.packages.activePackages["find-and-replace"];
		
		if(findPackage && !this.active){
			this.active = true;
			this.package = findPackage.mainModule;
			
			const reqPath     = join(findPackage.path, "lib", "project", "result-view");
			const ResultView  = require(reqPath);
			const {iconNodes} = this;
			this.punch(ResultView.prototype, "renderResult", function(oldFn){
				const result  = oldFn();
				const file    = FileRegistry.get(this.filePath);
				const icon    = new IconNode(file, this[0].querySelector(".icon"));
				iconNodes.add(icon);
				return result;
			});
		}
		
		else if(!findPackage && this.active){
			this.active = false;
			this.package = null;
			this.resetNodes();
		}
	}
	
	
	punch(object, method, fn){
		if(!this.punchedMethods){
			this.punchedMethods = new CompositeDisposable(
				new Disposable(_=> this.punchedMethods = null)
			);
			this.disposables.add(this.punchedMethods);
		}
		
		const [originalMethod] = punch(object, method, fn);
		this.punchedMethods.add(new Disposable(_=> {
			object[method] = originalMethod;
		}));
	}
	
	
	search(string, paths = ""){
		let caseSensitive = false;
		let useRegex = false;
		
		if(isRegExp(string)){
			caseSensitive = !string.ignoreCase;
			useRegex = true;
			string = string.source;
		}
		
		const {projectFindView} = this.package;
		projectFindView.findEditor.getModel().setText(string);
		projectFindView.model.search(string, paths, "", {caseSensitive, useRegex});
		
		const openOpts = {activateItem: true, activatePane: true};
		return atom.workspace.open(this.resultsURI, openOpts)
			.then(() => wait(450))
			.then(() => this.getResultsView().renderResults());
	}
	
	
	getResultsView(){
		const pane = atom.workspace.paneForURI(this.resultsURI);
		return pane
			? pane.itemForURI(this.resultsURI).resultsView
			: null;
	}
}

Object.defineProperty(FindAndReplace.prototype, "resultsURI", {
	value: "atom://find-and-replace/project-results",
	enumerable: false
});

module.exports = new FindAndReplace();
