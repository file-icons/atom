"use strict";

const {sep} = require("path");
const {normalisePath} = require("alhadis.utils");
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
		super.reset();
		this.entries = null;
		this.entryNodes = null;
	}
	
	
	resetNodes(){
		super.resetNodes();
		this.entries.forEach(entry => entry.destroy());
		this.entries.clear();
		this.entryNodes = new WeakMap();
	}
	
	
	activate(){
		const addFile = (...$) => this.addEntry(false, ...$);
		const addDir  = (...$) => this.addEntry(true,  ...$);
		
		this.punchClass("lib/file-view",      {initialize: addFile});
		this.punchClass("lib/directory-view", {initialize: addDir});
		
		const editorPrototype = this.packageModule.prototype;
		const usingLegacyCode = "function" === typeof editorPrototype.getViewClass;
		this.jQueryRemoved = !usingLegacyCode;
		
		if(this.jQueryRemoved){
			this.punchClass("lib/archive-editor-view", {
				createTreeEntries: this.parseEntries.bind(this)
			});
		}
	}
	
	
	addEntry(directory = false, ...args){
		const [view, path, source] = args;
		const entry = new ArchiveEntry(view, source, path, directory);
		entry.onDidDestroy(() => {
			this.entries.delete(entry);
			this.entryNodes.delete(view);
		});
		this.entries.add(entry);
		this.entryNodes.set(view, entry);
	}
	
	
	parseEntries(root, meta = []){
		const archivePath = root.path;
		meta = this.collect(meta, "children");
		meta = new Map(meta.map(e => [e.path, e]));
		const views = this.collect(root, "entries");
		for(const view of views){
			const {element} = view;
			if("DirectoryView" === view.constructor.name){
				const path = this.stitchPath(view);
				const source = meta.get(path);
				this.addEntry(true, element, archivePath, source);
			}
			else{
				const source = view.entry;
				const {path} = source;
				this.addEntry(false, element, archivePath, source);
			}
		}
	}
	
	
	collect(entries, key){
		const results = new Set();
		const history = new WeakSet();
		const recurse = entries => {
			for(const entry of entries){
				results.add(entry);
				const children = entry[key];
				if(Array.isArray(children) && !history.has(children)){
					history.add(children);
					recurse(children);
				}
			}
		};
		recurse(entries[key] || entries);
		return [...results];
	}
	
	
	stitchPath(entry){
		const entryClass = entry.constructor;
		const elements = [];
		let next = entry;
		while(next && entryClass === next.constructor){
			elements.push(next.element);
			next = next.parentView;
		}
		return elements
			.reverse()
			.map(el => el.firstElementChild.textContent)
			.join(sep);
	}
}


module.exports = new ArchiveView();
