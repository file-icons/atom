"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const FileRegistry = require("./file-registry.js");


class TreeView{
	
	init(){
		this.disposables = new CompositeDisposable();
		this.emitter = new Emitter();
		
		this.checkPanes();
		this.disposables.add(
			atom.packages.onDidActivatePackage(_=> this.checkPanes()),
			atom.packages.onDidDeactivatePackage(_=> this.checkPanes()),
			atom.packages.onDidActivateInitialPackages(_=> this.checkPanes()),
			
			this.onDidAttach(_=> {
				const onMove = this.element.onEntryMoved(paths => {
					const from = paths.oldPath;
					const to   = paths.newPath;
					const file = FileRegistry.filesByPath[from];
					FileRegistry.updatePath(file, {from, to});
				});
				this.disposables.add(onMove);
			})
		);
	}
	
	
	reset(){
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
}


module.exports = new TreeView();
