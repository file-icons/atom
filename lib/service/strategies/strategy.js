"use strict";

const {CompositeDisposable, Disposable} = require("atom");
const IconService = require.resolve("../icon-service.js");


class Strategy{
	
	constructor(args = {}){
		const {
			priority     = 0,
			matchesFiles = true,
			matchesDirs  = false
		} = args;
		
		this.priority     = priority;
		this.matchesFiles = matchesFiles;
		this.matchesDirs  = matchesDirs;
	}
	
	
	init(){
		this.enabled = true;
		this.resources = new Map();
		this.disposables = new CompositeDisposable();
	}
	
	
	reset(){
		this.enabled = false;
		
		if(this.disposables){
			this.disposables.dispose();
			this.disposables.clear();
			this.disposables = null;
		}
		
		if(this.resources){
			this.resources.clear();
			this.resources = null;
		}
	}
	
	
	track(resource){
		if(resource && !this.resources.has(resource)){
			const disposables = new CompositeDisposable(
				new Disposable(_=> this.untrack(resource)),
				resource.onDidDestroy(_=> this.untrack(resource))
			);
			this.resources.set(resource, disposables);
			this.configureResource(resource, disposables);
		}
	}
	
	
	untrack(resource){
		if(this.resources && this.resources.has(resource)){
			const disposables = this.resources.get(resource);
			disposables.dispose();
			this.resources.delete(resource);
		}
	}
	
	
	addIcon(file, icon){
		const delegate = require(IconService).getDelegate(file);
		delegate.setIcon(icon);
	}
	
	
	configureResource(){ }
	
	
	matchFile(){
		return null;
	}
	
	
	matchDirectory(){
		return null;
	}
}

Strategy.prototype.enabled = false;
Strategy.prototype.priority = 0;
Strategy.prototype.resources = null;
Strategy.prototype.disposables = null;

module.exports = Strategy;
