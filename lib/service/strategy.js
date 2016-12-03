"use strict";

const {CompositeDisposable, Disposable} = require("atom");
const {getFirstLine} = require("../utils.js");


class Strategy{
	
	constructor(opts = {}){
		const {
			name          = "",
			priority      = 0,
			matchesFiles  = true,
			matchesDirs   = false,
			usesFileData  = false
		} = opts;
		
		this.name         = name || "";
		this.priority     = +priority || 0;
		this.matchesFiles = !!matchesFiles;
		this.matchesDirs  = !!matchesDirs;
		this.usesFileData = !!usesFileData;
	}
	
	
	enable(){
		if(this.enabled) return;
		this.resources = new Map();
		this.enabled = true;
	}
	
	
	disable(){
		if(!this.enabled) return;
		this.resources.clear();
		this.resources = null;
		this.enabled = false;
	}
	
	
	check(resource, useExisting = true){
		if(useExisting && this.resources.get(resource))
			return false;
		
		else{
			if(this.usesFileData)
				this.trackDataChanges(resource);
			
			let icon = this.matchIcon(resource);
			
			if(icon){
				this.resources.set(resource, icon);
				resource.icon.add(icon, this.priority);
				return true;
			}
			else{
				icon = this.resources.get(resource);
				resource.icon.remove(icon, this.priority);
				this.resources.set(resource, null);
				return false;
			}
		}
	}
	
	
	
	trackDataChanges(resource, firstLineOnly = true){
		if(this.resources.has(resource))
			return;
		
		const disposables = new CompositeDisposable(
			resource.onDidDestroy(() => disposables.dispose()),
			resource.onDidChangeData(change => {
				let {from, to} = change;
				
				if(firstLineOnly){
					from = getFirstLine(from);
					to   = getFirstLine(to);
				}
				
				if(from !== to)
					this.check(resource, false);
			})
		);
	}
	
	
	/**
	 * Retrieve an {@link Icon} for a resource.
	 *
	 * @param {Resource} resource
	 * @return {Icon}
	 * @abstract
	 */
	matchIcon(resource){
		return null;
	}
}


Strategy.prototype.enabled = null;
Strategy.prototype.resources = null;

module.exports = Strategy;
