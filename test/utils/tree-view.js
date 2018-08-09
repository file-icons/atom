"use strict";

const {findBasePath} = require("../../lib/utils.js");
const {isAbsolute, join, sep} = require("path");
let entries = [];

module.exports = {
	
	get entries(){
		return entries;
	},
	
	get files(){
		return entries.filter(entry => !entry.directoryName);
	},
	
	get directories(){
		return entries.filter(entry => !!entry.directoryName);
	},
	
	
	/**
	 * Reference to the tree-view package's main view.
	 * 
	 * @return {TreeView}
	 * @internal
	 */
	get view(){
		const pkg = atom.packages.activePackages["tree-view"];
		if(!pkg || "object" !== typeof pkg.mainModule)
			return null;
		return pkg.mainModule.treeView;
	},
	
	
	/**
	 * Close a directory element in the tree-view pane.
	 *
	 * @param {String} path - Project-relative path of directory
	 * @example TreeView.collapse("test/fixtures");
	 */
	collapse(path){
		this.setExpanded(path, false);
	},
	
	
	/**
	 * Open a directory in the tree-view pane.
	 *
	 * @param {String} path - Project-relative path of directory
	 * @example TreeView.expand("./keymaps");
	 */
	expand(path){
		this.setExpanded(path, true);
	},
	
	
	/**
	 * Repopulate the cached list of entry elements.
	 * @internal
	 */
	refresh(){
		entries = new TreeViewList();
	},
	
	
	/**
	 * Select an entry-element by its path.
	 *
	 * @param {String} [path=null] - Project-relative path of entry.
	 * Passing a value of `null` will clear the current selection.
	 */
	select(path = null){
		if(!this.view) return;
		(!path || "." === path)
			? this.view.deselect(this.view.getSelectedEntries())
			: this.view.selectEntryForPath(path);
	},
	
	
	/**
	 * Set the expansion state of a directory element.
	 *
	 * @param {String} path - Project-relative directory path
	 * @param {Boolean} [open=true] - Whether to open or close the folder.
	 * @example TreeView.setExpanded("test/fixtures", true);
	 */
	setExpanded(path, open = true){
		if(!path)
			path = "./";
		if(!isAbsolute(path))
			path = join(atom.project.getPaths()[0], path);
		const dir = this.view.entryForPath(path);
		if(dir && dir.isExpanded !== open){
			dir.click();
			this.refresh();
		}
	},
	
	
	/**
	 * Force tree-view to display by dispatching `tree-view:show`.
	 * @internal
	 */
	show(){
		const workspace = atom.views.getView(atom.workspace);
		atom.commands.dispatch(workspace, "tree-view:show");
	},
};


class TreeViewList extends Array {
	constructor(){
		super();
		this.projectRoot = null;
		const paths = [];
		const icons = [];
		
		const {treeView} = atom.packages.activePackages["tree-view"].mainModule;
		const {element} = treeView;
		for(const el of element.querySelectorAll(".entry")){
			this.push(el);
			paths.push(el.getPath());
			icons.push(el.directoryName || el.fileName);
			
			const isRoot = el.classList.contains("project-root");
			if(null === this.projectRoot && isRoot)
				this.projectRoot = el;
		}
		
		const basePath = findBasePath(paths) + sep;
		paths.forEach((path, index) => {
			path = path.replace(basePath, "").replace(/\\/g, "/");
			this[path] = icons[index];
		});
	}
	
	get ["."](){
		return this.projectRoot
			? this.projectRoot.directoryName
			: null;
	}
}
