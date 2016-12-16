"use strict";

const {bindMethods} = require("../../lib/utils/general.js");

let treeElement = null;   // ->  <div class="tree-view-resizer">…
let treeControl = null;   // ->  spacePenView
let projectRoot = null;   // ->  <li is="tree-view-directory">…
let entriesList = null;   // ->  <ol class="entries list-tree">…
let projectPath = "";     // ->  "/path/to/file-icons/test/fixtures/project"


class TreeTools{
	
	constructor(){
		bindMethods(this);
		
		Object.defineProperty(this.ls, "element", {
			get: () => treeControl,
			set: to => {
				treeElement = to;
				treeControl = to.spacePenView;
				projectRoot = treeElement.querySelector(".project-root");
				entriesList = projectRoot.lastElementChild;
				projectPath = projectRoot.directory.path;
			}
		});
	}


	assertIconClasses(nodes, assertions, negate = false){
		for(const [name, classes] of assertions)
			negate
				? nodes[name].should.not.have.class(classes)
				: nodes[name].should.have.class(classes);
	}
	
	
	collapse(path){
		this.setExpanded(path, false);
	}
	
	
	expand(path){
		this.setExpanded(path, true);
	}
	
	
	ls(){
		const entries = [];
		const query = ".file.entry, .directory.entry";
		for(const entry of entriesList.querySelectorAll(query))
			entries.push(entry);
		
		const directories = [];
		const files = [];
		const rootHeader = projectRoot.firstElementChild.firstElementChild;
		const props = {".": {value: rootHeader}};
		entries.forEach(entry => {
			const isDirectory = entry.classList.contains("directory");
			const entryObject = isDirectory ? entry.directory : entry.file;
			const [proj, name] = atom.project.relativizePath(entryObject.path);
			props[name] = {value: isDirectory ? entry.directoryName : entry.fileName}
			Object.defineProperty(isDirectory ? directories : files, name, props[name]).push(entry);
		});
		props.files = {value: files};
		props.directories = {value: directories};
		return Object.defineProperties(entries, props);
	}
	
	
	get(projectPath){
		return treeControl.entryForPath(projectPath);
	}
	
	
	select(path = null){
		(!path || path === ".")
			? treeControl.deselect(treeControl.getSelectedEntries())
			: treeControl.selectEntryForPath(path);
	}
	

	setExpanded(path, open = true){
		let chunks = path.replace(/^\.\/+|\/+$/g, "").split(/[\\\/]+/).filter(Boolean);
		if(!open) chunks.reveres();
		for(const chunk of chunks){
			const {directories} = this.ls();
			if(directories[chunk]){
				const dir = directories[chunk].parentElement.parentElement;
				dir.click();
			}
		}
	}
}


module.exports = new TreeTools();
global.TreeTools = module.exports;
