"use strict";

const {CompositeDisposable, Disposable, Emitter} = require("atom");
const FileRegistry = require("../file-registry.js");
const IconNode = require("../icon-node.js");
const {punch} = require("../utils.js");


class FuzzyFinder{
	
	init(){
		this.active      = false;
		this.lists       = new Map();
		this.emitter     = new Emitter();
		this.timeouts    = new WeakMap();
		this.iconNodes   = new Set();
		
		setImmediate(_=> this.checkPackage());
		this.disposables = new CompositeDisposable(
			atom.packages.onDidActivatePackage(_=> this.checkPackage()),
			atom.packages.onDidDeactivatePackage(_=> this.checkPackage()),
			atom.packages.onDidActivateInitialPackages(_=> this.checkPackage()),
			this.onViewCreated(args => this.trackList(args))
		);
	}
	
	
	reset(){
		this.resetNodes();
		this.lists.clear();
		this.lists = null;
		this.disposables.dispose();
		this.disposables = null;
		this.iconNodes = null;
		this.timeouts = null;
		this.emitter.dispose();
		this.emitter = null;
		this.package = null;
		this.active = false;
	}
	
	
	resetNodes(){
		this.iconNodes.forEach(node => node.destroy());
		this.iconNodes.clear();
	}
	
	
	onViewCreated(fn){
		return this.emitter.on("view-created", fn);
	}
	
	
	checkPackage(){
		const fuzzPackage = atom.packages.activePackages["fuzzy-finder"];
		
		if(fuzzPackage && !this.active){
			this.active = true;
			this.package = fuzzPackage.mainModule;
			
			for(const type of ["Project", "Buffer", "GitStatus"])
				this.punch(this.package, `create${type}View`, fn => {
					const view = fn();
					this.emitter.emit("view-created", {view, type});
					return view;
				});
		}
		
		else if(!fuzzPackage && this.active){
			this.active = false;
			this.package = null;
			this.punchedMethods.dispose();
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
	
	
	trackList(args){
		const {view, type} = args;
		
		if(!this.lists.has(view)){
			this.punch(view, "viewForItem", oldFn => {
				this.refresh(view);
				return oldFn();
			});
			
			const disposables = new CompositeDisposable();
			this.lists.set(view, disposables);
		}
	}
	
	
	refresh(view){
		if(this.timeouts.get(view))
			return;
		
		this.timeouts.set(view, setTimeout(_=> {
			this.timeouts.delete(view);
			this.resetNodes();
			
			const paths = {};
			view.items.map(item => {
				const {filePath, projectRelativePath} = item;
				paths[projectRelativePath] = filePath;
			});
			
			const items = Array.from(view.list[0].children);
			for(const item of items){
				const pathEl = item.querySelector(".primary-line.file");
				const path = paths[pathEl.dataset.path];
				const file = FileRegistry.get(path);
				this.iconNodes.add(new IconNode(file, pathEl));
			}
		}, 20));
	}
}


module.exports = new FuzzyFinder();
