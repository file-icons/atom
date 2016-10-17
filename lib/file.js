"use strict";

const Atom = require("atom");
const {CompositeDisposable, Emitter} = Atom;
const {basename} = require("path");

const IconRegistry = require("./icon-registry.js");


class File {
	
	constructor(path){
		this.setPath(path);
		this.emitter     = new Emitter();
		this.events      = new Atom.File(path);
		this.disposables = new CompositeDisposable();
		
		this.disposables.add(
			this.events.onDidChange(_=> this.handleChange()),
			this.events.onDidRename(_=> this.handleMove()),
			this.events.onDidDelete(_=> this.destroy()),
			this.events.onWillThrowWatchError(_=> this.destroy())
		);
	}
	
	destroy(){
		if(!this.destroyed){
			this.disposables.dispose();
			this.disposables = null;
			this.destroyed = true;
			this.emitter.emit("did-destroy");
			this.emitter.dispose();
			this.emitter = null;
			this.events = null;
		}
	}
	
	
	getIcon(){
		if(this.icon)
			return this.icon;
		
		else{
			for(const icon of IconRegistry.fileIcons){
				if(icon.match.test(this.name)){
					this.icon = icon;
					return icon;
				}
			}
			return null;
		}
	}
	
	
	setPath(input){
		this.path = input;
		this.name = basename(input);
		// TODO: Include physical path if File is a symlink
	}
	
	
	handleChange(){
		
	}
	
	
	handleMove(){
		const from = this.path;
		const to = this.events.getPath();
		
		if(from !== to){
			this.setPath(to);
			this.emitter.emit("did-move", {from, to});
		}
	}
	
	
	onDidDestroy(fn){
		return this.emitter.on("did-destroy", fn);
	}
	
	onDidMove(fn){
		return this.emitter.on("did-move", fn);
	}
}


module.exports = File;
