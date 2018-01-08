"use strict";

const {CompositeDisposable, Disposable} = require("atom");
const {EntityType, FileSystem} = require("atom-fs");
const StrategyManager = require("./strategy-manager.js");
const IconTables      = require("../icons/icon-tables.js");
const IconDelegate    = require("./icon-delegate.js");
const IconNode        = require("./icon-node.js");
const Storage         = require("../storage.js");


class IconService{
	
	init(paths){
		this.disposables = new CompositeDisposable();
		this.disposables.add(FileSystem.observe(this.handleResource.bind(this)));

		// Get notified when a file is deleted and let `FileSystem` know - see #693
		this.disposables.add(atom.project.onDidChangeFiles(events => {
			for(const event of events) {
				if("deleted" === event.action) {
					const resource = FileSystem.get(event.path);
					if(resource) resource.destroy();
				}
			}
		}));
		StrategyManager.init();
		this.isReady = true;
	}
	
	
	reset(){
		this.disposables.dispose();
		this.disposables.clear();
		this.disposables = null;
		
		StrategyManager.reset();
		this.isReady = false;
	}
	
	
	/**
	 * Handle a newly-registered filesystem resource.
	 *
	 * @param {Resource} resource
	 * @private
	 */
	handleResource(resource){
		if(resource.icon) return;
		
		const icon = new IconDelegate(resource);
		resource.icon = icon;
		this.disposables.add(
			resource.onDidDestroy(() => {
				icon.destroy();
				resource.icon = null;
			})
		);
		
		// TODO: Add `.inode` property to Resource class
		if(resource.stats && resource.stats.ino){
			const inode = resource.stats.ino;
			Storage.setPathInode(resource.path, inode);
		}
		
		if(resource.type & EntityType.SYMLINK)
			this.disposables.add(
				resource.onDidChangeRealPath(({from, to}) => {
					const target = FileSystem.get(to);
					icon.master = target.icon;
				})
			);
	}
	
	
	addIconToElement(element, path, options = {}){
		const {
			isDirectory,
			isSymlink,
			isTabIcon,
		} = options;
		
		let type = isDirectory
			? EntityType.DIRECTORY
			: EntityType.FILE;
		
		if(isSymlink)
			type |= EntityType.SYMLINK;
		
		const disposable = IconNode.forElement(element, path, type, isTabIcon);
		module.exports.disposables.add(disposable);
		return disposable;
	}
	
	
	suppressFOUC(){
		return {
			iconClassForPath(path, context = ""){
				const file = FileSystem.get(path);
				
				// HACK: Fix #550 by ignoring old icon-service if consumed by Tabs
				// package, and the user disabled tab-icons. This can be deleted if
				// atom/tabs#412 is accepted by the Atom team. Since (we hope) this
				// code-block to be shortlived, we're being sloppy by not bothering
				// to `require` the Options class beforehand.
				if("tabs" === context && !atom.config.get("file-icons.tabPaneIcon"))
					return null;
				
				return file && file.icon
					? file.icon.getClasses() || null
					: null;
			},
			
			onWillDeactivate(){
				return new Disposable();
			}
		}
	}
}

IconService.prototype.isReady = false;

module.exports = new IconService();
