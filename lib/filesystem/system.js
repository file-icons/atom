"use strict";

const {Task}     = require("atom");
const Log        = require("../log.js").tag("SYSTEM");
const taskPath   = require.resolve("./system-task.js");
const {op}       = require(taskPath);


class System{
	
	constructor(){
		this.timeoutID = 0;
		this.taskDelay = 10;
		this.requests = new Map();
		this.requestMeta = new WeakMap();
	}
	
	
	loadData(path, limit = null, readLink = false){
		return this.addRequest(path, "data", {limit, readLink});
	}
	
	loadRealPath(path){
		return this.addRequest(path, "real");
	}
	
	loadStats(path){
		return this.addRequest(path, "stat");
	}
	
	
	addRequest(path, type, params = null){
		const requestID = `${type}:${path}`;
		const request = this.requests.get(requestID);
		
		if(request)
			return request;
		
		else{
			const opFlag = op[type];
			const meta = {path, opFlag, params, onSuccess: null, onError: null};
			const request = new Promise((success, error) => {
				meta.onSuccess = success;
				meta.onError = error;
			});
			
			this.requests.set(requestID, request);
			this.requestMeta.set(request, meta);
			
			if(!this.timeoutID)
				this.timeoutID = setTimeout(_=> this.sendRequests(), this.taskDelay);
			
			Log.event(`Job queued - ${op[opFlag].name}`, path, params);
			return request;
		}
	}
	
	
	prepareTaskArgs(){
		const output = [];
		const indexes = new Map();
		
		for(const [_, request] of this.requests){
			const requestMeta = this.requestMeta.get(request);
			const {path, opFlag, params} = requestMeta;
			const index = indexes.get(path);
			
			if(index == null){
				const args = [path, opFlag, params || {}];
				const index = output.push(args) - 1;
				indexes.set(path, index);
			}
			
			else{
				const args = output[index];
				args[1] |= opFlag;
				if(params)
					Object.assign(args[2], params);
			}
		}
		
		return output;
	}
	
	
	sendRequests(){
		const taskArgs = this.prepareTaskArgs();
		const task = Task.once(taskPath, taskArgs);
		
		const {requests, requestMeta} = this;
		this.resetRequests();
		
		task.on("op:done", (type, path, result) => {
			Log.event(`Done - ${op[type].name}`, path, result);
			const requestID = `${op[type].id}:${path}`;
			const request = requests.get(requestID);
			const {onSuccess} = requestMeta.get(request);
			onSuccess(result);
			requests.delete(requestID);
			requestMeta.delete(request);
		});
		
		task.on("op:error", (type, path, error) => {
			Log.error(`Failed - ${op[type].name}`, path, error);
			const requestID = `${op[type].id}:${path}`;
			const request = requests.get(requestID);
			if(request){
				const {onError} = requestMeta.get(request);
				onError(error);
				requestMeta.delete(request);
				requests.delete(requestID);
			}
		});
	}
	
	
	resetRequests(){
		clearTimeout(this.timeoutID);
		this.timeoutID = 0;
		this.requests = new Map();
		this.requestMeta = new WeakMap();
	}
}


module.exports = new System();
