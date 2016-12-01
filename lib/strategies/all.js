"use strict";

const {CompositeDisposable} = require("atom");
const Options = require("../options.js");

const strategies = {
	hashbangs: require("./by-hashbang.js"),
	modelines: require("./by-modeline.js"),
	pathname:  require("./by-path.js")
};
``

module.exports = {
	
	init(){
		this.directoryStrategies = [];
		this.fileStrategies      = [];
		this.disposables         = new CompositeDisposable();
		
		for(const name in strategies){
			const strategy = strategies[name];
			
			if(name in Options)
				this.disposables.add(Options.observe(name, enabled => {
					enabled ? strategy.init() : strategy.reset();
				}));
			
			else strategy.init();
			strategy.matchesFiles       && this.fileStrategies.push(strategy);
			strategy.matchesDirectories && this.directoryStrategies.push(strategy);
		}
		
		this.fileStrategies = this.fileStrategies.sort(this.sort);
		this.directoryStrategies = this.directoryStrategies.sort(this.sort);
	},
	
	
	reset(){
		for(const name in strategies)
			strategies[name].reset();
		this.disposables.dispose();
		this.disposables = null;
	},
	
	
	sort(a, b){
		if(a.priority < b.priority) return 1;
		if(a.priority > b.priority) return -1;
		return 0;
	},
	
	
	match(resource){
		if(resource.isDirectory){
			for(const strategy of this.directoryStrategies){
				if(!strategy.enabled) continue;
				const icon = strategy.matchDirectory(resource);
				if(icon) return icon;
			}
		}
		
		else{
			for(const strategy of this.fileStrategies){
				if(!strategy.enabled) continue;
				const icon = strategy.matchFile(resource);
				if(icon) return icon;
			}
		}
		
		return null;
	}
};
