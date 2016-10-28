"use strict";

const Atom = require("atom");
const {CompositeDisposable, Emitter} = Atom;
const {basename} = require("path");

const IconRegistry = require("./icon-registry.js");


class File {
	
	constructor(path){
		this.setPath(path);
		this.editors     = new Map();
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
	
	
	/**
	 * Link the {TextEditor} instance this file's opened in.
	 *
	 * Used for eliminating excess system calls when changes are detected.
	 *
	 * @param {TextEditor} input
	 */
	linkEditor(input){
		if(input){
			const disposables = new CompositeDisposable();
			disposables.add(input.onDidDestroy(_=> this.unlinkEditor(input)));
			this.editors.set(input, disposables);
			this.hasEditor = true;
		}
	}
	
	
	/**
	 * Sever the file's link with an editor. Called when an editor's closed.
	 *
	 * @param {TextEditor} input
	 */
	unlinkEditor(input){
		if(input){
			const disposables = this.editors.get(input);
			disposables && disposables.dispose();
			this.editors.delete(input);
			this.hasEditor = !!this.editors.size;
		}
	}
	
	
	/**
	 * Return the first editor instance this file's linked with.
	 *
	 * @return {TextEditor}
	 */
	getEditor(){
		if(!this.hasEditor) return null;
		const {value} = this.editors.keys().next();
		return value;
	}
	
	
	/**
	 * Load the file's contents.
	 *
	 * @return {Promise}
	 */
	getContents(){
		return new Promise(resolve => {
			const editor = this.getEditor();
			if(editor){
				resolve({
					//data: editor.
				})
			}
		});
	}
	
	
	handleChange(){
		this.getContents().then(data => {
			console.log("And the contents are...");
			console.log(data);
		});
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
