"use strict";

const {CompositeDisposable} = require("atom");
const Tab = require("./tab.js");
const UI  = require("../ui.js");


class Tabs{
	
	init(){
		this.active = false;
		this.tabs = new Set();
		this.tabsByElement = new WeakMap();
		this.tabElements = document.getElementsByClassName("tab");
		
		setImmediate(_=> this.checkPackage());
		this.disposables = new CompositeDisposable(
			atom.packages.onDidActivatePackage(_=> this.checkPackage()),
			atom.packages.onDidDeactivatePackage(_=> this.checkPackage()),
			atom.packages.onDidActivateInitialPackages(_=> this.checkPackage()),
			
			UI.delay.onOpenEditor(editor => {
				const tabEl = this.tabForEditor(editor);
				this.add(tabEl);
			}),
			
			UI.delay.onSaveNewFile(args => {
				const tab = this.tabForEditor(args.editor);
				tab.updateIcon(); // TODO: Delete line once atom/tabs#397 is merged/shipped
				this.track(tab);
			})
		);
	}
	
	
	reset(){
		this.active = false;
		this.tabs.forEach(tab => this.remove(tab));
		this.tabs.clear();
		this.tabs = null;
		
		this.tabElements = null;
		this.tabsByElement = null;
		this.disposables.dispose();
		this.disposables = null;
	}
	
	
	/**
	 * Query the activation status of the Tabs package.
	 *
	 * @private
	 */
	checkPackage(){
		const tabsPackage = atom.packages.activePackages["tabs"];
		
		if(tabsPackage && !this.active){
			this.active = true;
			this.package = tabsPackage.mainModule;
			for(const bar of this.package.tabBarViews)
				for(const tab of bar.getTabs())
					this.add(tab);
		}
		
		else if(!tabsPackage && this.active){
			this.active = false;
			this.package = null;
			for(const tab of this.tabs)
				this.remove(tab);
		}
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
	
	
	/**
	 * Determine if an element should be used to register a {Tab} instance.
	 *
	 * @param {HTMLElement} element
	 * @return {Boolean}
	 */
	shouldAdd(element){
		return element
			&& !this.tabsByElement.has(element)
			&& atom.workspace.isTextEditor(element.item)
			&& undefined !== element.item.buffer.getPath();
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
			if(el.item === editor && "TextEditor" === el.dataset.type)
				return el;
		}
		return null;
	}
}


module.exports = new Tabs();
