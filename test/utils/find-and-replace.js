"use strict";

const {isRegExp, wait} = require("alhadis.utils");
let entries = [];

module.exports = {
	get entries(){
		return entries;
	},
	getMain,
	refresh,
	search,
};


class FindAndReplaceList extends Array {
	constructor(){
		super();
		const workspace = atom.views.getView(atom.workspace);
		for(const item of workspace.querySelectorAll(".results-view > .path")){
			const pathDetails = item.querySelector(".path-details");
			const name = pathDetails.querySelector(".path-name").textContent;
			const icon = pathDetails.querySelector(".icon");
			this.push(item);
			Object.defineProperty(this, name.replace(/\\/g, "/"), {value: icon});
		}
	}
}

function getMain(){
	return atom.packages.activePackages["find-and-replace"].mainModule;
}

function refresh(){
	entries = new FindAndReplaceList();
}

async function search(string, paths = ""){
	let caseSensitive = false;
	let useRegex = false;
	
	if(isRegExp(string)){
		caseSensitive = !string.ignoreCase;
		useRegex = true;
		string = string.source;
	}
	
	const view = getMain().projectFindView;
	const editor = view.findEditor.getModel
		? view.findEditor.getModel()
		: view.findEditor;
	editor.setText(string);
	view.model.search(string, paths, "", {caseSensitive, useRegex});
	
	const uri = "atom://find-and-replace/project-results";
	const openOpts = {activateItem: true, activatePane: true};
	await atom.workspace.open(uri, openOpts);
	await wait(450);
	
	const pane = atom.workspace.paneForURI(uri);
	pane.itemForURI(uri).render();
	await wait(500);
	refresh();
}
