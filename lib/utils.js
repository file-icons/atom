"use strict";function _createForOfIteratorHelperLoose(o){var i=0;if("undefined"==typeof Symbol||null==o[Symbol.iterator]){if(Array.isArray(o)||(o=_unsupportedIterableToArray(o)))return function(){return i>=o.length?{done:true}:{done:false,value:o[i++]}};throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}return i=o[Symbol.iterator](),i.next.bind(i)}function _unsupportedIterableToArray(o,minLen){if(o){if("string"==typeof o)return _arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);return"Object"===n&&o.constructor&&(n=o.constructor.name),"Map"===n||"Set"===n?Array.from(n):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?_arrayLikeToArray(o,minLen):void 0}}function _arrayLikeToArray(arr,len){(null==len||len>arr.length)&&(len=arr.length);for(var i=0,arr2=Array(len);i<len;i++)arr2[i]=arr[i];return arr2}module.exports={caseKludge,collectStrings,escapeRegExp,findBasePath,forceNonCapturing,fuzzyRegExp,isRegExp,isString,rgbToHSL,wait};/**
 * Synthesise case-insensitivity for a regexp string.
 *
 * JavaScript doesn't support scoped modifiers like (?i),
 * so this function attempts to approximate the closest thing.
 *
 * @param {String} input - Case-insensitive text
 * @param {Boolean} fuzz - Apply {@link fuzzyRegExp} to input
 * @return {String}
 */function caseKludge(input,fuzz=false){let output=input.split("").map((s,index,array)=>{if(/[A-Z]/.test(s)){const output="["+s+s.toLowerCase()+"]",prev=array[index-1];return fuzz&&prev&&/[a-z]/.test(prev)?"[\\W_\\S]*"+output:output}return /[a-z]/.test(s)?"["+s.toUpperCase()+s+"]":fuzz?"0"===s?"[0Oo]":/[\W_ \t]?/.test(s)?"[\\W_ \\t]?":s:s.replace(/([/\\^$*+?{}[\]().|])/g,"\\$1")}).join("");return fuzz&&(output=output.replace(/\[Oo\]/g,"[0Oo]")),output.replace(/(\[\w{2,3}\])(\1+)/g,(match,first,rest)=>first+"{"+(rest.length/first.length+1)+"}")}/**
 * "Flatten" a (possibly nested) list of strings into a single-level array.
 *
 * Strings are split by whitespace as separate elements of the final array.
 *
 * @param {Array|String} input
 * @return {String[]} An array of strings
 */function collectStrings(input,refs=null){refs=refs||new WeakSet,input="string"==typeof input?[input]:refs.add(input)&&Array.from(input);const output=[];for(var _step,_iterator=_createForOfIteratorHelperLoose(input);!(_step=_iterator()).done;){const value=_step.value;if(value)switch(typeof value){case"string":output.push(...value.split(/\s+/));break;case"object":if(refs.has(value))continue;refs.add(value),output.push(...collectStrings(value,refs));}}return output}/**
 * Escape special regex characters within a string.
 *
 * @example "file.js" -> "file\\.js"
 * @param {String} input
 * @return {String}
 */function escapeRegExp(input){return input.replace(/([/\\^$*+?{}[\]().|])/g,"\\$1")}/**
 * Locate the root directory shared by multiple paths.
 *
 * @param {String[]} paths - A list of filesystem paths
 * @return {String} root
 */function findBasePath(paths){const POSIX=-1!==paths[0].indexOf("/");let matched=[];// Spare ourselves the trouble if there's only one path.
if(1===paths.length)matched=paths[0].replace(/[\\/]+$/,"").split(/[\\/]/g),matched.pop();else{const rows=paths.map(d=>d.split(/[\\/]/g)),width=Math.max(...rows.map(d=>d.length)),height=rows.length;let x;X:for(x=0;x<width;++x){const str=rows[0][x];for(let y=1;y<height;++y)if(str!==rows[y][x])break X;matched.push(str)}}return matched.join(POSIX?"/":"\\")}/**
 * Turn capturing groups in an expression into non-capturing groups.
 *
 * @example forceNonCapturing(/([A-Z]+)/) == /(?:[A-Z]+)/
 * @param {RegExp} pattern
 * @return {RegExp}
 */function forceNonCapturing(pattern){const source=pattern.source.split(/\((?!\?[=<!])/).map((segment,index,array)=>index?/^(?:[^\\]|\\.)*\\$/.test(array[index-1])?segment.replace(/^/,"("):segment.replace(/^(?:\?:)?/,"(?:"):segment).join("");return new RegExp(source,pattern.flags)}/**
 * Generate a regex to match a string, bypassing intermediate punctuation.
 *
 * E.g., "CoffeeScript" matches "coffee-script", "cOfFeE sCRiPT" or even
 * "C0FFEE.SCRIPT". Useful when words have multiple possible spellings.
 *
 * @param {String} input - A string, such as "reStructuredText" or "dBASE"
 * @param {Function} format - Desired output format (String or RegExp)
 * @return {String|RegExp}
 */function fuzzyRegExp(input,format=RegExp){if("[object String]"!==Object.prototype.toString.call(input))return input;const output=input.replace(/([A-Z])([A-Z]+)/g,(a,b,c)=>b+c.toLowerCase()).split(/\B(?=[A-Z])|[-\s]/g).map(i=>i.replace(/([/\\^$*+?{}[\]().|])/g,"\\$1?")).join("[\\W_ \\t]?").replace(/[0Oo]/g,"[0o]");// Author's requested the regex source, return a string
return String===format?output:new RegExp(output,"i");// Otherwise, crank the fuzz
}/**
 * Return true if the given value is a {@link RegExp|regular expression}.
 *
 * @param {*} input
 * @return {Boolean}
 */function isRegExp(input){return"[object RegExp]"===Object.prototype.toString.call(input)}/**
 * Return true if the given value is a {@link String}.
 *
 * @param {*} input
 * @return {Boolean}
 */function isString(input){return"[object String]"===Object.prototype.toString.call(input)}/**
 * Convert an RGB colour to HSL.
 *
 * @param {Number[]} channels - An array holding each RGB component
 * @return {Number[]}
 */function rgbToHSL(channels){var _Mathmin=Math.min,_Mathmax=Math.max;if(!channels)return;const r=channels[0]/255,g=channels[1]/255,b=channels[2]/255,min=_Mathmin(r,g,b),max=_Mathmax(r,g,b),lum=(max+min)/2,delta=max-min,sat=.5>lum?delta/(max+min):delta/(2-max-min);let hue;return hue=max===r?(g-b)/delta:max===g?2+(b-r)/delta:4+(r-g)/delta,hue/=6,0>hue&&(hue+=1),[hue||0,sat||0,lum||0]}/**
 * Return a {@link Promise} which auto-resolves after a delay.
 *
 * @param {Number} [delay=100] - Delay in milliseconds
 * @return {Promise}
 */function wait(delay=100){return new Promise(resolve=>{setTimeout(()=>resolve(),delay)})}