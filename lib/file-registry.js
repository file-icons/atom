"use strict";

const {CompositeDisposable, Disposable, Task} = require("atom");
const scanTask = require.resolve("./scan.js");
const File = require("./file.js");
const UI = require("./ui.js");


class FileRegistry {
	
	init(){
		this.files           = new Set();
		this.filesByPath     = {};
		this.scanQueue       = new Set();
		this.fileDisposables = new WeakMap();
		this.disposables     = new CompositeDisposable(
			UI.onOpenFile(editor => this.get(editor.getPath()).linkEditor(editor)),
			UI.onOpenBlank(editor => this.waitToSave(editor))
		);
	}
	
	
	reset(){
		this.files.forEach(file => this.remove(file));
		this.fileDisposables = null;
		this.filesByPath = {};
		this.disposables.dispose();
		this.disposables = null;
	}
	
	
	add(path){
		const file = new File(path);
		
		const disposables = new CompositeDisposable();
		disposables.add(
			file.onDidDestroy(  _=> this.remove(file)),
			file.onDidMove(paths => this.updatePath(file, paths)),
			file.onScanRequest( _=> this.queueScan(file)),
			file.onScanCancel(  _=> this.unqueueScan(file))
		);
		
		this.files.add(file);
		this.filesByPath[path] = file;
		this.fileDisposables.set(file, disposables);
		return file;
	}
	
	
	get(path){
		const file = this.filesByPath[path];
		return file || this.add(path);
	}
	
	
	remove(file){
		const fd = this.fileDisposables.get(file);
		
		if(fd){
			fd.dispose();
			this.fileDisposables.delete(file);
		}
		
		file.destroy();
		this.filesByPath[file.path] = null;
		this.files.delete(file);
	}


	updatePath(file, {from, to}){
		this.filesByPath[from] = null;
		this.filesByPath[to] = file;
	}
	
	
	runScan(){
		
		// Last-minute check to filter out anything not needing a scan
		const pathsToScan = [];
		for(const file of this.scanQueue)
			if(file.shouldBeScanned())
				pathsToScan.push([ file.getPath(), file.maxScanSize ]);
		
		if(pathsToScan.length){
			const task = Task.once(scanTask, pathsToScan);
			task.on("scan-success", (path, result) => {
				this.filesByPath[path].receiveScan(result);
			});
			task.on("scan-error", (path, error) => {
				const file = this.filesByPath[path];
				file.awaitingScan = false;
				file.scanError = error;
			});
		}
		
		this.scanQueue.clear();
		this.queuedScanID = 0;
	}
	
	
	queueScan(file){
		this.scanQueue.add(file);
		if(!this.queuedScanID){
			this.queuedScanID = setTimeout(_=> this.runScan(), this.scanDelay);
		}
	}
	
	
	unqueueScan(file){
		this.scanQueue.delete(file);
		if(this.scanQueue.size === 0 && this.queuedScanID){
			clearTimeout(this.queuedScanID);
			this.queuedScanID = 0;
		}
	}


	waitToSave(editor){
		const cd = new CompositeDisposable(
			new Disposable(_=> this.disposables.remove(cd)),
			editor.onDidDestroy(_=> cd.dispose()),
			editor.onDidChangePath(file => {
				cd.dispose();
				this.get(file).linkEditor(editor);
			})
		);
		this.disposables.add(cd);
	}
}


// TODO: Add as class properties when supported natively.
FileRegistry.prototype.scanDelay = 10;
FileRegistry.prototype.queuedScanID = 0;

module.exports = new FileRegistry();
