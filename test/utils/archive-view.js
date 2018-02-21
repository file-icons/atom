"use strict";

module.exports = {
	get entries(){
		const entries = [];
		const workspace = atom.views.getView(atom.workspace);
		const files = workspace.querySelectorAll(".archive-tree li.entry.list-item");
		const dirs = workspace.querySelectorAll(".archive-tree li.entry.list-nested-item");
		for(const entry of [...files, ...dirs]){
			const icon = entry.querySelector(".icon");
			const path = this.stitchPath(entry);
			entries[path] = icon;
			entries.push(entry);
		}
		return entries;
	},
	
	stitchPath(entry){
		let segments = [];
		while(entry){
			const tag = entry.tagName;
			if("OL" === tag && entry.matches(".archive-tree"))
				break;
			if("LI" === tag && entry.matches(".entry")){
				const icon = entry.firstElementChild;
				const name = icon.textContent.trim().replace(/\\/g, "/");
				segments.push(name);
			}
			entry = entry.parentElement;
		}
		return segments.reverse().join("/");
	},
};
