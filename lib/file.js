"use strict";

const Atom = require("atom");
const {CompositeDisposable, Emitter} = Atom;


class File {
	
	constructor(path){
		this.path        = path;
		this.emitter     = new Emitter();
		this.events      = new Atom.File(path);
		this.disposables = new CompositeDisposable();
		
		this.disposables.add(
			this.events.onDidChange(_=> this.handleChange()),
			this.events.onDidRename(_=> this.updatePath()),
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
	
	onDidDestroy(fn){
		return this.emitter.on("did-destroy", fn);
	}
	
	
	handleChange(){
		
	}
	
	updatePath(){
		
	}
}


module.exports = File;
