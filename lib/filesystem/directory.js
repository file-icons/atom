"use strict";

const {dirname, join, resolve} = require("path");
const {lstat, statify, realpath} = require("../utils/fs.js");
const IconDelegate = require("../service/icon-delegate.js");
const EntityType = require("./entity-type.js");
const Resource = require("./resource.js");


class Directory extends Resource {
	
	constructor(path, stats){
		super(path, stats);
		path = this.realPath || this.path;
		
		// Root directory/Project folder
		for(const root of atom.project.rootDirectories)
			if(root && path === resolve(root.path)){
				this.isRoot = true;
				break;
			}
		
		// Git repo
		if(null !== this.repo){
			const {repo} = this.repo;
			if(repo.isWorkingDirectory(path))
				this.isRepository = true;
			
			// Submodule
			const submodule = repo.submoduleForPath(path) || null;
			if(null !== submodule){
				this.submodule = submodule;
				if(submodule.isWorkingDirectory(realpath(path)))
					this.isSubmodule = true;
			}
		}
	}
}


/**
 * Whether the directory represents the working directory of a {GitRepository}
 * @property {Boolean} isRepository
 */
Directory.prototype.isRepository = false;

/**
 * Whether the directory represents a submodule registered by the containing repository.
 * @property {Boolean} isSubmodule
 */
Directory.prototype.isSubmodule = false;

/**
 * Whether the directory is the root of an opened project.
 * @property {Boolean} isRoot
 */
Directory.prototype.isRoot = false;


Directory.prototype.isDirectory = true;
Directory.prototype.type = EntityType.DIRECTORY;
module.exports = Directory;
