"use strict";

const {CompositeDisposable, Disposable} = require("atom");
const {punch} = require("../utils/general.js");
const path = require("path");

const UI = require("../ui.js");
const ArchiveEntry = require("./archive-entry.js");


class ArchiveView{
	
	init(){
		this.active     = false;
		this.entries    = new Set();
		this.entryNodes = new WeakMap();
		
		setImmediate(() => this.checkPackage());
		this.disposables = new CompositeDisposable(
			atom.packages.onDidActivatePackage(_=> this.checkPackage()),
			atom.packages.onDidDeactivatePackage(_=> this.checkPackage()),
			atom.packages.onDidActivateInitialPackages(_=> this.checkPackage()),
			atom.workspace.onDidDestroyPaneItem(event => {
				if("ArchiveEditor" === event.item.constructor.name){
					const path = event.item.getPath();
					for(const entry of this.entries)
						if(path === entry.archivePath)
							entry.destroy();
				}
			})
		);
	}
	
	
	reset(){
		this.entries.forEach(entry => entry.destroy());
		this.entries.clear();
		this.entries = null;
		this.entryNodes = null;
		this.disposables.dispose();
		this.disposables = null;
		this.package = null;
		this.active = false;
	}
	
	
	checkPackage(){
		const archivePackage = atom.packages.activePackages["archive-view"];
		
		if(archivePackage && !this.active){
			this.active = true;
			this.package = archivePackage.mainModule;
			this.packagePath = archivePackage.path;
			
			this.punchClass("file-view", {
				initialize: (view, path, entry) => {
					const file = new ArchiveEntry(view, entry, path);
					file.onDidDestroy(() => {
						this.entries.delete(file);
						this.entryNodes.delete(view);
					});
					this.entries.add(file);
					this.entryNodes.set(view, file);
				}
			});
			
			this.punchClass("directory-view", {
				initialize: (view, path, entry) => {
					const directory = new ArchiveEntry(view, entry, path, true);
					directory.onDidDestroy(() => {
						this.entries.delete(directory);
						this.entryNodes.delete(view);
					});
					this.entries.add(directory);
					this.entryNodes.set(view, directory);
				}
			});
		}
		
		else if(!archivePackage && this.active){
			this.active = false;
			this.package = null;
			this.packagePath = null;
		}
	}
	

	punch(object, method, fn){
		if(!this.punchedMethods){
			this.punchedMethods = new CompositeDisposable(
				new Disposable(_=> this.punchedMethods = null)
			);
			this.disposables.add(this.punchedMethods);
		}
		
		const [originalMethod] = punch(object, method, fn);
		this.punchedMethods.add(new Disposable(_=> {
			object[method] = originalMethod;
		}));
	}
	
	
	punchClass(name, methods){
		const classPath = path.join(this.packagePath, "lib", name);
		const viewClass = require(classPath);
		
		for(const name in methods){
			const handler = methods[name];
			this.punch(viewClass.prototype, name, function(oldFn, args){
				const result = oldFn();
				handler(this, ...args);
				return result;
			})
		}
	}
}


module.exports = new ArchiveView();
