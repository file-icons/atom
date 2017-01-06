"use strict";

const {dirname, join, resolve} = require("path");
const {lstat, statify} = require("../utils/fs.js");
const IconDelegate = require("../service/icon-delegate.js");
const EntityType = require("./entity-type.js");
const Resource = require("./resource.js");


class Directory extends Resource {
	
	constructor(path, stats){
		super(path, stats);
		
		// Git repo
		if(null !== this.repo){
			this.repoPath = this.repo.getWorkingDirectory();
			if(this.path === this.repoPath)
				this.isRepository = true;
		}
		
		// Submodule
		if(null !== this.submodule && this.submodule.path === this.path)
			this.isSubmodule = true;
	}
	
	
	/**
	 * Determine if the {Directory} is the root of an opened project.
	 *
	 * @return {Boolean}
	 */
	isProjectDirectory(){
		const {path} = this;
		for(const dir of atom.project.rootDirectories)
			if(dir && path === resolve(dir.path))
				return true;
		return false;
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
 * Absolute path of the directory's containing repository, if one exists.
 * @property {String} repoPath
 */
Directory.prototype.repoPath = "";


Directory.prototype.isDirectory = true;
module.exports = Directory;
