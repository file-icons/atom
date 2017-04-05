"use strict";

const {isAbsolute, join, sep} = require("path");
const {CompositeDisposable, Disposable, Emitter} = require("atom");
const {FileSystem}  = require("atom-fs");
const TreeEntry     = require("./tree-entry.js");
const Consumer      = require("./consumer.js");
const UI            = require("../ui.js");


class TreeView extends Consumer {
	
	constructor(){
		super("tree-view");
		this.entryElements = null;
		this.entries = new Map();
		this.element = null;
		
		this.disposables.set("project",
			UI.onProjectsAvailable(() => {
				this.show(true);
				this.disposables.dispose("project");
			})
		);
	}
	
	
	init(){
		super.init();
		this.updateStatus();
	}
	
	
	activate(){
		this.show(true);
		const {treeView}   = this.packageModule;
		this.element       = treeView;
		this.entryElements = (treeView[0] || treeView.element).getElementsByClassName("entry");
		
		// TODO: 1. Move following block to Atom-FS module.
		// TODO: 2. Add remaining handlers for callbacks added by atom/tree-view#1049.
		if("function" === typeof this.element.onEntryMoved){
			const onMove = this.element.onEntryMoved(paths => {
				FileSystem.updatePath(paths.initialPath, paths.newPath);
			});
			this.disposables.add(onMove);
		}
		
		this.disposables.add(
			atom.project.onDidChangePaths(() => this.rebuild()),
			atom.config.onDidChange("tree-view.hideIgnoredNames", () => this.rebuild()),
			atom.config.onDidChange("tree-view.hideVcsIgnoredFiles", () => this.rebuild()),
			atom.config.onDidChange("tree-view.squashDirectoryNames", () => this.rebuild()),
			atom.config.onDidChange("tree-view.sortFoldersBeforeFiles", () => this.rebuild())
		);
		this.rebuild();
		
		// HACK (file-icons/atom#550): Needed to force refresh when switching projects in Project Plus.
		// See: https://github.com/mehcode/atom-project-util/blob/f58bec9e582c43a74fc2ed1/index.js#L155
		if(atom.packages.loadedPackages["project-plus"])
			this.punch(treeView, "updateRoots", oldFn => {
				const result = oldFn();
				this.rebuild();
				return result;
			});
	}
	
	
	updateStatus(){
		const pkg = atom.packages.activePackages[this.name];
		const seemsActive = pkg && !this.active && pkg.mainModule && pkg.mainModule.treeView;
		if(!seemsActive) return false;
		return super.updateStatus();
	}
	
	

	rebuild(){
		if(!this.element || !this.element.roots)
			return;
		
		for(const root of this.element.roots)
			this.track(root.directory);
	}
	
	
	track(...entries){
		for(const entry of entries){
			if(!this.entries.has(entry)){
				const isDirectory = "expansionState" in entry;
				const element     = this.elementForEntry(entry);
				const resource    = new TreeEntry(entry, element, isDirectory);
				this.entries.set(entry, resource);
				
				const disposables = new CompositeDisposable(
					entry.onDidDestroy(_=> disposables.dispose()),
					new Disposable(_=> {
						this.disposables.remove(disposables);
						this.entries.delete(entry);
						entry.destroy();
					})
				);
				this.disposables.add(disposables);
				
				// Directory
				if(isDirectory){
					const onFound = resource.onDidFindEntries(entries => this.track(...entries));
					disposables.add(onFound);
					if(resource.isExpanded)
						resource.scanEntries();
				}
			}
		}
	}
	
	
	
	elementForEntry(entry){
		if(entry.element) return entry.element;
		const {path} = entry;
		const {length} = this.entryElements;
		for(let i = 0; i < length; ++i){
			const el = this.entryElements[i];
			if(el.isPathEqual(path))
				return el;
		}
		return null;
	}
	
	

	/**
	 * Select an entry-element by its path.
	 *
	 * @param {String} [path=null] - Project-relative path of entry.
	 * Passing a value of `null` will clear the current selection.
	 */
	select(path = null){
		if(!this.element) return;
		(!path || path === ".")
			? this.element.deselect(this.element.getSelectedEntries())
			: this.element.selectEntryForPath(path);
	}
	
	
	/**
	 * Close a directory element in the tree-view pane.
	 *
	 * @param {String} path - Project-relative path of directory
	 * @example TreeView.collapse("test/fixtures");
	 */
	collapse(path){
		this.setExpanded(path, false);
	}
	
	
	/**
	 * Open a directory in the tree-view pane.
	 *
	 * @param {String} path - Project-relative path of directory
	 * @example TreeView.expand("./keymaps");
	 */
	expand(path){
		this.setExpanded(path, true);
	}
	
	
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
		const dir = this.element.entryForPath(path);
		dir && dir.isExpanded !== open && dir.click();
	}
	
	
	/**
	 * Whether the TreeView is currently attached to the workspace.
	 *
	 * @property {Boolean}
	 * @readonly
	 */
	get visible(){
		return this.element
			? atom.views.getView(atom.workspace).contains(this.element[0])
			: false;
	}
	
	set visible(value){
		if(!this.element || this.visible === !!value)
			return;
		
		const workspace = atom.views.getView(atom.workspace);
		atom.commands.dispatch(workspace, "tree-view:toggle");
	}
	
	
	
	/**
	 * Force tree-view to display by dispatching `tree-view:show`.
	 *
	 * @private
	 */
	show(startup=false){
		if(startup && false === atom.config.get("file-icons.revealTreeView"))
			return;
		const workspace = atom.views.getView(atom.workspace);
		atom.commands.dispatch(workspace, "tree-view:show");
	}
}


module.exports = new TreeView();
