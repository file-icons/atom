"use strict";

const {dirname, join} = require("path");
const {FileSystem} = require("atom-fs");
const {CompositeDisposable, Disposable, Emitter} = require("atom");
let delayNext = false;


// TODO: Double-check how much of this file is even needed once Atom 1.23 hits stable
class UI {
	
	constructor(){
		this.reset();
		this.lightTheme = false;
	}
	
	
	// TODO: Clean up the whole notion of "colour modes/motifs", etc.
	init(){
		this.projects = [];
		this.hasDocks = "function" === typeof atom.workspace.getLeftDock;
		
		this.disposables.add(
			atom.project.onDidChangePaths(to => this.setProjects(to)),
			atom.themes.onDidChangeActiveThemes(() => {
				setImmediate(() => this.checkMotif());
				this.fixOffset();
			}),
			this.onSaveNewFile(args => {
				const file = FileSystem.get(args.file);
				file.addEditor(args.editor);
			}),
			this.onOpenFile(editor => {
				const path = editor.getPath();
				let entity = FileSystem.get(path);
				if("function" !== typeof entity.addEditor){
					FileSystem.paths.delete(path);
					entity = FileSystem.get(path);
				}
				entity.addEditor(editor);
			})
		);
	}
	
	
	reset(){
		this.disposables && this.disposables.dispose();
		this.emitter     && this.emitter.dispose();
		this.disposables = new CompositeDisposable();
		this.emitter     = new Emitter();
		this.hasDocks    = null;
	}


	observe(){
		this.disposables.add(
			// TODO: Axe this (and onOpenArchive/emitOpenedArchive methods) once Atom 1.23 hits stable
			atom.workspace.observePaneItems(paneItem => {
				if("ArchiveEditor" === paneItem.constructor.name)
					this.emitOpenedArchive(paneItem);
			}),
			
			atom.workspace.observeTextEditors(editor => {
				this.emitOpenedEditor(editor);
				
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
				setImmediate(() => originalHandler.call(this, ...args));
			};
			delayNext = false;
		}
		return this.emitter
			? this.emitter.on(eventName, handler)
			: new Disposable(() => {});
	}
	
	
	/**
	 * Dispatch an event with the designated name and argument list.
	 *
	 * @param {String} eventName
	 * @param {Array} [args=[]]
	 */
	emit(eventName, args = []){
		if(!this.emitter) return;
		this.emitter.emit(eventName, ...args);
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
	onMotifChanged         (fn){ return this.subscribe("motif-changed",      fn)}
	onOpenArchive          (fn){ return this.subscribe("open-archive",       fn)}
	onOpenEditor           (fn){ return this.subscribe("open-editor",        fn)}
	onOpenFile             (fn){ return this.subscribe("open-file",          fn)}
	onOpenBlank            (fn){ return this.subscribe("open-blank",         fn)}
	onOpenProject          (fn){ return this.subscribe("open-project",       fn)}
	onProjectsAvailable    (fn){ return this.subscribe("projects-available", fn)}
	onProjectsChanged      (fn){ return this.subscribe("projects-changed",   fn)}
	onProjectsEmptied      (fn){ return this.subscribe("projects-emptied",   fn)}
	onSaveNewFile          (fn){ return this.subscribe("save-new-file",      fn)}
	
	/* Event emission */
	emitMotifChanged       (...$){ this.emit("motif-changed",      $)}
	emitOpenedArchive      (...$){ this.emit("open-archive",       $)}
	emitOpenedEditor       (...$){ this.emit("open-editor",        $)}
	emitOpenedFile         (...$){ this.emit("open-file",          $)}
	emitOpenedBlank        (...$){ this.emit("open-blank",         $)}
	emitOpenedProject      (...$){ this.emit("open-project",       $)}
	emitProjectsAvailable  (...$){ this.emit("projects-available", $)}
	emitProjectsChanged    (...$){ this.emit("projects-changed",   $)}
	emitProjectsEmptied    (...$){ this.emit("projects-emptied",   $)}
	
	
	observeFiles(fn){
		for(const editor of atom.textEditors.editors)
			editor.getFileName() && fn(editor);
		return this.onOpenFile(fn);
	}


	getStyleSheets(){
		const {document} = global;
		if(!document || "object" !== typeof document.styleSheets)
			return [];
		const sheets = [];
		const {length} = document.styleSheets;
		for(let i = 0; i < length; ++i)
			sheets.push(document.styleSheets[i]);
		return sheets;
	}


	getStyleElement(filename){
		const packagePath = atom.packages.loadedPackages["file-icons"].path;
		const styles = this.getStyleSheets();
		if(!document || !styles || !packagePath)
			return null;
		const stylePath = join(packagePath, "styles", filename);
		for(const styleSheet of styles){
			const {ownerNode} = styleSheet;
			if(ownerNode && ownerNode.sourcePath === stylePath)
				return styleSheet;
		}
		return null;
	}
	
	
	getThemeColour(){
		const styleSheet = this.getStyleElement("colours.less");
		if(!styleSheet)
			return null;
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
		const isLight = this.rgbToHSL(colour)[2] >= .5;
		if(isLight !== this.lightTheme){
			this.lightTheme = isLight;
			this.emitMotifChanged(isLight);
		}
	}
	
	
	fixOffset(){
		const styles    = this.getStyleSheets();
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
	
	
	/**
	 * Update the list of currently-open project folders.
	 *
	 * @param {Array} to
	 * @emits paths-changed
	 */
	setProjects(to = []){
		const from = this.projects;
		if(from.join("\n") !== to.join("\n")){
			this.projects = to;
			to.length
				? this.emitProjectsAvailable()
				: this.emitProjectsEmptied();
			this.emitProjectsChanged({from, to});
		}
	}
	
	
	/**
	 * Convert an RGB colour to HSL.
	 *
	 * @param {Number[]} channels - An array holding each RGB component
	 * @return {Number[]}
	 */
	rgbToHSL(channels){
		if(!channels) return;
		
		const r     = channels[0] / 255;
		const g     = channels[1] / 255;
		const b     = channels[2] / 255;
		const min   = Math.min(r, g, b);
		const max   = Math.max(r, g, b);
		const lum   = (max + min) / 2;
		const delta = max - min;
		const sat   = lum < .5
			? (delta / (max + min))
			: (delta / (2 - max - min));
		
		let hue;
		switch(max){
			case r:  hue =     (g - b) / delta; break;
			case g:  hue = 2 + (b - r) / delta; break;
			default: hue = 4 + (r - g) / delta; break;
		}
		
		hue /= 6;
		
		if(hue < 0)
			hue += 1;
		
		return [ hue || 0, sat || 0, lum || 0 ];
	}
}


module.exports = new UI();
