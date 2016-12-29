"use strict";

const {CompositeDisposable} = require("atom");
const Options = require("../options.js");


class StrategyManager{
	
	init(){
		this.fileStrategies = [];
		this.directoryStrategies = [];
		this.disposables = new CompositeDisposable();
		
		const strategies = [
			require("./strategies/signature-strategy.js"),
			require("./strategies/hashbang-strategy.js"),
			require("./strategies/modeline-strategy.js"),
			require("./strategies/linguist-strategy.js"),
			require("./strategies/usertype-strategy.js"),
			require("./strategies/grammar-strategy.js"),
			require("./strategies/path-strategy.js"),
		];
		
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
		this.disposables.dispose();
		this.disposables = null;
	}
	
	
	addStrategy(strategy){
		const {priority} = strategy;
		if(strategy.matchesFiles) this.fileStrategies[priority] = strategy;
		if(strategy.matchesDirs)  this.directoryStrategies[priority] = strategy;
		
		if(!strategy.noSetting)
			this.disposables.add(Options.observe(strategy.name, enabled => {
				enabled ? strategy.enable() : strategy.disable();
			}));
		
		else if(strategy.name === "signature"){
			this.disposables.add(
				Options.observe("hashbangs", enabled => {
					enabled || Options.get("modelines")
						? strategy.enable()
						: strategy.disable();
				}),
				Options.observe("modelines", enabled => {
					enabled || Options.get("hashbangs")
						? strategy.enable()
						: strategy.disable();
				})
			);
		}
		
		// Strategies without settings are always active
		else strategy.enable();
	}
	
	
	query(resource){
		if(resource == null)
			return;
		
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
