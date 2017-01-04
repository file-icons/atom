"use strict";

const {dirname, join} = require("path");
const {CompositeDisposable, Disposable, Emitter} = require("atom");
const {rgbToHSL} = require("./utils/general.js");
let delayNext = false;


class UI {
	
	// TODO: Clean up the whole notion of "colour modes/motifs", etc.
	init(){
		this.lightTheme  = false;
		this.emitter     = new Emitter();
		this.disposables = new CompositeDisposable(
			atom.themes.onDidChangeActiveThemes(_=> {
				setImmediate(_=> this.checkMotif());
				this.fixOffset();
			})
		);
	}
	
	
	reset(){
		this.disposables.dispose();
		this.disposables = null;
		this.emitter.dispose();
		this.emitter = null;
	}


	observe(){
		this.disposables.add(
			atom.workspace.observePaneItems(paneItem => {
				if("ArchiveEditor" === paneItem.constructor.name)
					this.emitter.emit("open-archive", paneItem);
			}),
			
			atom.workspace.observeTextEditors(editor => {
				this.emitter.emit("open-editor", editor);
				
				// Existing file
				if(editor.getPath())
					this.emitter.emit("open-file", editor);
				
				// New document: track once a file's been saved
				else{
					this.emitter.emit("open-blank", editor);
					this.waitToSave(editor).then(file => {
						// NOTE: These two events can probably be merged once atom/tabs#397 is addressed
						this.emitter.emit("save-new-file", {file, editor});
						this.emitter.emit("open-file", editor);
					});
				}
			})
		);
	}
	
	
	/**
	 * Register a handler function to fire in response to emitted events.
	 *
	 * If accessed through UI.delay, the handler is executed asynchronously,
	 * giving the current thread a chance to finish executing. The delay flag
	 * is reset after assigning the handler.
	 *
	 * @param {String} eventName
	 * @param {Function} handler
	 * @return {Disposable}
	 */
	subscribe(eventName, handler){
		if(delayNext){
			const originalHandler = handler;
			handler = function(...args){
				setImmediate(_=> originalHandler.call(this, ...args));
			};
			delayNext = false;
		}
		return this.emitter.on(eventName, handler);
	}
	
	
	/**
	 * Enable the "delay" flag, making the next subscription handler asynchronous.
	 *
	 * @return {UI}
	 */
	get delay(){
		delayNext = true;
		return this;
	}
	
	
	/* Event subscription */
	onMotifChanged   (fn){ return this.subscribe("motif-changed",  fn)}
	onOpenArchive    (fn){ return this.subscribe("open-archive",   fn)}
	onOpenEditor     (fn){ return this.subscribe("open-editor",    fn)}
	onOpenFile       (fn){ return this.subscribe("open-file",      fn)}
	onOpenBlank      (fn){ return this.subscribe("open-blank",     fn)}
	onSaveNewFile    (fn){ return this.subscribe("save-new-file",  fn)}
	
	
	observeFiles(fn){
		for(const editor of atom.textEditors.editors)
			editor.getFileName() && fn(editor);
		return this.onOpenFile(fn);
	}


	getStyleElement(filename){
		const packagePath = atom.packages.loadedPackages["file-icons"].path;
		const stylePath = join(packagePath, "styles", filename);
		for(const styleSheet of document.styleSheets){
			const {ownerNode} = styleSheet;
			if(ownerNode && ownerNode.sourcePath === stylePath)
				return styleSheet;
		}
		return null;
	}
	
	
	getThemeColour(){
		const styleSheet = this.getStyleElement("colours.less");
		for(const rule of styleSheet.cssRules)
			if(rule.selectorText === ".theme-colour-check"){
				const match = rule.cssText.match(/rgb\(.+\)/);
				return match
					? match[0].match(/[\d.]+(?=[,)])/g).map(Number)
					: null;
			}
		return null;
	}
	
	
	checkMotif(){
		const colour = this.getThemeColour();
		if(!colour) return;
		const isLight = rgbToHSL(colour)[2] >= .5;
		if(isLight !== this.lightTheme){
			this.lightTheme = isLight;
			this.emitter.emit("motif-changed", isLight);
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
	
	
	waitToSave(editor){
		return new Promise(resolve => {
			const cd = new CompositeDisposable(
				new Disposable(_=> this.disposables.remove(cd)),
				editor.onDidDestroy(_=> cd.dispose()),
				editor.onDidChangePath(file => {
					cd.dispose();
					resolve(file);
				})
			);
			this.disposables.add(cd);
		});
	}
	
	
	waitToOpen(filename){
		return new Promise(resolve => {
			const cd = new CompositeDisposable();
			this.disposables.add(cd);
			
			cd.add(new Disposable(() => this.disposables.remove(cd)));
			this.observeFiles(editor => {
				if(editor.getFileName() === filename){
					cd.dispose();
					resolve(editor);
				}
			});
		});
	}
}


module.exports = new UI();
