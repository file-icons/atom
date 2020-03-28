"use strict";function _createForOfIteratorHelperLoose(o){var i=0;if("undefined"==typeof Symbol||null==o[Symbol.iterator]){if(Array.isArray(o)||(o=_unsupportedIterableToArray(o)))return function(){return i>=o.length?{done:true}:{done:false,value:o[i++]}};throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}return i=o[Symbol.iterator](),i.next.bind(i)}function _unsupportedIterableToArray(o,minLen){if(o){if("string"==typeof o)return _arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);return"Object"===n&&o.constructor&&(n=o.constructor.name),"Map"===n||"Set"===n?Array.from(n):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?_arrayLikeToArray(o,minLen):void 0}}function _arrayLikeToArray(arr,len){(null==len||len>arr.length)&&(len=arr.length);for(var i=0,arr2=Array(len);i<len;i++)arr2[i]=arr[i];return arr2}const Icon=require("./icon.js");/**
 * Interface providing access to the package's databases.
 *
 * @property {Array} directoryIcons - Icons to match directory-type resources.
 * @property {Array} fileIcons      - Icons to match file resources.
 * @property {Icon}  binaryIcon     - Icon for binary files.
 * @property {Icon}  executableIcon - Icon for executables.
 * @class
 */class IconTables{constructor(){const data=require("./.icondb.js");this.directoryIcons=this.read(data[0]),this.fileIcons=this.read(data[1]),this.binaryIcon=this.matchName(".o"),this.executableIcon=this.matchInterpreter("bash")}/**
	 * Populate icon-lists from a compiled data table.
	 *
	 * @param {Array} table
	 * @return {Object}
	 * @private
	 */read(table){let[icons,indexes]=table;icons=icons.map((i,offset)=>new Icon(offset,...i)),indexes=indexes.map(index=>index.map(offset=>icons[offset]));const[byInterpreter,byLanguage,byPath,byScope,bySignature]=indexes;return{byName:icons,byInterpreter,byLanguage,byPath,byScope,bySignature}}/**
	 * Match an icon using a resource's basename.
	 *
	 * @param {String} name - Name of filesystem entity
	 * @param {Boolean} [directory=false] - Match folders instead of files
	 * @return {Icon}
	 */matchName(name,directory=false){const[cachedIcons,icons]=directory?[cache.directoryName,this.directoryIcons.byName]:[cache.fileName,this.fileIcons.byName],cached=cachedIcons.get(name);if(cached)return cached;for(var _step,_iterator=_createForOfIteratorHelperLoose(icons);!(_step=_iterator()).done;){const icon=_step.value;if(icon.match.test(name))return cachedIcons.set(name,icon),icon}return null}/**
	 * Match an icon using a resource's system path.
	 *
	 * @param {String} path - Full pathname to check
	 * @param {Boolean} [directory=false] - Match folders instead of files
	 * @return {Icon}
	 */matchPath(path,directory=false){const[cachedIcons,icons]=directory?[cache.directoryName,this.directoryIcons.byPath]:[cache.fileName,this.fileIcons.byPath],cached=cachedIcons.get(path);if(cached)return cached;for(var _step2,_iterator2=_createForOfIteratorHelperLoose(icons);!(_step2=_iterator2()).done;){const icon=_step2.value;if(icon.match.test(path))return cachedIcons.set(path,icon),icon}return null}/**
	 * Match an icon using the human-readable form of its related language.
	 *
	 * Typically used for matching modelines and Linguist-language attributes.
	 *
	 * @example IconTables.matchLanguage("JavaScript")
	 * @param {String} name - Name/alias of language
	 * @return {Icon}
	 */matchLanguage(name){const cached=cache.language.get(name);if(cached)return cached;for(var _step3,_iterator3=_createForOfIteratorHelperLoose(this.fileIcons.byLanguage);!(_step3=_iterator3()).done;){const icon=_step3.value;if(icon.lang.test(name))return cache.language.set(name,icon),icon}return null}/**
	 * Match an icon using the grammar-scope assigned to it.
	 *
	 * @example IconTables.matchScope("source.js")
	 * @param {String} name
	 * @return {Icon}
	 */matchScope(name){const cached=cache.scope.get(name);if(cached)return cached;for(var _step4,_iterator4=_createForOfIteratorHelperLoose(this.fileIcons.byScope);!(_step4=_iterator4()).done;){const icon=_step4.value;if(icon.scope.test(name))return cache.scope.set(name,icon),icon}return null}/**
	 * Match an icon using the name of an interpreter which executes its language.
	 *
	 * Used for matching interpreter directives (a.k.a., "hashbangs").
	 *
	 * @example IconTables.matchInterpreter("bash")
	 * @param {String} name
	 * @return {Icon}
	 */matchInterpreter(name){const cached=cache.interpreter.get(name);if(cached)return cached;for(var _step5,_iterator5=_createForOfIteratorHelperLoose(this.fileIcons.byInterpreter);!(_step5=_iterator5()).done;){const icon=_step5.value;if(icon.interpreter.test(name))return cache.interpreter.set(name,icon),icon}return null}/**
	 * Match an icon using a resource's file signature.
	 *
	 * @example IconTables.matchSignature("\x1F\x8B")
	 * @param {String} data
	 * @return {Icon}
	 */matchSignature(data){const cached=cache.signature.get(data);if(cached)return cached;for(var _step6,_iterator6=_createForOfIteratorHelperLoose(this.fileIcons.bySignature);!(_step6=_iterator6()).done;){const icon=_step6.value;if(icon.signature.test(data))return cache.signature.set(data,icon),icon}// Special case: Assume anything containing null-bytes is binary
return /\0/.test(data)?(cache.signature.set(data,this.binaryIcon),this.binaryIcon):null}}// TODO: Searching/caching should be a different class's responsibility.
// Add a class to represent individual tables to obviate this mess.
const cache={directoryName:new Map,directoryPath:new Map,fileName:new Map,filePath:new Map,interpreter:new Map,scope:new Map,language:new Map,signature:new Map};/**
 * Hash of maps to cache searches.
 * @property {Object} cachedMatches
 */Object.defineProperty(IconTables.prototype,"cache",{get:()=>cache}),module.exports=new IconTables;