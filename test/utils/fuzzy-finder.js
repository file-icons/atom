"use strict";

const {condition, wait} = require("./index.js");

module.exports = {
	get entries() { return getEntries(); },
	get panel()   { return getPanel();   },
	get view()    { return getView();    },
	get visible() { return getVisible(); },
	show, hide, filter, condition,
	
	// Aliases
	open:   show,
	close:  hide,
	search: filter,
};

function getEntries(){
	const entries = [];
	const {element} = getView();
	for(const item of element.querySelectorAll(".list-group > li")){
		const value = item.querySelector(".primary-line");
		entries.push(value);
		const path = value.dataset.path.replace(/\\/g, "/");
		Object.defineProperty(entries, path, {value});
	}
	return entries;
}

function getPanel(){
	return atom.workspace.panelForItem(getView());
}

function getView(){
	const {mainModule} = atom.packages.activePackages["fuzzy-finder"];
	return mainModule.createProjectView();
}

function getVisible(){
	const panel = getPanel();
	return !!(panel && panel.isVisible());
}

async function show(){
	if(getVisible()) return;
	await getView().toggle();
	await condition(() => getView().element.querySelectorAll("li").length > 0);
}

async function hide(){
	await getVisible() && getView().toggle();
}

async function filter(query){
	await show();
	const {selectListView} = getView();
	selectListView.refs.queryEditor.setText(query);
	await selectListView.update({maxResults: null});
	await wait(300);
}
