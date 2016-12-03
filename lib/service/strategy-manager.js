"use strict";

const {CompositeDisposable} = require("atom");
const Options = require("../options.js");


class StrategyManager{
	
	init(strategies){
		this.fileStrategies = [];
		this.directoryStrategies = [];
		this.disposables = new CompositeDisposable();
		
		for(const strategy of strategies)
			this.addStrategy(strategy);
		
		this.fileStrategies = this.fileStrategies.filter(a => a).reverse();
		this.directoryStrategies = this.directoryStrategies.filter(a => a).reverse();
	}
	
	
	reset(){
		const strategies = new Set([
			...this.fileStrategies,
			...this.directoryStrategies
		]);
		
		strategies.forEach(strategy => strategy.disable());
	}
	
	
	addStrategy(strategy){
		const {priority} = strategy;
		if(strategy.matchesFiles) this.fileStrategies[priority] = strategy;
		if(strategy.matchesDirs)  this.directoryStrategies[priority] = strategy;
		
		if(strategy.name)
			this.disposables.add(Options.observe(strategy.name, enabled => {
				enabled ? strategy.enable() : strategy.disable();
			}));
		
		// Nameless strategies aren't cached or toggleable.
		else strategy.enable();
	}
	
	
	query(resource){
		const strategies = resource.isDirectory
			? this.directoryStrategies
			: this.fileStrategies;
		
		for(const strategy of strategies){
			if(!strategy.enabled) continue;
			const shouldStop = strategy.check(resource);
			if(shouldStop)
				break;
		}
	}
}

module.exports = new StrategyManager();
