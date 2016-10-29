"use strict";

const {CompositeDisposable, Task} = require("atom");
const scanTask = require.resolve("./scan.js");
const File = require("./file.js");
const UI   = require("./ui.js");


class FileRegistry {
	
	init(){
		this.files           = new Set();
		this.filesByPath     = {};
		this.scanQueue       = new Set();
		
		this.atomDisposables = new CompositeDisposable();
		this.fileDisposables = new WeakMap();
		
		this.atomDisposables.add(
			atom.workspace.observeTextEditors(editor => {
				const path = editor.buffer.getPath();
				
				// Blank editor
				if(!path){
					const cd = new CompositeDisposable();
					
					cd.add(
						editor.onDidDestroy(_=> cd.dispose()),
						editor.onDidChangePath(file => {
							cd.dispose();
							this.get(file).linkEditor(editor);
						})
					);
				}
				
				// Existing file
				else this.get(path).linkEditor(editor);
			}),
			
			UI.onTreeViewAdded(treeView => {
				const disp = treeView.onEntryMoved(paths => {
					const {oldPath, newPath} = paths;
					const file = this.filesByPath[oldPath];
					this.updatePath(file, {from: oldPath, to: newPath});
				});
				this.treeDisposables = new CompositeDisposable();
				this.treeDisposables.add(disp);
			}),
			
			UI.onTreeViewRemoved(_=> {
				this.treeDisposables.dispose();
				this.treeDisposables = null;
			})
		);
	}
	
	reset(){
		this.files.forEach(file => this.remove(file));
		this.fileDisposables = null;
		this.filesByPath = {};
		this.atomDisposables.dispose();
		this.atomDisposables = null;
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
			task.on("file-scanned", (path, result) => {
				this.filesByPath[path].receiveScan(result);
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
}


// TODO: Add as class properties when supported natively.
FileRegistry.prototype.scanDelay = 10;
FileRegistry.prototype.queuedScanID = 0;

module.exports = new FileRegistry();
