"use strict";

let frozen = false;
let data = {
	icons: {}
};


class Storage{
	
	init(state = {}){
		if(state.icons)
			data.icons = state.icons;
	}
	
	get data(){
		return data;
	}
	
	get frozen(){
		return frozen;
	}
	
	reset(){
		if(!frozen){
			data.icons = {};
		}
	}
	
	freeze(){
		if(!frozen){
			Object.freeze(data.icons);
			Object.freeze(data);
			frozen = true;
		}
	}
}


module.exports = new Storage();
