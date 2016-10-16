"use strict";

const Atom = require("atom");
const {CompositeDisposable} = Atom;


class File {
	
	constructor(path){
		this.path        = path;
		this.events      = new Atom.File(path);
		this.disposables = new CompositeDisposable();
		
		const handlers = {
			onDidChange: _=> this.onChanged(),
			onDidRename: _=> this.onRenamed(),
			onDidDelete: _=> this.onDeleted()
		};
		
		for(const key in handlers){
			const disp = this.events[key](handlers[key]);
			this.disposables.add(disp);
		}
	}
	
	destroy(){
		this.disposables.dispose();
		this.disposables = null;
		this.destroyed = true;
	}
	
	onChanged(){
		
	}
	
	onRenamed(){
		
	}
	
	onDeleted(){
		
	}
}


module.exports = File;
