"use strict";

const {dirname, join, resolve} = require("path");


/**
 * An object containing submodule-specific metadata.
 *
 * @property {GitRepository} repo - Reference to the repository the submodule is registered to
 * @property {Object}      source - Reference to the submodule object stored in repo's `.submodules` property
 * @property {String}   localPath - Path of registered submodule, relative to repo's working directory
 * @property {String}        path - Absolute path of submodule folder
 * @see {@link Resource#getSubmodule}
 * @class
 */
class SubmoduleInfo{
	
	/**
	 * Create a new submodule-info blob.
	 *
	 * NOTE: Instances shouldn't be created directly; use {@link SubmoduleInfo.forPath} instead.
	 *
	 * @param {GitRepository} repo - Owner repository
	 * @param {String} localPath - Project-relative path of submodule folder
	 * @constructor
	 */
	constructor(repo, localPath){
		this.repo = repo;
		this.source = repo.submodules[localPath];
		this.localPath = localPath;
		this.path = join(Submodule.getRepoPath(repo), localPath);
	}
	
	
	/**
	 * Return info for the submodule enclosing a path, if any.
	 *
	 * @param {String} path - Absolute pathname
	 * @return {SubmoduleInfo}
	 * @static
	 */
	static forPath(path){
		if(!path) return null;
		for(const repo of atom.project.repositories){
			if(!repo) continue;
			
			const submodules = Object.keys(repo.submodules || {});
			if(!submodules.length)
				continue;
			
			const repoPath = SubmoduleInfo.getRepoPath(repo);
			for(const submodule of submodules){
				const modulePath = join(repoPath, submodule);
				if(modulePath === path)
					return new SubmoduleInfo(repo, submodule);
			}
		}
		return null;
	}

	
	/**
	 * Return the resolved, absolute path of a repository's working directory.
	 *
	 * @param {GitRepository} repo
	 * @return {String}
	 */
	static getRepoPath(repo){
		return dirname(resolve(repo.path));
	}
}


module.exports = SubmoduleInfo;
