"use strict";

const {CompositeDisposable, Disposable} = require("atom");


class UI {
	
	constructor(){
		this.disposables = new CompositeDisposable();
		
		this.disposables.add(
			atom.themes.onDidChangeActiveThemes(_=> {
				this.fixOffset();
			})
		);
	}
	
	
	destroy(){
		if(!this.destroyed){
			this.disposables.dispose();
			this.disposables = null;
			this.destroyed = true;
		}
	}
	
	
	fixOffset(){
		const styles    = document.styleSheets;
		const numStyles = styles.length;
		
		for(let s = 0; s < numStyles; ++s){
			const rules    = styles[s].cssRules;
			const numRules = rules.length;
			
			for(let r = 0; r < numRules; ++r){
				const selector = ".list-group .icon::before, .list-tree .icon::before";
				const rule = rules[r];
				
				if(rule.selectorText === selector && rule.style.top){
					const offset = rule.style.top;
					rule.style.top = "";
					
					if(this.restoreOffset){
						this.restoreOffset.dispose();
						this.disposables.remove(this.restoreOffset);
					}
					
					this.restoreOffset = new Disposable(_=> rule.style.top = offset);
					this.disposables.add(this.restoreOffset);
					return;
				}
			}
		}
	}
}


module.exports = UI;
