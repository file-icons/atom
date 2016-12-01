"use strict";

const {CompositeDisposable, Disposable} = require("atom");
const FileRegistry = require("../file-registry.js");


class HeaderStrategy{
	
	init(){
		this.files = new Map();
		this.disposables = new CompositeDisposable(
			FileRegistry.observe(file => this.track(file))
		);
	}
	
	
	reset(){
		this.disposables.dispose();
		this.disposables.clear();
		this.disposables = null;
		this.files.clear();
		this.files = null;
	}
	
	
	track(file){
		if(file && !this.files.has(file)){
			const disposables = new CompositeDisposable(
				new Disposable(_=> this.untrack(file)),
				file.onDidDestroy(_=> this.untrack(file)),
				file.onDidChangeData(change => {
					const from = this.firstLine(change.from);
					const to   = this.firstLine(change.to || file.data);
					if(from !== to)
						return this.examine(file);
				})
			);
			this.files.set(file, disposables);
			
			if(null != file.data)
				this.examine(file);
		}
	}
	
	
	untrack(file){
		if(this.files && this.files.has(file)){
			const disposables = this.files.get(file);
			disposables.dispose();
			this.files.delete(file);
		}
	}
	
	
	examine(file){
		let icon = this.match(file.data);
		if(icon)
			file.setIcon(icon);
		return icon;
	}
	
	
	match(input){
		return null;
	}
	
	
	firstLine(text){
		return text ? text.split(/\r?\n/).shift() : "";
	}
}


HeaderStrategy.prototype.files = null;
HeaderStrategy.prototype.disposables = null;

module.exports = HeaderStrategy;
