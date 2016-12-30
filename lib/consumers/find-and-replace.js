"use strict";

const {isRegExp} = require("../utils/general.js");
const Consumer   = require("./consumer.js");


class FindAndReplace extends Consumer {
	
	constructor(){
		super("find-and-replace");
	}
	
	
	activate(){
		const ResultView = this.loadPackageFile("lib/project/result-view");
		const trackEntry = this.trackEntry.bind(this);
		this.punch(ResultView.prototype, "renderResult", function(oldFn){
			const result = oldFn();
			trackEntry(this.filePath, this[0].querySelector(".icon"));
			return result;
		});
	}
	
	
	search(string, paths = ""){
		let caseSensitive = false;
		let useRegex = false;
		
		if(isRegExp(string)){
			caseSensitive = !string.ignoreCase;
			useRegex = true;
			string = string.source;
		}
		
		const {projectFindView} = this.package.mainModule;
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
