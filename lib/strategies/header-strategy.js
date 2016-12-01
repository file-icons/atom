"use strict";

const FileRegistry = require.resolve("../file-registry.js");
const Strategy = require("./strategy.js");


class HeaderStrategy extends Strategy {
	
	init(){
		super.init();
		setImmediate(_=> this.disposables.add(
			require(FileRegistry).observe(file => this.track(file))
		));
	}
	
	
	configureResource(file){
		this.disposables.add(
			file.onDidChangeData(change => {
				const from = this.firstLine(change.from);
				const to   = this.firstLine(change.to || file.data);
				if(from !== to)
					return this.examine(file);
			})
		);
		
		if(null != file.data)
			this.examine(file);
	}
	
	
	examine(file){
		let icon = this.match(file.data);
		if(icon)
			file.setIcon(icon);
		return icon;
	}
	
	
	firstLine(text){
		return text ? text.split(/\r?\n/).shift() : "";
	}
}


module.exports = HeaderStrategy;
