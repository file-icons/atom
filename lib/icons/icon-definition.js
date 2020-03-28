"use strict";const{caseKludge,escapeRegExp,forceNonCapturing,fuzzyRegExp,isRegExp}=require("../utils.js");/**
 * Intermediate representation of an uncompiled {@link Icon} object.
 *
 * Generated from human-readable CSON source during compilation.
 * Written to disk as JavaScript arrays to quicken startup time.
 *
 * @class
 */class IconDefinition{/**
	 * Define a new icon from loaded CSON/JSON source.
	 *
	 * @param {String}        key - Name of config key which defined this icon.
	 * @param {String}       icon - Icon's CSS class.
	 * @param {RegExp}      match - Pattern that matches file/directory paths.
	 * @param {String[]}   colour - Colour classes used by this icon.
	 * @param {Object} [props={}] - Additional/advanced properties.
	 */constructor(key,icon,match,colour,props={}){// Improve performance by forcing groups to be non-capturing
for(const name in this.key=key,this.icon=icon,this.match=match,this.setColours(colour),this.setPriority(props.priority),this.setInterpreter(props.interpreter),this.signature=props.signature||null,props.scope&&(this.setScope(props.scope),this.setName(props.alias,props.generic,props.noFuzz)),props.matchPath&&(this.matchPath=true),this){const value=this[name];isRegExp(value)&&!/\\[1-9]/.test(value.source.replace(/\\[^1-9]/g,""))&&(this[name]=forceNonCapturing(value))}}/**
	 * Define the CSS classes for displaying the icon's colour.
	 *
	 * @param {String[]} classes
	 * @private
	 */setColours(classes){if("string"==typeof classes){const auto=classes.match(/^auto-(\w+)/i);this.colour=auto?["medium-"+auto[1],"dark-"+auto[1]]:[classes,classes]}else Array.isArray(classes)?(this.colour=classes,null==this.colour[1]&&(this.colour[1]=this.colour[0])):this.colour=[null,null]}/**
	 * Define the order in which the icon is matched before others.
	 *
	 * @param {Number} [priority=1]
	 * @private
	 */setPriority(priority){this.priority=Number.isNaN(+priority)?priority||1:+priority}/**
	 * Define the executable names to match in interpreter directives.
	 *
	 * @param {String|RegExp} pattern
	 * @private
	 */setInterpreter(pattern){pattern&&(this.interpreter=isRegExp(pattern)?pattern:new RegExp("^"+pattern+"$"))}/**
	 * Define the language grammars which trigger the icon.
	 *
	 * @param {String|RegExp} pattern - Grammar scopes
	 * @private
	 */setScope(pattern){pattern&&(this.scope=isRegExp(pattern)?pattern:new RegExp(`\\.${escapeRegExp(pattern)}$`,"i"))}/**
	 * Construct a pattern to match the icon's human-readable names.
	 *
	 * The definition's config key is always included unless `noKey` is set.
	 *
	 * @param {String|RegExp}  [alias] - Additional patterns to match as names
	 * @param {Boolean}  [noKey=false] - Omit the config key when generating pattern.
	 * @param {Boolean} [noFuzz=false] - Disable fuzzy-matching in string expressions.
	 * @private
	 */setName(alias=null,noKey=false,noFuzz=false){if(alias)if(isRegExp(alias))this.lang=alias;else{const source=noFuzz?escapeRegExp(alias):fuzzyRegExp(alias,String);this.lang=new RegExp("^"+source+"$","i")}// Nothing more to do here.
if(noKey)return;const{key}=this,keyDiffersToAlias=isRegExp(alias)?!alias.test(key):!alias||key.toLowerCase()!==alias.toLowerCase();// Add the alias only if it matches something the key doesn't
if(keyDiffersToAlias){const keyPattern=this.lang&&!this.lang.ignoreCase?caseKludge(key,!noFuzz):noFuzz?escapeRegExp(key):fuzzyRegExp(key,String),source=this.lang?`^${keyPattern}$|${this.lang.source}`:`^${keyPattern}$`,flags=this.lang?this.lang.flags:"i";this.lang=new RegExp(source,flags)}}/**
	 * Concatenate the instance's patterns with those of another definition.
	 *
	 * @param {IconDefinition} input
	 */merge(input){const src=this.match.source+"|"+input.match.source;this.match=new RegExp(src,this.match.flags),!this.alias&&input.alias&&(this.alias=input.alias),!this.scope&&input.scope&&(this.scope=input.scope),!this.interpreter&&input.interpreter&&(this.interpreter=input.interpreter),!this.signature&&input.signature&&(this.signature=input.signature)}/**
	 * Generate the JavaScript code to define this definition's {@link Icon}.
	 *
	 * @return {String}
	 */toString(){// Order of values must match what Icon's constructor expects
const args=[this.icon,this.colour,this.match,this.priority,this.matchPath,this.interpreter,this.scope,this.lang,this.signature];// Shorten array by pruning trailing null values.
for(let i=args.length-1;0<=i&&null==args[i];--i)args.pop();// Shorten array further by pruning trailing defaults:
return false===args[4]&&5===args.length&&// → matchPath=false
args.pop(),1===args[3]&&(4===args.length// → priority=1
?args.pop():args[3]=null),"["+args.map(arg=>null===arg?"":isRegExp(arg)?arg.toString():JSON.stringify(arg)).join(",")+"]"}/**
	 * Force stringification when converted to JSON.
	 *
	 * @return {String}
	 */toJSON(){return this.toString()}}Object.assign(IconDefinition.prototype,{icon:null,colour:null,match:null,matchPath:false,interpreter:null,scope:null,lang:null,signature:null}),module.exports=IconDefinition;