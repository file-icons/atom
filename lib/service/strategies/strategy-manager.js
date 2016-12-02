"use strict";

const {CompositeDisposable} = require("atom");
const Options = require("../../options.js");


class StrategyManager{
	
	init(strategies){
		this.directoryStrategies = [];
		this.fileStrategies      = [];
		this.disposables         = new CompositeDisposable();
		
		for(const name in strategies)
			this.add(strategies[name], name);
		
		this.sort();
	}
	
	
	reset(){
		this.directoryStrategies.map(strategy => strategy.reset());
		this.fileStrategies.map(strategy => strategy.reset());
		this.disposables.dispose();
		this.disposables = null;
	}

	
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
	
	
	add(strategy, name){
		if(name in Options)
			this.disposables.add(Options.observe(name, enabled => {
				enabled ? strategy.init() : strategy.reset();
			}));
		
		else strategy.init();
		
		strategy.matchesFiles && this.fileStrategies.push(strategy);
		strategy.matchesDirs  && this.directoryStrategies.push(strategy);
	}
	
	
	sort(a, b){
		const byPriority = (a, b) => {
			if(a.priority < b.priority) return 1;
			if(a.priority > b.priority) return -1;
			return 0;
		};
		
		this.fileStrategies      = this.fileStrategies.sort(byPriority);
		this.directoryStrategies = this.directoryStrategies.sort(byPriority);
	}
}


module.exports = new StrategyManager();
