"use strict";

const {isRegExp, wait} = require("../../lib/utils.js");
let activation = null;

module.exports = {
	get activation(){
		return activation || this.activate();
	},
	
	get entries(){
		const entries = [];
		const workspace = atom.views.getView(atom.workspace);
		for(const item of workspace.querySelectorAll(".results-view .path-row[data-file-path]")){
			const name = item.querySelector(".path-name").textContent;
			const icon = item.querySelector(".icon");
			entries.push(item);
			Object.defineProperty(entries, name.replace(/\\/g, "/"), {value: icon});
		}
		return entries;
	},
	
	get main(){
		if(!atom.packages.isPackageActive("find-and-replace"))
			return null;
		const pkg = atom.packages.getActivePackage("find-and-replace");
		return pkg.mainModule;
	},
	
	activate(){
		if(null === activation){
			activation = atom.packages.activatePackage("find-and-replace").then(pkg => {
				const {mainModule} = pkg;
				mainModule.createViews();
				return pkg;
			});
		}
		const workspace = atom.views.getView(atom.workspace);
		workspace.style.height = "5000px";
		wait(100).then(() => atom.commands.dispatch(workspace, "project-find:show"));
		return activation;
	},
	
	async search(string, paths = ""){
		let caseSensitive = false;
		let useRegex = false;
		
		if(isRegExp(string)){
			caseSensitive = !string.ignoreCase;
			useRegex = true;
			string = string.source;
		}
		
		const {mainModule} = await activation;
		const view = mainModule.projectFindView;
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
	},
};
