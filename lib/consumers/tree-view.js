"use strict";

const {isAbsolute, join, sep} = require("path");
const {CompositeDisposable, Disposable, Emitter} = require("atom");
const FileSystem    = require("../filesystem/filesystem.js");
const TreeEntry     = require("./tree-entry.js");


class TreeView{
	
	init(){
		this.disposables = new CompositeDisposable();
		this.entries = new Map();
		this.emitter = new Emitter();
		this.element = null;
		
		this.checkPanes();
		this.disposables.add(
			atom.packages.onDidActivatePackage(_=> this.checkPanes()),
			atom.packages.onDidDeactivatePackage(_=> this.checkPanes()),
			atom.packages.onDidActivateInitialPackages(() => {
				const workspace = atom.views.getView(atom.workspace);
				atom.commands.dispatch(workspace, "tree-view:show");
				this.checkPanes();
			}),
			
			this.onDidAttach(() => {
				if(this.metadata.consumedServices["file-icons.element-icons"]){
					this.isRedundant = true;
					return;
				}
				
				this.entryElements = this.element[0].getElementsByClassName("entry");
				
				// TODO: Remove check when atom/tree-view#966 is merged/shipped
				if("function" === typeof this.element.onEntryMoved){
					const onMove = this.element.onEntryMoved(paths => {
						FileSystem.fixPath(paths.oldPath, paths.newPath);
					});
					this.disposables.add(onMove);
				}
				this.disposables.add(
					atom.project.onDidChangePaths(_=> this.rebuild()),
					atom.config.onDidChange("tree-view.hideIgnoredNames", _=> this.rebuild()),
					atom.config.onDidChange("tree-view.hideVcsIgnoredFiles", _=> this.rebuild()),
					atom.config.onDidChange("tree-view.squashDirectoryNames", _=> this.rebuild()),
					atom.config.onDidChange("tree-view.sortFoldersBeforeFiles", _=> this.rebuild())
				);
				this.rebuild();
			})
		);
	}
	
	
	reset(){
		this.disposables.dispose();
		this.emitter.dispose();
		this.entries.clear();
		
		this.entryElements = null;
		this.disposables = null;
		this.entries = null;
		this.emitter = null;
		this.element = null;
	}
	
	
	onDidAttach(fn){
		return this.emitter.on("did-attach", fn);
	}
	
	
	onDidRemove(fn){
		return this.emitter.on("did-remove", fn);
	}
	
	
	/**
	 * Query the activation status of the tree-view package.
	 *
	 * @private
	 */
	checkPanes(){
		const treePackage = atom.packages.activePackages["tree-view"];
		
		if(treePackage && !this.element){
			const {treeView} = treePackage.mainModule;
			this.metadata = treePackage.metadata;
			
			if(treeView){
				this.element = treeView;
				this.emitter.emit("did-attach");
			}
			
			else if(!this.pending){
				this.pending = atom.commands.onDidDispatch(cmd => {
					if("tree-view:toggle" === cmd.type || "tree-view:show" === cmd.type){
						this.pending.dispose();
						this.disposables.remove(this.pending);
						delete this.pending;
						
						this.element = treePackage.mainModule.treeView;
						this.emitter.emit("did-attach");
					}
				});
				this.disposables.add(this.pending);
			}
		}
		
		else if(!treePackage && this.element){
			this.element = null;
			this.emitter.emit("did-remove");
		}
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
}


module.exports = new TreeView();
