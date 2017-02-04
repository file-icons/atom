"use strict";

const {CompositeDisposable, Disposable, Emitter} = require("atom");
const {lstat, realpath, statify} = require("../utils/fs.js");
const {isRegExp, normalisePath} = require("../utils/general.js");
const Storage       = require("../storage.js");
const UI            = require("../ui.js");
const Directory     = require("./directory.js");
const EntityType    = require("./entity-type.js");
const File          = require("./file.js");


class FileSystem {
	
	init(){
		this.paths = new Map();
		this.inodes = new Map();
		this.emitter = new Emitter();
		
		this.disposables = new CompositeDisposable(
			UI.onSaveNewFile(args => this.get(args.file).addEditor(args.editor)),
			UI.onOpenFile(editor => {
				const path = editor.getPath();
				let entity = this.get(path);
				
				if("function" !== typeof entity.addEditor){
					this.paths.delete(path);
					entity = this.get(path);
				}
				
				entity.addEditor(editor);
			})
		);
	}
	
	
	reset(){
		this.disposables.dispose();
		this.emitter.dispose();
		this.paths.forEach(path => path.destroy());
		this.inodes.clear();
		this.inodes = new Map();
		this.paths = new Map();
		this.emitter = new Emitter();
		this.disposables = new CompositeDisposable();
	}
	
	
	/**
	 * Return a {Resource} for the designated path.
	 *
	 * Paths are not required to point to accessible resources. Entities
	 * which can't be lstat are simply marked unreadable. This behaviour
	 * can be disabled for nonexistent resources by passing `mustExist`.
	 *
	 * @param {String} path
	 *    Absolute pathname.
	 *
	 * @param {Boolean} [mustExist=false]
	 *    Return null on ENOENT.
	 *
	 * @param {EntityType} [typeHint=EntityType.FILE]
	 *    Resource type to assume for unreadable or remote paths.
	 *    Ignored if `mustExist` is given a truthy value.
	 *
	 * @returns {Resource}
	 * @emits did-register
	 */
	get(path, mustExist = false, typeHint = EntityType.FILE){
		const resource = this.paths.get(path);
		
		if(resource)
			return resource;
		
		else{
			lstat.lastError = null;
			const stats = lstat(path);
			const inode = stats ? stats.ino : null;
			
			// Return null for nonexistent entities if `mustExist` is truthy
			if(mustExist && lstat.lastError && "ENOENT" === lstat.lastError.code)
				return null;
			
			if(inode){
				// Don't reregister an entity after it's been moved
				if(stats.nlink < 2 && this.inodes.has(inode)){
					const resource = this.inodes.get(inode);
					resource.setPath(path);
					return resource;
				}
				else Storage.setPathInode(normalisePath(path), inode);
			}
			
			const {
				isSymlink,
				isDirectory,
				realPath
			} = this.resolveType(path, stats || typeHint);
			
			if(stats && isSymlink)
				stats.mode |= EntityType.SYMLINK;
			
			const resource = isDirectory
				? new Directory(path, stats)
				: new File(path, stats);
			
			this.paths.set(path, resource);
			inode && this.inodes.set(inode, resource);
			
			const disposables = new CompositeDisposable(
				resource.onDidDestroy(() => disposables.dispose()),
				resource.onDidMove(paths => this.fixPath(paths.from, paths.to)),
				resource.onDidChangeRealPath(path => this.fixSymlink(resource, path.to)),
				new Disposable(() => {
					this.paths.delete(resource.path);
					this.paths.delete(resource.path.replace(/\//g, "\\"));
					if(inode && resource.stats.nlink < 2)
						this.inodes.delete(inode);
				})
			);
			
			this.emitter.emit("did-register", resource);
			realPath && resource.setRealPath(realPath);
			return resource;
		}
	}
	
	
	resolveType(path, stats){
		const type = {
			isSymlink:   false,
			isDirectory: false,
			realPath:    null
		};
		
		if(!stats) return type;
		if("number" === typeof stats)
			stats = statify({mode: stats});
		
		type.isDirectory = stats.isDirectory();
		
		if(stats.isSymbolicLink()){
			type.isSymlink = true;
			type.realPath = realpath(path);
			
			if(type.realPath){
				const stats = lstat(type.realPath);
				type.isDirectory = stats && stats.isDirectory();
			}
		}
		
		return type;
	}
	
	
	fixPath(oldPath, newPath){
		if(!oldPath || !newPath) return;
		const resource = this.paths.get(oldPath);
		
		if(resource && resource.path !== newPath)
			resource.setPath(newPath);
		
		else{
			this.paths.delete(oldPath);
			this.paths.set(newPath, resource);
		}
	}
	
	
	fixSymlink(link, targetPath){
		const target = this.get(targetPath);
		link.icon.master = target.icon;
	}


	/**
	 * Register a callback to fire for each current and future resource.
	 *
	 * @param {Function} fn - Callback receiving the registered resource
	 * @return {Disposable}
	 */
	observe(fn){
		const output = this.emitter.on("did-register", fn);
		this.paths.forEach(resource => {
			this.emitter.emit("did-register", resource);
		});
		return output;
	}
	
	
	/**
	 * Retrieve a list of registered {Resources} whose paths match a pattern.
	 *
	 * No system paths are searched; this method only exists to assist debugging.
	 * @param {String|RegExp} pattern
	 * @return {Resource[]}
	 */
	grep(pattern){
		if(!pattern) return [];
		
		if(!isRegExp(pattern)){
			pattern = (pattern + "")
				.split(/[\\\/]+/g)
				.map(s => s.replace(/[/\\^$*+?{}\[\]().|]/g, "\\$&"))
				.join("[\\\\\\/]") + "$";
			pattern = new RegExp(pattern, "i");
		}
		
		const results = [];
		for(const [path, resource] of this.paths)
			pattern.test(path) && results.push(resource);
		return results;
	}
}



module.exports = new FileSystem();
