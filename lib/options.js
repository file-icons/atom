"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const UI = require("./ui.js");
const NS = "file-icons";


/**
 * Global interface that monitors state of package settings.
 *
 * @class
 */
class Options{
	
	/**
	 * Register all relevant package options.
	 */
	init(){
		this.disposables = new CompositeDisposable();
		this.emitter = new Emitter();
		
		this.register("coloured");
		this.register("onChanges", "colourChangedOnly");
		this.register("defaultIconClass", null, value => value.split(/\s+/));
		this.register("tabPaneIcon");
		this.register("strategies.grammar");
		this.register("strategies.hashbangs");
		this.register("strategies.modelines");
		this.register("strategies.usertypes");
		this.register("strategies.linguist");
		
		this.linkToDOM("coloured", "colourless", true);
	}
	
	
	/**
	 * Free up memory when deactivating.
	 */
	reset(){
		this.disposables.dispose();
		this.disposables = null;
		this.emitter.emit("did-destroy");
		this.emitter.dispose();
		this.emitter = null;
	}
	
	
	/**
	 * Register a callback to fire when a registered option changes.
	 *
	 * @param {String} setting - Name of registered option's property
	 * @param {Function} fn - Callback that gets triggered
	 * @return {Disposable}
	 */
	onDidChange(setting, fn){
		return this.emitter.on(`did-change-${setting}`, fn);
	}
	
	
	/**
	 * Execute a callback with the option's current and future values.
	 *
	 * Analoguous to `atom.config.observe`.
	 *
	 * @param {String} setting - Registered option's property
	 * @param {Function} fn - Callback to trigger
	 * @return {Disposable}
	 */
	observe(setting, fn){
		fn(this[setting]);
		const handler = this.onDidChange(setting, fn);
		return handler;
	}
	
	
	/**
	 * Mode which determines the colour-class used by a motif-aware icon.
	 *
	 * Possible values:
	 *  - `false`: Dark-coloured theme is used. Use first colour-class.
	 *  -  `true`: Light-coloured theme is used. Use second colour-class.
	 *  -  `null`: Coloured icons are disabled. Use no colour-class.
	 *
	 * @property {Boolean|null}
	 * @readonly
	 */
	get colourMode(){
		return this.coloured ? ~~UI.lightTheme : null;
	}
	
	
	/**
	 * Namespace prefixing everything the package registers with Atom.
	 *
	 * @property {String}
	 * @readonly
	 */
	get namespace(){
		return NS;
	}
	
	
	/**
	 * Register a package setting in Atom.
	 *
	 * The value of a registered setting is stored on the Options global using
	 * the given `property` name, which defaults to the setting's name if omitted.
	 * An optional third parameter may be given to modify what gets stored, which
	 * is usually desirable for strings that need to be split into arrays.
	 *
	 * @param {String}     option - Name of setting, as defined by package.json.
	 * @param {String} [property] - Name of setting's property, if different.
	 * @param {Function} [filter] - Filter to modify the setting's stored value.
	 */
	register(option, property = null, filter = null){
		const propertyName = property || option.replace(/^\w+\./, "");
		const optionName = `${NS}.${option}`;
		
		const observer = atom.config.observe(optionName, value => {
			if(filter) value = filter(value);
			this[propertyName] = value;
			this.emitter.emit("did-change-" + propertyName, value);
		});
		
		this.disposables.add(observer);
	}
	
	
	/**
	 * Toggle the status of a package setting. Implies a boolean type.
	 *
	 * @param {String} option
	 * @return {Boolean} Whether an option was changed.
	 */
	toggle(option){
		const name = `${NS}.${option}`;
		return atom.config.set(name, !(atom.config.get(name)));
	}
	
	
	/**
	 * Toggle a CSS class whenever a setting changes. Internal-use only.
	 *
	 * @param {String} optionName      - Name of boolean setting.
	 * @param {String} [className]     - Name of CSS class, if different.
	 * @param {Boolean} [invert=false] - Add class when option is disabled.
	 * @param {HTMLElement} [target]   - Receiving element; defaults to body.
	 * @private
	 */
	linkToDOM(optionName, className = null, invert = false, target = null){
		className = className || optionName;
		target    = target    || document.body;
		
		this.disposables.add(this.observe(optionName, on => {
			if(invert) on = !on;
			target.classList.toggle(`${NS}-${className}`, on);
		}));
	}
}


module.exports = new Options();
