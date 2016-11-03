"use strict";

const {CompositeDisposable} = require("atom");
const FileRegistry = require("../file-registry.js");
const IconDelegate = require("../icon-delegate.js");
const Options      = require("../options.js");
const UI           = require("../ui.js");


class Tabs{
	
	init(){
		this.active = false;
		this.delegates = new Map();
		this.disposables = new CompositeDisposable(
			atom.packages.onDidActivatePackage(_=> this.checkPackage()),
			atom.packages.onDidDeactivatePackage(_=> this.checkPackage()),
			atom.packages.onDidActivateInitialPackages(_=> this.checkPackage()),
			Options.onDidChange("tabPaneIcon", enabled => {
				this.delegates.forEach((_, icon) => icon.setVisible(enabled));
			}),
			UI.onOpenEditor(editor => {
				if(this.active){
					setImmediate(_=> this.track(this.getItemTab(editor)));
				}
			})
		);
	}
	
	
	reset(){
		this.disposables.dispose();
		this.disposables = null;
		this.delegates.clear();
		this.delegates = null;
		this.tabBars = null;
	}
	
	
	checkPackage(){
		const tabsPackage = atom.packages.activePackages["tabs"];
		
		if(tabsPackage && !this.active){
			const {tabBarViews} = tabsPackage.mainModule;
			this.tabBars = tabBarViews;
			this.active = true;
			this.track(...this.getTabs());
		}
		
		else if(!tabsPackage && this.active){
			this.untrack(...this.getTabs());
			this.tabBars = null;
			this.active = false;
		}
	}
	
	
	track(...tabs){
		for(const tab of tabs){
			if(!this.delegates.has(tab)){
				const file = this.getTabFile(tab);
				
				if(file){
					const tabIcon = new IconDelegate(file, tab.itemTitle);
					const disposables = new CompositeDisposable();
					disposables.add(
						tab.item.onDidDestroy(_=> this.untrack(tab))
					);
					
					tabIcon.setVisible(Options.tabPaneIcon);
					this.delegates.set(tabIcon, disposables);
					this.disposables.add(disposables);
				}
			}
		}
	}
	
	
	untrack(...tabs){
		for(const tab of tabs){
			const tabIcon = this.delegates.get(tab);
			
			if(undefined !== tabIcon){
				this.delegates.delete(tab);
				tabIcon.destroy();
			}
		}
	}
	
	
	getTabFile(tab){
		if(!atom.workspace.isTextEditor(tab.item))
			return null;

		const name = tab.item.getFileName();
		return name ? FileRegistry.get(name) : null;
	}
	
	
	getTabs(){
		const tabs = [];
		for(const bar of this.tabBars)
			for(const tab of bar.getTabs())
				tabs.push(tab);
		return tabs;
	}
	
	
	getItemTab(item){
		return this.getTabs().filter(tab => tab.item === item)[0] || null;
	}
}


module.exports = new Tabs();
