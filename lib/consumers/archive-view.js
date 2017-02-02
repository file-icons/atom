"use strict";

const {normalisePath} = require("../utils/general.js");
const ArchiveEntry = require("./archive-entry.js");
const Consumer = require("./consumer.js");


class ArchiveView extends Consumer {
	
	constructor(){
		super("archive-view");
	}
	
	
	init(){
		super.init();
		this.entries    = new Set();
		this.entryNodes = new WeakMap();
		this.disposables.add(
			atom.workspace.onDidDestroyPaneItem(event => {
				if("ArchiveEditor" === event.item.constructor.name){
					const path = normalisePath(event.item.getPath());
					for(const entry of this.entries)
						if(path === entry.archivePath)
							entry.destroy();
				}
			})
		);
	}
	
	
	reset(){
		this.entries.forEach(entry => entry.destroy());
		this.entries.clear();
		super.reset();
		this.entries = null;
		this.entryNodes = null;
	}
	
	
	activate(){
		this.punchClass("lib/file-view", {
			initialize: (view, path, entry) => {
				const file = new ArchiveEntry(view, entry, path);
				file.onDidDestroy(() => {
					this.entries.delete(file);
					this.entryNodes.delete(view);
				});
				this.entries.add(file);
				this.entryNodes.set(view, file);
			}
		});
		
		this.punchClass("lib/directory-view", {
			initialize: (view, path, entry) => {
				const directory = new ArchiveEntry(view, entry, path, true);
				directory.onDidDestroy(() => {
					this.entries.delete(directory);
					this.entryNodes.delete(view);
				});
				this.entries.add(directory);
				this.entryNodes.set(view, directory);
			}
		});
	}
}


module.exports = new ArchiveView();
