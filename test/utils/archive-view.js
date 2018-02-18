"use strict";

let entries = [];

module.exports = {
	get entries(){
		return entries;
	},
	refresh(){
		entries = new ArchiveViewList();
	},
};

class ArchiveViewList extends Array {
	constructor(){
		super();
		const workspace = atom.views.getView(atom.workspace);
		const files = workspace.querySelectorAll(".archive-tree li.entry.list-item");
		const dirs = workspace.querySelectorAll(".archive-tree li.entry.list-nested-item");
		for(const entry of [...files, ...dirs]){
			const icon = entry.querySelector(".icon");
			const path = icon.textContent.trim().replace(/\\/g, "/");
			this[path] = icon;
			this.push(entry);
		}
	}
}
