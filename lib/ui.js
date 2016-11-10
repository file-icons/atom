"use strict";

const {CompositeDisposable, Disposable, Emitter} = require("atom");
let delayNext = false;


class UI {
	
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
			atom.workspace.observeTextEditors(editor => {
				this.emitter.emit("open-editor", editor);
				
				// Existing file
				if(editor.getPath())
					this.emitter.emit("open-file", editor);
				
				// New document: track once a file's been saved
				else{
					this.emitter.emit("open-blank", editor);
					this.waitToSave(editor).then(file => {
						this.emitter.emit("save-new-file", {file, editor});
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
	
	
	onMotifChanged(fn){
		return this.subscribe("motif-changed", fn);
	}
	
	onOpenEditor(fn){
		return this.subscribe("open-editor", fn);
	}
	
	onOpenFile(fn){
		return this.subscribe("open-file", fn);
	}

	onOpenBlank(fn){
		return this.subscribe("open-blank", fn);
	}
	
	onSaveNewFile(fn){
		return this.subscribe("save-new-file", fn);
	}


	checkMotif(){
		
		// Spawn a dummy node, snag its computed style, then shoot it
		const node = document.createElement("div");
		node.className = "theme-colour-check";
		document.body.appendChild(node);
		const colour = window.getComputedStyle(node).backgroundColor;
		node.remove();
		
		// Coerce the "rgb(1, 2, 3)" pattern into an HSL array
		const rgb = colour.match(/[\d.]+(?=[,)])/g);
		const hsl = this.rgbToHSL(rgb);
		const isLight = hsl[2] >= .5;
		
		if(isLight !== this.lightTheme){
			this.lightTheme = isLight;
			this.emitter.emit("motif-changed", isLight);
		}
	}
	
	
	/**
	 * Convert an RGB colour to HSL.
	 *
	 * @param {Array} channels - An array holding each RGB component
	 * @return {Array}
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
}


module.exports = new UI();
