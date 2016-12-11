"use strict";

const {isString} = require("./utils/general.js");


/**
 * Container for debugging and error logs.
 *
 * @class
 * @property {Boolean} all           - Log regular events as well as error events.
 * @property {Array}   errors        - Errors that have occurred during the session.
 * @property {Array}   events        - Ordinary data of potential debugging interest.
 * @property {Boolean} showInConsole - Copy logged entries to dev console.
 * @property {Boolean} tildifyPaths  - Replace $HOME with ~ in console's output.
 */
class Log{
	
	/**
	 * Initialise an empty Log instance.
	 *
	 * @constructor
	 */
	constructor(){
		const specMode = atom.inSpecMode();
		const devMode  = atom.inDevMode();
		
		this.all = !!(devMode || specMode);
		this.errors = [];
		this.events = [];
		this.showInConsole = false;
		this.tildifyPaths = true;
	}
	
	
	/**
	 * Internal method for adding a timestamped row of data.
	 *
	 * @param {Array} to - Array to store the values.
	 * @param {*} [args] - Variable-length list of values to log.
	 * @private
	 */
	append(to, ...args){
		const [tag, title, ...etc] = args;
		to.push([new Date(), `${tag}: ${title}`, ...etc]);
	}
	
	
	/**
	 * Log a problematic event.
	 *
	 * @param {*} [args]
	 */
	error(...args){
		this.append(this.errors, ...args);
		if(this.showInConsole)
			this.echo(...args);
	}
	
	
	/**
	 * Log a noteworthy event.
	 *
	 * Does nothing if Atom isn't running in dev or spec mode.
	 *
	 * @param {*} [args]
	 */
	event(...args){
		if(!this.all) return;
		this.append(this.events, ...args);
		if(this.showInConsole)
			this.echo(...args);
	}


	/**
	 * Display a logged entry in the developer console.
	 *
	 * @param {String} description
	 * @param {*} [args]
	 */
	echo(description, ...args){
		const bold = "font-weight: bold";
		
		if(args.length > 1 || args.length && !isString(args[0])){
			const [title, ...contents] = args;
			const style = "font-weight: normal";
			console.groupCollapsed(`${description}:%c ${title}`, style);
			contents.forEach(value => {
				if(this.tildifyPaths && isString(value))
					value = this.tildify(value);
				console.log(value);
			});
			console.groupEnd();
		}
		
		else args.length
			? console.log(`%c${description}:`, bold, args[0])
			: console.log(`%c${description}`,  bold);
	}
	
	
	/**
	 * Create an "auto-prefixing" variant of the {Log} global.
	 *
	 * @param {String} name
	 * @return {Object}
	 */
	tag(name){
		return Object.defineProperties({}, {
			error: {
				configurable: false,
				enumerable:   false,
				value: (...args) => this.error(name, ...args)
			},
			
			event: {
				configurable: false,
				enumerable:   false,
				value: this.all
					? (...args) => this.event(name, ...args)
					: () => {}
			}
		});
	}


	/**
	 * Replace any occurrences of $HOME with a tilde.
	 *
	 * @param {String} input
	 * @return {String}
	 */
	tildify(input){
		if("win32" === process.platform)
			return input;
		const home = process.env.HOME + "/";
		return (0 === input.indexOf(home))
			? input.substr(home.length).replace(/^\/?/, "~/")
			: input;
	}
}

module.exports = new Log();
