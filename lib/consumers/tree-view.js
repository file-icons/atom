"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const FileRegistry = require("../file-registry.js");
const IconRegistry = require("../icon-registry.js");
const TreeEntry    = require("./tree-entry.js");


class TreeView{
	
	init(){
		this.disposables = new CompositeDisposable();
		this.entries = new Map();
		this.emitter = new Emitter();
		this.entryDisposables = new WeakMap();
		
		this.checkPanes();
		this.disposables.add(
			atom.packages.onDidActivatePackage(_=> this.checkPanes()),
			atom.packages.onDidDeactivatePackage(_=> this.checkPanes()),
			atom.packages.onDidActivateInitialPackages(_=> this.checkPanes()),
			
			this.onDidAttach(_=> {
				this.entryElements = this.element[0].getElementsByClassName("entry");
				const onMove = this.element.onEntryMoved(paths => {
					const from = paths.oldPath;
					const to   = paths.newPath;
					const file = FileRegistry.filesByPath[from];
					FileRegistry.updatePath(file, {from, to});
				});
				const onAddPath = atom.project.onDidChangePaths(_=> this.updateRoots());
				this.disposables.add(onMove, onAddPath);
				this.updateRoots();
			})
		);
	}
	
	
	reset(){
		this.entryElements = null;
		this.entryDisposables = null;
		this.entries.forEach(entry => this.untrack(entry));
		this.entries.clear();
		this.entries = null;
		this.disposables.dispose();
		this.disposables = null;
		this.emitter.dispose();
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
				const element = this.elementForEntry(entry);
				const entryObject = new TreeEntry(entry, element);
				
				const disposables = new CompositeDisposable(
					entryObject.onDidDestroy(_=> this.untrack(entry)),
					entryObject.onDidFindEntries(entries => this.track(...entries))
				);
				
				if(entryObject.isDirectory){
					this.showIconForDirectory(entryObject);
					if(entryObject.isExpanded())
						entryObject.scanEntries();
				}
				
				this.entryDisposables.set(entryObject, disposables);
				this.disposables.add(disposables);
				this.entries.set(entry, entryObject);
			}
		}
	}
	
	
	untrack(...entries){
		for(const entry of entries){
			const entryObject = this.entries.get(entry);
			
			if(undefined !== entryObject){
				entryObject.destroy();
				this.entries.delete(entry);
				
				const disposable = this.entryDisposables.get(entryObject);
				disposable && disposable.dispose();
				this.disposables.remove(disposable);
				this.entryDisposables.delete(disposable);
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
	
	
	showIconForDirectory(entry){
		if(!entry.element || entry.symlink)
			return;
		
		if(undefined === entry.icon){
			entry.icon = null;
			
			for(const icon of IconRegistry.directoryIcons){
				if(icon.match.test(entry.name)){
					entry.icon = icon;
					break;
				}
			}
		}
		
		if(entry.icon){
			const label = entry.element.header.firstElementChild;
			label.className = "name icon " + entry.icon.getClass();
		}
	}
}


module.exports = new TreeView();
