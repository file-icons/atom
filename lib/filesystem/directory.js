"use strict";

const {realpath} = require("../utils/fs.js");
const {normalisePath} = require("../utils/general.js");
const IconDelegate = require("../service/icon-delegate.js");
const EntityType = require("./entity-type.js");
const Resource = require("./resource.js");


class Directory extends Resource {
	
	constructor(path, stats){
		super(path, stats);
		path = this.realPath || this.path;
		
		// Root directory/Project folder
		for(const root of atom.project.rootDirectories)
			if(root && path === normalisePath(root.path)){
				this.isRoot = true;
				break;
			}
		
		// VCS repo
		if(null !== this.repo){
			this.repoType = this.repo.getType();
			
			switch(this.repoType){
				case "git": {
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
					break;
				}
				
				case "svn": {
					const svnPath = normalisePath(this.repo.workingDirectory);
					if(path === svnPath)
						this.isRepository = true;
					break;
				}
				
				default: {
					const {logInfo} = require("../utils/dev.js");
					const {path, repo, repoType} = this;
					logInfo({title: "Unknown VCS", path, repo, repoType});
				}
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
