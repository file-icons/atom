"use strict";

const {isRegExp, normalisePath, wait} = require("alhadis.utils");
const Consumer = require("./consumer.js");


class FindAndReplace extends Consumer {
	
	constructor(){
		super("find-and-replace");
	}
	
	
	activate(){
		const ResultView = this.loadPackageFile("lib/project/result-view");
		const usesLegacy = !!ResultView.prototype.renderResult
		const trackEntry = this.trackEntry.bind(this);
		const methodName = usesLegacy ? "renderResult" : "render";
		this.jQueryRemoved = !usesLegacy;
		this.punch(ResultView.prototype, methodName, function(oldFn){
			const result = oldFn();
			const path = normalisePath(this.filePath);
			usesLegacy
				? trackEntry(path, this[0].querySelector(".icon"))
				: process.nextTick(() => {
					trackEntry(path, this.element.querySelector(".icon"));
				});
			return result;
		});
		this.disposables.add(
			atom.workspace.onDidDestroyPaneItem(event => {
				const {item} = event;
				if(item && "ResultsPaneView" === item.constructor.name)
					this.resetNodes();
			})
		);
	}
	
	
	search(string, paths = ""){
		let caseSensitive = false;
		let useRegex = false;
		
		if(isRegExp(string)){
			caseSensitive = !string.ignoreCase;
			useRegex = true;
			string = string.source;
		}
		
		const view = this.package.mainModule.projectFindView;
		const editor = view.findEditor.getModel
			? view.findEditor.getModel()
			: view.findEditor;
		editor.setText(string);
		view.model.search(string, paths, "", {caseSensitive, useRegex});
		
		const openOpts = {activateItem: true, activatePane: true};
		return atom.workspace.open(this.resultsURI, openOpts)
			.then(() => wait(450))
			.then(() => this.showResults());
	}
	
	
	showResults(){
		const view = this.getResultsView();
		return false === this.jQueryRemoved
			? view.resultsView.renderResults()
			: view.render();
	}
	
	
	getResultsView(){
		const pane = atom.workspace.paneForURI(this.resultsURI);
		return pane
			? pane.itemForURI(this.resultsURI)
			: null;
	}
}

Object.defineProperty(FindAndReplace.prototype, "resultsURI", {
	value: "atom://find-and-replace/project-results",
	enumerable: false
});

module.exports = new FindAndReplace();
