"use strict";

const {CompositeDisposable} = require("atom");
const {EntityType, FileSystem} = require("atom-fs");
const StrategyManager = require("./strategy-manager.js");
const IconDelegate    = require("./icon-delegate.js");
const IconNode        = require("./icon-node.js");
const Storage         = require("../storage.js");


class IconService{
	
	init(){
		this.disposables = new CompositeDisposable();
		this.disposables.add(
			FileSystem.observe(this.handleResource.bind(this)),
			
			// #693: Notify `FileSystem` when files are deleted
			atom.project.onDidChangeFiles(events => {
				for(const {action, path} of events){
					if("deleted" === action && FileSystem.paths.has(path)){
						const resource = FileSystem.get(path);
						if(resource)
							resource.destroy();
						Storage.deletePath(path);
					}
				}
			}),
		);
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
				resource.onDidChangeRealPath(({to}) => {
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
		if(null !== module.exports.disposables)
			module.exports.disposables.add(disposable);
		return disposable;
	}
	
	
	suppressFOUC(){
		return {
			iconClassForPath(path){
				const file = FileSystem.get(path);
				return file && file.icon
					? file.icon.getClasses() || null
					: null;
			},
		};
	}
}

IconService.prototype.isReady = false;

module.exports = new IconService();
