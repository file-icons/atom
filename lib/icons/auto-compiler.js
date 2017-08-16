"use strict";

const path = require("path");
const {CompositeDisposable, Disposable, Task} = require("atom");
const {FileSystem} = require("atom-fs");
const Options      = require("../options.js");
const Storage      = require("../storage.js");
const {log}        = require("../debug.js");
const UI           = require("../ui.js");

const COMPILER_PATH = path.join(__dirname, "..", "..", "bin", "compile");
const ERROR_NO_NODE_MODULES = 0x40;
const ERROR_NO_PACKAGE_PATH = 0x41;
const ERROR_BAD_SOURCE_PATH = 0x42;
const ERROR_BAD_TARGET_PATH = 0x43;
const ERROR_BAD_SOURCE_DATA = 0x44;


class AutoCompiler{
	
	init(){
		this.disposables = new CompositeDisposable();
		this.currentJob = null;
		this.jobs = new WeakMap();
		this.findTarget();
		Options.addCommand("recompile-config", () => this.recompile());
	}
	
	reset(){
		this.disposables.dispose();
		this.disposables = null;
		this.currentJob = null;
	}
	
	
	/**
	 * Recompile the package's icon database.
	 *
	 * Porcelain method to simplify config regeneration.
	 * @public
	 */
	recompile(){
		if(this.currentJob) return;
		const source = path.join(__dirname, "..", "..", "config.cson");
		const target = path.join(__dirname, ".icondb.js");
		this.compileConfig(source, target)
			.then(result => atom.notifications.addInfo("Config recompiled", {dismissable: true}))
			.catch(error => atom.notifications.addError(error.message, {
				detail: error.detail || error.toString(),
				stack:  error.stack  || null,
				dismissable: true
			}));
	}
	
	
	/**
	 * Run the compiler with explicit input and output paths.
	 *
	 * @see {@link IconCompiler#compileConfigFile}
	 * @param {String} source - CSON config path
	 * @param {String} target - JS output path
	 * @return {Promise}
	 */
	compileConfig(source, target){
		source = path.resolve(path.join(...source.split(/[\\\/]/)));
		target = path.resolve(path.join(...target.split(/[\\\/]/)));
		
		if(this.currentJob)
			return source !== this.jobs.get(currentJob)
				? this.currentJob.then(() => this.compileConfig(source, target))
				: this.currentJob;
		else
			return this.startTask(source, target).then(() => {
				for(const repo of atom.project.repositories)
					repo && repo.projectAtRoot && repo.refreshStatus();
			})
	}
	
	
	/**
	 * Invoke the background task to compile the icon configs.
	 *
	 * @param {String} source - CSON config file
	 * @param {String} target - Path to write generated data
	 * @return {Promise}
	 * @private
	 */
	startTask(source, target){
		this.currentJob = new Promise((done, fail) => {
			this.task = Task.once(COMPILER_PATH, source, target);
			this.task.on("compile:done",   () => done());
			this.task.on("task:completed", () => {
				this.currentJob = null;
				this.task = null;
				done();
			});
			this.task.childProcess.on("close", (code, status) => {
				const args = [code, status, source, target];
				const error = this.describeError(...args);
				fail(error);
			});
		});
		this.jobs.set(this.currentJob, source);
		return this.currentJob;
	}
	
	
	/**
	 * Generate meaningful feedback for an error based on its exit code.
	 *
	 * @param {Number} code - Status code the task's process terminated with.
	 * @param {Number} signal - Signal which killed the task process, if any.
	 * @return {Object}
	 * @private
	 */
	describeError(code, signal){
		let error = [];
		switch(code){
			case ERROR_NO_NODE_MODULES: error = [
				"Node modules not installed",
				"Run `apm install` in package directory and try again."
			]; break;
			case ERROR_NO_PACKAGE_PATH: error = [
				"Package source files not found",
				"Ensure `icon-compiler.js` is reachable from executable's directory:\n\n"
				+ "**Executable:** `" + COMPILER_PATH + "`\n"
				+ "**Failed to include:** `../lib/icons/icon-compiler.js`"
			]; break;
			case ERROR_BAD_SOURCE_PATH: error = ["Input file not found or inaccessible"]; break;
			case ERROR_BAD_TARGET_PATH: error = ["Target path not writable"]; break;
			case ERROR_BAD_SOURCE_DATA: error = ["Malformed CoffeeScript source"]; break;
		}
		const [message = "Compile error", detail] = error;
		log("COMPILER: Failed - " + message, {
			compilerPath: COMPILER_PATH,
			sourceFile: source,
			targetFile: source,
			statusCode: code,
			detail, signal
		});
		return {code, message, detail};
	}
	
	
	/**
	 * Search for config.cson in the workspace, or wait for it to open.
	 *
	 * @private
	 */
	findTarget(){
		const fn = (source, target) => {
			const sourceFile = FileSystem.get(source);
			const targetFile = FileSystem.get(target);
			sourceFile.onDidChangeData(changes => {
				this.compileConfig(source, target)
			});
		};
		
		for(const [path, data] of Storage){
			const target = data.autoCompile;
			if(target) return fn(path, target);
		}
		
		UI.waitToOpen("config.cson").then(editor => {
			const fileText = editor.getText();
			if(!fileText) return;
			const pattern = /(\n#[ \t]*)Local Variables:[ \t]*\1atom-auto-compile:[ \t]*([^\n]+)\1End:\s*$/;
			const match = fileText.match(pattern);
			if(match){
				const filePath = editor.getPath().replace(/\\/g, "/");
				const target = path.resolve(path.dirname(filePath), match[2]);
				const entry = Storage.getPathEntry(filePath);
				entry.autoCompile = target;
				fn(filePath, target);
			}
		});
	}
}


module.exports = new AutoCompiler();
