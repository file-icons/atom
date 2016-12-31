"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const FileSystem   = require("../filesystem/filesystem.js");
const IconNode     = require("../service/icon-node.js");
const Options      = require("../options.js");


class Tab{
	
	constructor(element, editor){
		this.element  = element;
		this.editor   = editor;
		this.path     = editor.getPath();
		this.file     = FileSystem.get(this.path);
		element.itemTitle.classList.add("icon");
		this.iconNode = new IconNode(this.file, element.itemTitle);
		this.iconNode.setVisible(Options.tabPaneIcon);
		
		this.emitter = new Emitter();
		this.disposables = new CompositeDisposable(
			editor.onDidDestroy(_=> this.destroy()),
			Options.onDidChange("tabPaneIcon", show => this.iconNode.setVisible(show))
		);
	}
	
	
	destroy(){
		if(!this.destroyed){
			this.destroyed = true;
			this.iconNode.destroy();
			this.emitter.emit("did-destroy");
			this.emitter.dispose();
			this.emitter = null;
			this.disposables.dispose();
			this.disposables.clear();
			this.disposables = null;
			this.editor = null;
			this.element = null;
		}
	}
	
	
	onDidDestroy(fn){
		return this.emitter.on("did-destroy", fn);
	}
}


module.exports = Tab;
