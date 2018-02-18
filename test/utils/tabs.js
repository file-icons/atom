"use strict";

let list = [];

module.exports = {
	get list(){
		return list;
	},
	refresh(){
		list = new TabsList();
	},
	closeAll,
	getTab,
};


class TabsList extends Array {
	constructor(){
		super();
		const items = atom.workspace.getPaneItems();
		for(const item of items){
			if(item.getFileName){
				const name = item.getFileName();
				const tab  = getTab(item);
				this.push(tab);
				Object.defineProperty(this, name, {
					value: tab.itemTitle
				});
			}
		}
	}
}

function closeAll(){
	const workspace = atom.views.getView(atom.workspace);
	atom.commands.dispatch(workspace, "tabs:close-all-tabs");
}

function getTab(paneItem){
	if(!paneItem) return null;
	const workspace = atom.views.getView(atom.workspace);
	const tabElements = workspace.querySelectorAll(".tab");
	for(const tab of tabElements){
		if(paneItem !== tab.item) continue;
		switch(tab.dataset.type){
			case "TextEditor":
			case "ArchiveEditor":
				return tab;
		}
	}
	return null;
}
