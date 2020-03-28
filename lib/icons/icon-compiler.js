"use strict";function _createForOfIteratorHelperLoose(o){var i=0;if("undefined"==typeof Symbol||null==o[Symbol.iterator]){if(Array.isArray(o)||(o=_unsupportedIterableToArray(o)))return function(){return i>=o.length?{done:true}:{done:false,value:o[i++]}};throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}return i=o[Symbol.iterator](),i.next.bind(i)}function _unsupportedIterableToArray(o,minLen){if(o){if("string"==typeof o)return _arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);return"Object"===n&&o.constructor&&(n=o.constructor.name),"Map"===n||"Set"===n?Array.from(n):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?_arrayLikeToArray(o,minLen):void 0}}function _arrayLikeToArray(arr,len){(null==len||len>arr.length)&&(len=arr.length);for(var i=0,arr2=Array(len);i<len;i++)arr2[i]=arr[i];return arr2}const IconDefinition=require("./icon-definition.js"),{isString,isRegExp,escapeRegExp}=require("../utils.js");/**
 * Interface for generating precompiled arrays of icon data.
 *
 * @class
 */class IconCompiler{/**
	 * Compile working icon data from a CSON config file.
	 *
	 * @example compile("./config.cson", "./lib/service/.config.json");
	 * @param {String} configPath - Path to CSON source
	 * @param {String} outputPath - Path of compiled output
	 */compileConfigFile(configPath,outputPath){const fs=require("fs"),CoffeeScript=require("coffee-script"),config=fs.readFileSync(configPath).toString();CoffeeScript.eval(config);const output=this.compileConfigData(config);fs.writeFileSync(outputPath,output)}/**
	 * Compile parsed config source into JavaScript source.
	 *
	 * @param {Object} data - Object parsed from JSON/CSON.
	 * @param {Boolean} [cson=false] - Precompile with CoffeeScript
	 * @return {String}
	 */compileConfigData(source,cson=false){cson&&(source=require("coffee-script").eval(source));const directoryIcons=this.compileList(source.directoryIcons),fileIcons=this.compileList(source.fileIcons),indexedLists=this.indexLists([directoryIcons,fileIcons]);return this.stringify(indexedLists)}/**
	 * Generate a list of {@link IconDefinition} instances.
	 *
	 * @param {Object} input - Object hash parsed from JSON data.
	 * @return {IconDefinition[]} Array of icon definitions.
	 */compileList(input){const result=[],sortInfo=new WeakMap;for(const key in input){const defs=this.compileEntry(key,input[key]),name=key.toLowerCase();defs.forEach((def,index)=>sortInfo.set(def,{name,index})),result.push(...defs)}return result.sort((a,b)=>{if(a.priority>b.priority)return-1;if(a.priority<b.priority)return 1;const A=sortInfo.get(a),B=sortInfo.get(b);return A.name<B.name?-1:A.name>B.name?1:A.index<B.index?-1:A.index>B.index?1:0})}/**
	 * Compile a single config entry.
	 *
	 * Used internally by {@link IconCompiler#compileList}.
	 *
	 * @param {String} key
	 * @param {Object} value
	 * @return {Array}
	 * @private
	 */compileEntry(key,value){value={...value};let{icon,match}=value;if(!Array.isArray(match)){const props=this.parseExtraProps(value);return props.noSuffix||(icon+="-icon"),match=this.parseMatchPattern(match,props.matchPath),[new IconDefinition(key,icon,match,value.colour,props)]}const output=[];for(var _step,_iterator=_createForOfIteratorHelperLoose(match);!(_step=_iterator()).done;){const i=_step.value;let[match,colour,props]=i;const entryProps=this.parseExtraProps(props);props={...value,...entryProps},match=this.parseMatchPattern(match,props.matchPath);const entryIcon=icon+(props.noSuffix?"":"-icon"),newIcon=new IconDefinition(key,entryIcon,match,colour,props),prevIcon=output.find(def=>this.canMergeDefinitions(def,newIcon));prevIcon?prevIcon.merge(newIcon):output.push(newIcon),entryProps.interpreter||delete value.interpreter,entryProps.scope||delete value.scope,entryProps.alias||delete value.alias}return output}/**
	 * Resolve the tertiary parameter for specifying additional properties.
	 *
	 * @param {String|Object} input
	 * @private
	 */parseExtraProps(input){// Ignore blank input
if(!input)return{};// Strings are shorthand to set 3 common properties at once
if(isString(input))return{alias:input,scope:input,interpreter:input};const output={};// Assign every property that's supported here
// Wipe null values so properties defined at entry-level aren't overwritten
for(const key in output.priority=input.priority,output.alias=input.alias,output.scope=input.scope,output.interpreter=input.interpreter,output.matchPath=input.matchPath,output.signature=input.signature,input.generic&&(output.generic=true),input.noFuzz&&(output.noFuzz=true),input.noSuffix&&(output.noSuffix=true),output)null==output[key]&&delete output[key];return output}/**
	 * Resolve an icon's path-matching pattern.
	 *
	 * @param {String|RegExp} input
	 * @param {Boolean} fixSeparators
	 * @return {RegExp}
	 * @private
	 */parseMatchPattern(input,fixSeparators=false){return isRegExp(input)?input:fixSeparators?(input=input.split(/[\\/]+/).map(s=>escapeRegExp(s)).join("[\\\\\\/]"),new RegExp(input+"$","i")):new RegExp(escapeRegExp(input)+"$","i")}/**
	 * Check if two {@link IconDefinitions} can be merged together.
	 *
	 * @param {IconDefinition} input
	 * @return {Boolean}
	 */canMergeDefinitions(a,b){if(a.icon!==b.icon)return false;if(a.colour[0]!==b.colour[0])return false;if(a.colour[1]!==b.colour[1])return false;if(a.priority!==b.priority)return false;if(a.match.flags!==b.match.flags)return false;if(!!a.matchPath!=!!b.matchPath)return false;for(var _i=0,_arr=["alias","scope","interpreter","signature"];_i<_arr.length;_i++){const name=_arr[_i],A=a[name],B=b[name];if(A&&B&&(B.source!==A.source||B.flags!==A.flags))return false;if(B&&A&&(A.source!==B.source||A.flags!==B.flags))return false}return true}/**
	 * Index each icon which supports special match criteria.
	 *
	 * @param {Array} lists
	 * @return {Array}
	 */indexLists(lists){const indexedLists=[];for(var _step2,_iterator2=_createForOfIteratorHelperLoose(lists);!(_step2=_iterator2()).done;){const icons=_step2.value,indexes=[[],[],[],[],[]];let offset=0;for(var _step3,_iterator3=_createForOfIteratorHelperLoose(icons);!(_step3=_iterator3()).done;){const icon=_step3.value;icon.interpreter&&indexes[0].push(offset),icon.lang&&indexes[1].push(offset),icon.matchPath&&indexes[2].push(offset),icon.scope&&indexes[3].push(offset),icon.signature&&indexes[4].push(offset),++offset}indexedLists.push([icons,indexes])}return indexedLists}/**
	 * Convert icon-lists into readable JavaScript source.
	 *
	 * @param {Array} lists
	 * @return {String}
	 */stringify(lists){let output="\"use strict\"; // Auto-generated by compiler. DO NOT EDIT. Seriously.\nmodule.exports = [";for(var _step4,_iterator4=_createForOfIteratorHelperLoose(lists);!(_step4=_iterator4()).done;){const[iconList,indexList]=_step4.value;output+="\n[["+iconList.join(",\n")+"],\n"+JSON.stringify(indexList)+"],"}return output.replace(/,$/,"\n];\n")}}module.exports=new IconCompiler;