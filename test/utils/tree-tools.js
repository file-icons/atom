"use strict";

const {bindMethods} = require("../../lib/utils/general.js");


class TreeTools{
	
	constructor(){
		this.rootElement = null;
		this.rootEntries = null;
		bindMethods(this);
		
		let root = null;
		Object.defineProperty(this.ls, "element", {
			get: () => root,
			set: to => {
				root = to;
				this.rootElement = root.querySelector(".project-root");
				this.rootEntries = this.rootElement.lastElementChild;
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
		for(const entry of this.rootEntries.querySelectorAll(query))
			entries.push(entry);
		
		const directories = [];
		const files = [];
		const rootHeader = this.rootElement.firstElementChild.firstElementChild;
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
