"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const FileRegistry  = require("../filesystem/file-registry.js");
const TreeEntry     = require("./tree-entry.js");


class TreeView{
	
	init(){
		this.disposables = new CompositeDisposable();
		this.entries = new Map();
		this.emitter = new Emitter();
		
		this.checkPanes();
		this.disposables.add(
			atom.packages.onDidActivatePackage(_=> this.checkPanes()),
			atom.packages.onDidDeactivatePackage(_=> this.checkPanes()),
			atom.packages.onDidActivateInitialPackages(_=> this.checkPanes()),
			
			this.onDidAttach(_=> {
				this.entryElements = this.element[0].getElementsByClassName("entry");
				
				// TODO: Remove check when atom/tree-view#966 is merged/shipped
				if("function" === typeof this.element.onEntryMoved){
					const onMove = this.element.onEntryMoved(paths => {
						FileRegistry.fixPath(paths.oldPath, paths.newPath);
					});
					this.disposables.add(onMove);
				}
				const onAddPath = atom.project.onDidChangePaths(_=> this.updateRoots());
				this.disposables.add(onAddPath);
				this.updateRoots();
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
			
			if(treeView){
				this.element = treeView;
				this.emitter.emit("did-attach");
			}
			
			else if(!this.pending){
				this.pending = atom.commands.onDidDispatch(cmd => {
					if("tree-view:toggle" === cmd.type){
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
	
	

	updateRoots(){
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
}


module.exports = new TreeView();
