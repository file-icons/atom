"use strict";

const {CompositeDisposable, Disposable} = require("atom");
const {punch} = require("../utils.js");
const path = require("path");

const FileRegistry = require("../file-registry.js");
const IconDelegate = require("../icon-delegate.js");


class FindAndReplace{
	
	init(){
		this.active = false;
		this.delegates = new Set();
		
		setImmediate(_=> this.checkPackage());
		this.disposables = new CompositeDisposable(
			atom.packages.onDidActivatePackage(_=> this.checkPackage()),
			atom.packages.onDidDeactivatePackage(_=> this.checkPackage()),
			atom.packages.onDidActivateInitialPackages(_=> this.checkPackage())
		);
	}
	
	
	reset(){
		this.disposables.dispose();
		this.disposables = null;
		this.clearDelegates();
		this.package = null;
		this.active = false;
	}
	
	
	checkPackage(){
		const findPackage = atom.packages.activePackages["find-and-replace"];
		
		if(findPackage && !this.active){
			this.active = true;
			this.package = findPackage.mainModule;
			
			const reqPath     = path.join(findPackage.path, "lib", "project", "result-view");
			const ResultView  = require(reqPath);
			const {delegates} = this;
			this.punch(ResultView.prototype, "renderResult", function(oldFn){
				const result  = oldFn();
				const file    = FileRegistry.get(this.filePath);
				const icon    = new IconDelegate(file, this[0].querySelector(".icon"));
				delegates.add(icon);
				return result;
			});
		}
		
		else if(!findPackage && this.active){
			this.active = false;
			this.package = null;
			this.clearDelegates();
		}
	}
	
	
	clearDelegates(){
		this.delegates.forEach(delegate => delegate.destroy());
		this.delegates.clear();
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
}


module.exports = new FindAndReplace();
