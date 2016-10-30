"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const FileRegistry = require("./file-registry.js");
const TreeDirectory = require("./tree-directory.js");


class TreeView{
	
	init(){
		this.disposables = new CompositeDisposable();
		this.directories = new Map();
		this.emitter = new Emitter();
		this.directoryDisposables = new WeakMap();
		
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
		this.directories.forEach(dir => this.untrack(dir));
		this.directories.clear();
		this.directories = null;
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
	
	
	track(...directories){
		for(const dir of directories){
			if(!this.directories.has(dir)){
				const entryEl = this.elementForEntry(dir);
				const dirObj = new TreeDirectory(dir, entryEl);
				const dirCD = new CompositeDisposable(
					dirObj.onDidDestroy(_=> this.untrack(dir)),
					dirObj.onDidFindSubdirs(dirs => this.track(...dirs))
				);
				
				if(dirObj.isOpen)
					dirObj.scanEntries();
				this.directoryDisposables.set(dirObj, dirCD);
				this.disposables.add(dirCD);
				this.directories.set(dir, dirObj);
			}
		}
	}
	
	
	untrack(...directories){
		for(const dir of directories){
			const dirObj = this.directories.get(dir);
			if(undefined !== dirObj){
				dirObj.destroy();
				this.directories.delete(dir);
				
				const disposable = this.directoryDisposables.get(dirObj);
				disposable && disposable.dispose();
				this.disposables.remove(disposable);
				this.directoryDisposables.delete(disposable);
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
