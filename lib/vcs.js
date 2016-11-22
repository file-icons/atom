"use strict";

const path = require("path");
const {CompositeDisposable} = require("atom");
const FileRegistry = require("./file-registry.js");


class VCS{
	
	init(){
		this.repositories = new Map();
		this.disposables = new CompositeDisposable(
			atom.project.onDidChangePaths(_=> this.checkRepos())
		);
		this.checkRepos();
	}
	
	
	reset(){
		this.disposables.dispose();
		this.disposables = null;
	}
	
	
	checkRepos(){
		const {repositories} = atom.project;
		repositories.map(repo => this.track(repo));
		
		// Stop tracking removed repos
		for(const [repo] of this.repositories){
			if(repositories.indexOf(repo) === -1)
				this.untrack(repo);
		}
	}
	
	
	track(repo){
		if(repo && !this.repositories.has(repo)){
			this.repositories.set(repo, new CompositeDisposable(
				repo.onDidDestroy(_=> this.untrack(repo)),
				repo.onDidChangeStatus(changed => {
					const {path, pathStatus} = changed;
					this.setStatus(path, pathStatus, repo);
				})
			));

			// HACK: Can't read file statuses at startup; no apparent
			// event dispatched when data becomes available.
			const basePath = repo.getWorkingDirectory();
			repo.statusTask.on("task:completed", ({statuses}) => {
				for(const relPath in statuses){
					const status = statuses[relPath];
					const absPath = path.join(basePath, relPath);
					this.setStatus(absPath, status, repo);
				}
			});
		}
	}
	
	
	untrack(repo){
		const disposable = this.repositories.get(repo);
		if(!disposable){
			disposable.dispose();
			this.repositories.delete(repo);
		}
	}
	
	
	setStatus(path, status, repo){
		const file = FileRegistry.get(path);
		const name = this.getStatusName(status, repo);
		file.setVCSStatus(name);
	}
	
	
	getStatusName(status, repo){
		if(!status)
			return null;
		if(repo.isStatusModified(status))
			return "modified";
		if(repo.isStatusNew(status))
			return "added";
		return null;
	}
}


module.exports = new VCS();
