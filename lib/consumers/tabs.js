"use strict";

const {CompositeDisposable} = require("atom");
const Consumer = require("./consumer.js");
const Tab      = require("./tab.js");
const UI       = require("../ui.js");


class Tabs extends Consumer {
	
	constructor(){
		super("tabs");
	}
	
	
	init(){
		super.init();
		this.tabs          = new Set();
		this.tabsByElement = new WeakMap();
		this.tabElements   = null;
	}
	
	
	activate(){
		const workspace = atom.views.getView(atom.workspace);
		this.tabElements = workspace.getElementsByClassName("tab");
		
		this.disposables.add(
			UI.delay.onOpenArchive(editor => {
				const tabEl = this.tabForEditor(editor);
				this.add(tabEl);
			}),
			
			UI.delay.onOpenEditor(editor => {
				const tabEl = this.tabForEditor(editor);
				this.add(tabEl);
			}),
			
			UI.delay.onSaveNewFile(args => {
				const tab = this.tabForEditor(args.editor);
				this.fixIcon(tab);
				this.add(tab);
			})
		);
		this.addCurrentTabs();
		
		// Project Plus has a "switch" feature that flips between workspaces
		// in the same window. Make sure Tabs are cleared when doing so.
		if(atom.packages.activePackages["project-plus"])
			try{
				const util = this.loadPackageFile("lib/util.js");
				this.punch(util, "switchToProject", oldFn => {
					this.resetNodes();
					const switchPromise = oldFn();
					switchPromise.then(() => this.addCurrentTabs());
					return switchPromise;
				});
			} catch(error){
				console.error("FILE-ICONS: Error patching tabs for project-plus", error);
			}
	}
	
	
	deactivate(){
		for(const tab of this.tabs)
			this.remove(tab);
	}
	
	
	reset(){
		this.resetNodes();
		super.reset();
		this.tabs = null;
		this.tabElements = null;
		this.tabsByElement = null;
	}
	
	
	resetNodes(){
		super.resetNodes();
		this.tabs.forEach(tab => this.remove(tab));
		this.tabs.clear();
	}
	
	
	add(tabElement){
		if(this.shouldAdd(tabElement)){
			const tab = new Tab(tabElement, tabElement.item);
			this.tabs.add(tab);
			this.tabsByElement.set(tabElement, tab);
			
			const disposable = tab.onDidDestroy(_=> {
				this.disposables.remove(disposable);
				disposable.dispose();
				this.remove(tabElement);
			});
			this.disposables.add(disposable);
		}
	}
	
	
	addCurrentTabs(){
		for(const bar of this.packageModule.tabBarViews)
			for(const tab of bar.getTabs())
				this.add(tab);
	}
	
	
	/**
	 * Determine if an element should be used to register a {Tab} instance.
	 *
	 * @param {HTMLElement} element
	 * @return {Boolean}
	 */
	shouldAdd(element){
		if(!element || this.tabsByElement.has(element))
			return false;
		
		const {item} = element;
		if(atom.workspace.isTextEditor(item) && undefined !== item.buffer.getPath())
			return true;
		
		if("ArchiveEditor" === item.constructor.name)
			return true;
		
		return false;
	}
	
	
	remove(tabElement){
		const tab = this.tabsByElement.get(tabElement);
		if(tab){
			this.tabs.delete(tab);
			this.tabsByElement.delete(tabElement);
			tab.destroy();
		}
	}
	
	
	tabForEditor(editor){
		const {length} = this.tabElements;
		for(let i = 0; i < length; ++i){
			const el = this.tabElements[i];
			if(el.item !== editor) continue;
			const {type} = el.dataset;
			if("TextEditor" === type || "ArchiveEditor" === type)
				return el;
		}
		return null;
	}
	
	
	fixIcon(tab){
		if(!tab) return;
		
		// TODO: Remove check/updateIcon() once atom/tabs#402 is public
		if("function" === typeof tab.updateIcon)
			tab.updateIcon();
		
		tab.itemTitle.classList.add("icon");
	}
	
	
	get length(){
		return this.tabs
			? this.tabs.size
			: 0;
	}
	
	
	closeAll(){
		const workspace = atom.views.getView(atom.workspace);
		atom.commands.dispatch(workspace, "tabs:close-all-tabs");
	}
}


module.exports = new Tabs();
