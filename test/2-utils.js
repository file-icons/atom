"use strict";

describe("Utilities", () => {
	
	describe("General-purpose functions", () => {
		const utils = require("../lib/utils/general.js");
		
		describe("isString()", () => {
			const {isString} = utils;
			it("identifies literals",   () => void expect(isString("foo")).to.be.true);
			it("identifies objects",    () => void expect(isString(new String("foo"))).to.be.true);
			it("identifies subclasses", () => {
				class IndentedString extends String {
					constructor(source){
						super((source + "").replace(/^/g, "\t"));
					}
				}
				const str = new IndentedString("A");
				expect(str).to.match(/^\tA$/);
				expect(isString(str)).to.be.true;
			});
		});
		
		describe("isRegExp()", () => {
			const {isRegExp} = utils;
			it("identifies literals",   () => void expect(isRegExp(/A/)).to.be.true);
			it("identifies objects",    () => void expect(isRegExp(new RegExp("A"))).to.be.true);
			it("identifies subclasses", () => {
				class ExtendedRegExp extends RegExp {
					constructor(source, flags){
						source = source
							.replace(/\[[^\]]+\]/g, s => s
								.replace(/ /, "\\x20")
								.replace(/\t/, "\\t"))
							.replace(/\s+/g, "");
						super(source, flags);
						
						Object.defineProperty(this, "source", {
							get: () => source
						});
					}
				}
				const regexp = new ExtendedRegExp("^ A B C $");
				expect("ABC").to.match(regexp);
				expect(isRegExp(regexp)).to.be.true;
			});
		});
		
		describe("isNumeric()", () => {
			const {isNumeric} = utils;
			it("allows numeric arguments",      () => void expect(isNumeric(0xBABEFACE)).to.be.true);
			it("recognises positive integers",  () => void expect(isNumeric("45")).to.be.true);
			it("recognises negative integers",  () => void expect(isNumeric("-5")).to.be.true);
			it("recognises positive floats",    () => void expect(isNumeric("2.5")).to.be.true);
			it("recognises negative floats",    () => void expect(isNumeric("-2.5")).to.be.true);
			it("recognises basic numbers only", () => {
				expect(isNumeric("0b10100100")).to.be.false;
				expect(isNumeric("0xBABEFACE")).to.be.false;
				expect(isNumeric("3.1536e+10")).to.be.false;
				expect(isNumeric("0xAF")).to.be.false;
			});
		});
		
		describe("escapeRegExp()", () => {
			const {escapeRegExp} = utils;
			it("escapes backslashes",       () => void expect(escapeRegExp("\\")).to.equal("\\\\"));
			it("escapes metacharacters",    () => void expect(escapeRegExp("$")).to.equal("\\$"));
			it("escapes character classes", () => void expect(escapeRegExp("[ABC]")).to.equal("\\[ABC\\]"));
			it("escapes capturing groups",  () => void expect(escapeRegExp("(A)")).to.equal("\\(A\\)"));
			it("escapes source accurately", () => {
				const pattern = /^ember(?:\.|(?:-[^.]+)?-(?:\d+\.)+(?:debug\.)?)js$/i;
				const source = escapeRegExp(pattern.source);
				expect(new RegExp(source).test(pattern.source)).to.be.true;
			});
		});
		
		describe("fuzzyRegExp()", () => {
			const fuzz = utils.fuzzyRegExp;
			it("returns case-insensitive patterns",          () => void expect("abc")    .to.match(fuzz("aBc")));
			it('fuzzes the letter "O" to match zeroes',      () => void expect("f0o")    .to.match(fuzz("foo")));
			it("fuzzes word boundaries to match hyphens",    () => void expect("abc-xyz").to.match(fuzz("abc xyz")));
			it("fuzzes word boundaries to match whitespace", () => void expect("abc xyz").to.match(fuzz("abc-xyz")));
			it("treats camelCase/PascalCase as boundaries",  () => void expect("abc xyz").to.match(fuzz("abcXyz")));
			it("treats stylised caps as word boundaries",    () => void expect("d-base") .to.match(fuzz("dBASE")));
			it("makes boundary separators optional",         () => void expect("abcxyz") .to.match(fuzz("ABC-XYZ")));
			it("makes punctuation optional",                 () => void expect("abc")    .to.match(fuzz("A.B.C.")));
		});
		
		describe("caseKludge()", () => {
			const {caseKludge} = utils;
			it("generates case-insensitive regex source", () => {
				const pattern = new RegExp(`^(ABC|${caseKludge("DEF")})`);
				expect("dEf").to.match(pattern);
				expect("aBc").not.to.match(pattern);
			});
			
			it("fuzzes word boundaries", () => {
				const source = caseKludge("camelCase", true);
				const pattern = new RegExp(`^abc: ${source}$`);
				expect("abc: camelCASE").to.match(pattern);
				expect("abc: camel-CASE").to.match(pattern);
				expect("ABC: camel-CASE").not.to.match(pattern);
			});
			
			it("allows multiple separators between fuzzed boundaries", () => {
				const source = caseKludge("camelCase", true);
				const pattern = new RegExp(`^abc: ${source}$`);
				expect("abc: camel----CASE").to.match(pattern);
				expect("abc: camel--CA").not.to.match(pattern);
			});
		});
		
		describe("punch()", () => {
			const {punch} = utils;
			
			class Example {
				constructor(name){ this.name = name; }
				count(a, b, c){ return a + b + c; }
				getName(){ return this.name; }
			}
			
			it("replaces methods", () => {
				const obj = new Example("A");
				expect(obj.getName()).to.equal("A");
				punch(obj, "getName", () => "B");
				expect(obj.getName()).to.equal("B");
			});
			
			it("allows handlers to call the original method", () => {
				const obj = new Example("A");
				punch(obj, "count", fn => fn() + fn());
				expect(obj.count(1, 2, 3)).to.equal(12);
			});
			
			it("gives handlers access to the original arguments", () => {
				const obj = new Example("A");
				punch(obj, "count", (fn, args) => +([...args].join("")) + fn());
				expect(obj.count(1, 2, 3)).to.equal(129);
			});
			
			it("returns the original method in an array", () => {
				const obj = new Example("A");
				const oldMethod = obj.getName;
				const methods = punch(obj, "getName", () => {});
				expect(methods).to.be.an("array");
				expect(methods).to.have.lengthOf(2);
				expect(methods[0]).to.equal(oldMethod);
			});
		});
	});


	describe("Filesystem functions", () => {
		const utils = require("../lib/utils/fs.js");
		const fs = require("fs");
		
		describe("statify()", () => {
			const {statify} = utils;
			const plainStats = {
				dev: 16777220,
				mode: 33188,
				nlink: 1,
				uid: 501,
				gid: 20,
				rdev: 0,
				blksize: 4096,
				ino: 175025642,
				size: 1104,
				blocks: 8,
				atime: 1481195566000,
				mtime: 1481195249000,
				ctime: 1481195249000,
				birthtime: 1481192516000
			};
			
			it("converts plain objects into fs.Stats instances", () => {
				const obj = statify(plainStats);
				expect(obj.constructor).to.equal(fs.Stats);
			});
			
			it("leaves actual fs.Stats instances untouched", () => {
				const realStats = Object.freeze(fs.lstatSync(__filename));
				const statified = statify(realStats);
				expect(realStats).to.equal(statified);
			});
			
			it("retains accurate timestamps", () => {
				const obj = statify(plainStats);
				expect(obj.atime).to.be.a("date");
				expect(obj.mtime).to.be.a("date");
				expect(obj.ctime).to.be.a("date");
				expect(obj.birthtime).to.be.a("date");
				expect(obj.atime.getTime()).to.equal(1481195566000);
				expect(obj.mtime.getTime()).to.equal(1481195249000);
				expect(obj.ctime.getTime()).to.equal(1481195249000);
				expect(obj.ctime.getTime()).not.to.equal(1481195249001);
				expect(obj.birthtime.getTime()).to.equal(1481192516000);
			});
			
			it("retains accurate mode-checking methods", () => {
				const modeChecks = {
					isBlockDevice:     0b0110000110100000,
					isCharacterDevice: 0b0010000110110110,
					isDirectory:       0b0100000111101101,
					isFIFO:            0b0001000110100100,
					isFile:            0b1000000111101101,
					isSocket:          0b1100000111101101,
					isSymbolicLink:    0b1010000111101101
				};
				
				for(const methodName in modeChecks){
					const mode = modeChecks[methodName];
					const stat = statify(Object.assign({}, plainStats, {mode}));
					expect(stat.mode, methodName).to.equal(mode);
					expect(stat[methodName], methodName).to.be.a("function");
					expect(stat[methodName](), `${methodName}(${mode})`).to.be.true;
				}
			});
		});
		
		describe("sampleFile()", () => {
			const {sampleFile} = utils;
			const path = require("path");
			
			it("reads partial data from the filesystem", () => {
				const [dataSample] = sampleFile(__filename, 10);
				expect(dataSample).to.equal('"use stric');
			});
			
			it("indicates if a file was fully-loaded", () => {
				const results = sampleFile(__filename, 1);
				expect(results).to.be.an("array");
				expect(results).to.have.lengthOf(2);
				expect(results[1]).to.be.false;
			});
			
			it("allows reading from an arbitrary offset", () => {
				const [dataSample] = sampleFile(__filename, 10, 1);
				expect(dataSample).to.equal("use strict");
			});
			
			it("trims extra bytes if content is shorter than sample limit", () => {
				const imagePath = path.resolve(__dirname, "fixtures/basic/image.gif");
				const [dataSample] = sampleFile(imagePath, 100);
				expect(dataSample).to.have.lengthOf(42);
			});
		});
	});


	describe("MappedDisposable class", () => {
		const MappedDisposable = require("../lib/utils/mapped-disposable.js");
		const {CompositeDisposable, Disposable} = require("atom");
		
		it("can be constructed with an iterable", () => {
			const disposable1 = new Disposable();
			const disposable2 = new Disposable();
			const disposable3 = new CompositeDisposable();
			const map = new MappedDisposable([
				[{name: "foo"}, disposable1],
				[{name: "bar"}, disposable2],
				[{name: "baz"}, disposable3]
			]);
			map.dispose();
			expect(disposable1.disposed).to.be.true;
			expect(disposable2.disposed).to.be.true;
			expect(disposable3.disposed).to.be.true;
		});
		
		it("can be constructed without an iterable", () => {
			const map = new MappedDisposable();
			expect(map.disposed).to.be.false;
			map.dispose();
			expect(map.disposed).to.be.true;
		});
		
		it("embeds ordinary disposables in CompositeDisposables", () => {
			const disposable1 = new Disposable();
			const disposable2 = new CompositeDisposable();
			const map = new MappedDisposable([
				["foo", disposable1],
				["bar", disposable2]
			]);
			expect(map.get("foo")).to.be.instanceof(CompositeDisposable);
			expect(map.get("bar")).to.equal(disposable2);
		});
		
		it("allows disposables to be added to keys", () => {
			const key = {};
			const cd1 = new CompositeDisposable();
			const cd2 = new CompositeDisposable();
			const cd3 = new CompositeDisposable();
			const map = new MappedDisposable([ [key, cd1] ]);
			expect(map.get(key)).to.equal(cd1);
			map.add(key, cd2);
			expect(cd1.disposables.size).to.equal(1);
			map.add("foo", cd3);
			expect(map.size).to.equal(2);
			map.dispose();
			expect(map.disposed).to.be.true;
			expect(cd1.disposed).to.be.true;
			expect(cd2.disposed).to.be.true;
		});
		
		it("allows disposables to be removed from keys", () => {
			const key = {};
			const cd1 = new CompositeDisposable();
			const cd2 = new CompositeDisposable();
			const cd3 = new CompositeDisposable();
			const cd4 = new CompositeDisposable();
			const cd5 = new CompositeDisposable();
			const map = new MappedDisposable([ [key, cd1] ]);
			map.add(key, cd2, cd3, cd4, cd5);
			expect(cd1.disposables.size).to.equal(4);
			map.remove(key, cd3, cd5);
			expect(cd1.disposables.size).to.equal(2);
			map.dispose();
			expect(map.disposed).to.be.true;
			expect(cd1.disposed).to.be.true;
			expect(cd2.disposed).to.be.true;
			expect(cd3.disposed).to.be.false;
			expect(cd4.disposed).to.be.true;
			expect(cd5.disposed).to.be.false;
		});
		
		it("allows other MappedDisposables to be added to keys", () => {
			const disposable = new Disposable();
			const map1 = new MappedDisposable([ ["foo", disposable] ]);
			const map2 = new MappedDisposable([ ["bar", map1] ]);
			expect(map1.get("foo").disposables.has(disposable)).to.be.true;
			expect(map2.get("bar").disposables.has(map1)).to.be.true;
			map2.dispose();
			expect(disposable.disposed).to.be.true;
			expect(map1.disposed).to.be.true;
			expect(map2.disposed).to.be.true;
		});
		
		it("reports accurate entry count", () => {
			const map = new MappedDisposable();
			expect(map.size).to.equal(0);
			map.add("foo", new Disposable());
			expect(map.size).to.equal(1);
			map.add("foo", new Disposable());
			map.add("bar", new Disposable());
			expect(map.size).to.equal(2);
			map.delete("foo");
			expect(map.size).to.equal(1);
			map.dispose();
			expect(map.size).to.equal(0);
		});
		
		it("deletes keys when disposing them", () => {
			const key = {};
			const cd1 = new CompositeDisposable();
			const map = new MappedDisposable([ [key, cd1] ]);
			map.delete(key);
			expect(map.has(key)).to.be.false;
			expect(map.get(key)).to.be.undefined;
			map.dispose();
			expect(cd1.disposed).to.be.false;
		});
		
		it("deletes all keys when disposed", () => {
			const map = new MappedDisposable([
				["foo", new Disposable()],
				["bar", new Disposable()]
			]);
			expect(map.has("foo")).to.be.true;
			expect(map.has("bar")).to.be.true;
			map.dispose();
			expect(map.has("foo")).to.be.false;
			expect(map.has("bar")).to.be.false;
			expect(map.size).to.equal(0);
		});
		
		it("allows a disposable list to be replaced with another", () => {
			const cd1 = new CompositeDisposable();
			const cd2 = new CompositeDisposable();
			const key = {};
			const map = new MappedDisposable([[key, cd1]]);
			map.set(key, cd2);
			expect(map.get(key)).to.equal(cd2);
			expect(map.get(key).disposables.has(cd1)).to.be.false;
			map.dispose();
			expect(cd1.disposed).to.be.false;
			expect(cd2.disposed).to.be.true;
		});
		
		it("throws an error when setting a value to a non-disposable", () => {
			expect(() => {
				const key = {};
				const map = new MappedDisposable([ [key, new Disposable()] ]);
				map.set(key, {});
			}).to.throw("Value must have a .dispose() method");
		});
	});
	
	
	describe("PatternMap class", () => {
		const {PatternMap} = require("../lib/utils/pattern-lists.js");
		
		describe("Construction", () => {
			it("can be constructed with an iterable", () => {
				const iterable = [
					[/A/, 1],
					[/B/, 2],
					[/C/, 3]
				];
				const map = new PatternMap(iterable);
				expect(map.size).to.equal(3);
				expect(map.get(iterable[0][0])).to.equal(1);
				expect(map.get(iterable[1][0])).to.equal(2);
				expect(map.get(iterable[2][0])).to.equal(3);
			});
			
			it("can be constructed without an iterable", () => {
				expect(new PatternMap().size).to.equal(0);
				expect(new PatternMap([]).size).to.equal(0);
			});
		});
		
		describe("Identicality", () => {
			it("uses existing keys when matching expressions exist", () => {
				const obj1 = {};
				const obj2 = {};
				const obj3 = {};
				const obj4 = {};
				const map = new PatternMap([
					[/A/, obj1],
					[/B/, obj2],
					[/C/, obj3],
					[/E/, null]
				]);
				expect(map.size).to.equal(4);
				expect(map.has(/A/)).to.be.true;
				expect(map.has(/B/)).to.be.true;
				expect(map.has(/C/)).to.be.true;
				expect(map.has(/D/)).to.be.false;
				expect(map.get(/A/)).to.equal(obj1);
				expect(map.get(/B/)).to.equal(obj2);
				expect(map.get(/C/)).to.equal(obj3);
				expect(map.get(/D/)).to.be.undefined;
				expect(map.get(/E/)).to.be.null;
				map.set(/A/, obj4);
				map.set(/B/, obj3);
				map.set(/C/, obj1);
				map.set(/D/, obj2);
				map.set(/E/, obj1);
				expect(map.size).to.equal(5);
				expect(map.get(/A/)).to.equal(obj4);
				expect(map.get(/B/)).to.equal(obj3);
				expect(map.get(/C/)).to.equal(obj1);
				expect(map.get(/D/)).to.equal(obj2);
				expect(map.get(/E/)).to.equal(obj1);
				expect(map.delete(/D/)).to.be.true;
				expect(map.delete(/B/)).to.be.true;
				expect(map.delete(/D/)).to.be.false;
				expect(map.size).to.equal(3);
				expect(map.get(/D/)).to.be.undefined;
			});
			
			it("acknowledges flags when distinguishing expressions", () => {
				const map = new PatternMap([
					[/A/, 1],
					[/A/, "foo"]
				]);
				expect(map.size).to.equal(1);
				expect(map.get(/A/)).to.equal("foo");
				map.set(/A/, "bar");
				expect(map.get(/A/)).to.equal("bar");
				expect(map.has(/A/i)).not.to.be.true;
				map.set(/A/i, "baz");
				expect(map.has(/A/i)).to.be.true;
				expect(map.has(/A/g)).not.to.be.true;
				expect(map.size).to.equal(2);
				expect(map.get(/A/)).to.equal("bar");
				expect(map.get(/A/i)).to.equal("baz");
				map.set(/A/i, 90);
				expect(map.get(/A/i)).to.equal(90);
				map.delete(/A/i);
				expect(map.get(/A/)).to.exist.and.to.equal("bar");
				expect(map.get(/A/i)).to.be.undefined;
				expect(map.size).to.equal(1);
				map.delete(/A/);
				expect(map.size).to.equal(0);
				expect(map.get(/A/)).to.be.undefined;
			});
			
			it("stringifies keys before comparison", () => {
				const map = new PatternMap([[/A/, 1]]);
				expect(map.get("/A/")).to.equal(1);
				expect(map.get(/A/)).to.equal(1);
				expect(map.size).to.equal(1);
			});
			
			it("references only the first RegExp object for a key", () => {
				const re1 = /A/;
				const re2 = /A/;
				const map = new PatternMap([[re1, 1]]);
				map.set(re2, 2);
				expect(map.size).to.equal(1);
				expect(map.get(/A/)).to.equal(2);
				for(const [key] of map){
					expect(key).to.equal(re1);
					expect(key).not.to.equal(re2);
				}
				map.clear();
				expect(map.size).to.equal(0);
				expect(map.get(/A/)).to.be.undefined;
			});
		});
		
		describe("Validation", () => {
			const error = "PatternMap keys must be regular expressions";
			const empty = undefined;
			const obj   = {match: text => [text]};
			const re    = new RegExp("^A$", "i");
				
			it("throws an error if initialised with non-RegExp keys", () => {
				expect(_=> new PatternMap([ [empty, 1] ])).not.to.throw(error);
				expect(_=> new PatternMap([ [re,    1] ])).not.to.throw(error);
				expect(_=> new PatternMap([ [false, 1] ])).to.throw(error);
				expect(_=> new PatternMap([ [true,  1] ])).to.throw(error);
				expect(_=> new PatternMap([ [obj,   1] ])).to.throw(error);
				expect(_=> new PatternMap([ [200,   1] ])).to.throw(error);
			});
			
			it("throws an error when assigning non-RegExp keys", () => {
				const map = new PatternMap();
				expect(_=> map.set(false, 1)).to.throw(error);
				expect(_=> map.set(true,  1)).to.throw(error);
				expect(_=> map.set(re,    1)).not.to.throw(error);
				expect(_=> map.set(/A/,   1)).not.to.throw(error);
				expect(_=> map.set(200,   1)).to.throw(error);
			});
			
			it("returns undefined if reading an invalid key", () => {
				const map = new PatternMap([[/A/, 1]]);
				expect(map.get("foo")).to.be.undefined;
			});
		});
		
		describe("Iteration", () => {
			const entries = Object.freeze([
				[/A/, 1],
				[/[BCD]/g, {foo: "bar"}],
				[/(?:\d+\.)?\d+|(?:\d+\.?)(?!\d[.])/, Number]
			]);
			
			it("uses RegExp keys when converted to an Array", () => {
				const map = new PatternMap(entries);
				expect(map.size).to.equal(3);
				expect(Array.from(map)).to.eql(entries);
			});
			
			it("uses RegExp keys in for..of loops", () => {
				const map = new PatternMap(entries);
				let count = 0;
				for(const [key, value] of map){
					expect(key).to.be.instanceof(RegExp);
					expect(map.get(key)).to.equal(value);
					++count;
				}
				expect(map.size).to.equal(3);
				expect(count).to.equal(3);
				for(const entry of map){
					expect(entry[0]).to.be.instanceof(RegExp);
					expect(map.get(entry[0])).to.equal(entry[1]);
					++count;
				}
				expect(count).to.equal(6);
			});
			
			it("uses RegExp keys in iterables returned from Map methods", () => {
				const map = new PatternMap(entries);
				const keys = map.keys();
				const ents = map.entries();
				let iterations = 0;
				for(const key of keys){
					expect(key).to.be.instanceof(RegExp);
					++iterations;
				}
				expect(iterations).to.equal(3);
				iterations = 0;
				const values = Array.from(map.values());
				for(const entry of ents){
					expect(entry[0]).to.be.instanceof(RegExp);
					expect(map.get(entry[0])).to.equal(entry[1]);
					expect(values[iterations]).to.equal(entry[1]);
					++iterations;
				}
				expect(iterations).to.equal(3);
			});
		});
		
		describe("String matching", () => {
			it("returns the matched key and its results by default", () => {
				const key = /^A:(XYZ)$|^A(:)(\d{3})$/;
				const map = new PatternMap([ [key, true] ]);
				
				let input = "A:XYZ";
				let match = [key, [input, "XYZ", undefined, undefined]];
				match[1].index = 0;
				match[1].input = input;
				expect(map.match(input)).to.eql(match);
				expect(map.match("a:xyz")).to.be.null;
				
				input = "A:123";
				match[1] = [input, undefined, ":", "123"];
				match[1].index = 0;
				match[1].input = input;
				expect(map.match(input)).to.eql(match);
				expect(map.match("-XYZ-")).to.be.null;
			});
			
			it("returns every matching key/result if second argument is set", () => {
				const map = new PatternMap([
					[/A|B|C/, 1],
					[/1|2|3/, 2],
					[/xYz$/i, 3]
				]);
				expect(map.match("Nah", true)).to.eql([]);
				const input = "ABCDEFGHIJKL... 2, 1, 3, xYz MNOPQRSTUxYZ";
				const match = map.match(input, true);
				expect(match).to.eql([
					[/A|B|C/, Object.assign(["A"],   {index:  0, input})],
					[/1|2|3/, Object.assign(["2"],   {index: 16, input})],
					[/xYz$/i, Object.assign(["xYZ"], {index: 38, input})]
				]);
			});
		});
	});


	describe("PatternSet class", () => {
		const {PatternSet} = require("../lib/utils/pattern-lists.js");
		
		describe("Construction", () => {
			it("can be constructed with an iterable", () => {
				const iterable = [/A/, /B/, /C/];
				const set = new PatternSet(iterable);
				expect(set.size).to.equal(3);
				expect(set.has(iterable[0])).to.be.true;
				expect(set.has(iterable[1])).to.be.true;
				expect(set.has(iterable[2])).to.be.true;
			});
			
			it("can be constructed without an iterable", () => {
				expect(new PatternSet().size).to.equal(0);
				expect(new PatternSet([]).size).to.equal(0);
			});
		});
		
		describe("Identicality", () => {
			it("doesn't add duplicate expressions", () => {
				const set = new PatternSet([/A/, /B/, /C/]);
				expect(set.size).to.equal(3);
				expect(set.add(/A/).size).to.equal(3);
				expect(set.add(/D/).size).to.equal(4);
				expect(set.has(/D/)).to.be.true;
				expect(set.has(/A/)).to.be.true;
				expect(set.has(/E/)).to.be.false;
			});
			
			it("deletes matching expressions", () => {
				const set = new PatternSet([/A/, /B/, /C/]);
				expect(set.size).to.equal(3);
				expect(set.delete(/B/)).to.be.true;
				expect(set.size).to.equal(2);
				expect(set.delete(/D/)).to.be.false;
				expect(set.delete(/B/)).to.be.false;
				expect(set.has(/B/)).to.be.false;
				expect(set.size).to.equal(2);
				expect(set.delete(/A/)).to.be.true;
				expect(set.has(/A/)).to.be.false;
				expect(set.size).to.equal(1);
			});
			
			it("acknowledges flags when distinguishing expressions", () => {
				const set = new PatternSet([ /A/, /B/i ]);
				expect(set.add(/A/).size).to.equal(2);
				expect(set.has(/A/i)).to.be.false;
				expect(set.add(/A/i).size).to.equal(3);
				expect(set.has(/A/g)).to.be.false;
				expect(set.has(/B/)).to.be.false;
				expect(set.delete(/B/)).to.be.false;
				expect(set.delete(/B/i)).to.be.true;
				expect(set.size).to.equal(2);
			});
			
			it("stringifies values before comparison", () => {
				const set = new PatternSet([ /A/ ]);
				expect(set.has("/A/")).to.be.true;
				expect(set.has(/A/)).to.be.true;
				expect(set.size).to.equal(1);
				expect(set.delete("/A/")).to.be.true;
				expect(set.delete(/A/)).to.be.false;
				expect(set.size).to.equal(0);
			});
			
			it("references only the first RegExp for a pattern", () => {
				const re1 = /A/;
				const re2 = /A/;
				const set = new PatternSet();
				expect(set.add(re1).size).to.equal(1);
				expect(set.add(re2).size).to.equal(1);
				expect([...set.keys()][0]).to.equal(re1);
				for(const value of set){
					expect(value).to.equal(re1);
					expect(value).not.to.equal(re2);
				}
				set.clear();
				expect(set.size).to.equal(0);
				expect(set.has(/A/)).to.be.false;
				expect(set.has(re1)).to.be.false;
			});
		});
		
		describe("Validation", () => {
			const error = "Values added to a PatternSet must be regular expressions";
			const empty = undefined;
			const obj   = {match: text => [text]};
			const re    = new RegExp("^A$", "i");
				
			it("throws an error if initialised with non-RegExp values", () => {
				expect(_=> new PatternSet([ empty ])).not.to.throw(error);
				expect(_=> new PatternSet([ re    ])).not.to.throw(error);
				expect(_=> new PatternSet([ false ])).to.throw(error);
				expect(_=> new PatternSet([ true  ])).to.throw(error);
				expect(_=> new PatternSet([ obj   ])).to.throw(error);
				expect(_=> new PatternSet([ 200   ])).to.throw(error);
			});
			
			it("throws an error when adding non-RegExp values", () => {
				const set = new PatternSet();
				expect(_=> set.add( false )).to.throw(error);
				expect(_=> set.add( true  )).to.throw(error);
				expect(_=> set.add( re    )).not.to.throw(error);
				expect(_=> set.add( /A/   )).not.to.throw(error);
				expect(_=> set.add( 200   )).to.throw(error);
			});
			
			it("returns false if testing for the existence of an invalid key", () => {
				const set = new PatternSet([/A/, /B/]);
				expect(set.has("foo")).to.be.false;
			});
		});
		
		describe("Iteration", () => {
			const patterns = Object.freeze([/A/, /B/, /C/, /D/]);
			
			it("returns patterns as RegExp objects when cast to an Array", () => {
				const set = new PatternSet(patterns);
				const array = Array.from(set);
				expect(set.size).to.equal(4);
				expect(array).to.have.lengthOf(4).and.to.eql(patterns);
			});
			
			it("uses RegExp values when iterating through for..of loops", () => {
				const set = new PatternSet(patterns);
				for(const value of set)
					expect(value).to.be.instanceOf(RegExp);
			});
			
			it("uses RegExp values when iterating with Set methods", () => {
				const set = new PatternSet(patterns);
				expect(Array.from(set.values())).to.eql(patterns);
				expect(Array.from(set.keys())).to.eql(patterns);
				let index = 0;
				for(const entry of set.entries()){
					expect(entry[0]).to.be.instanceOf(RegExp);
					expect(entry[1]).to.be.instanceOf(RegExp);
					expect(entry[0]).to.equal(entry[1]);
					++index;
				}
				expect(index).to.equal(4);
			});
		});
		
		describe("String matching", () => {
			const patterns = Object.freeze([/(A|B|C)/, /1|2|3/, /xYz$/i]);
			
			it("returns the matched value and its results by default", () => {
				const set = new PatternSet(patterns);
				let input = "AOK";
				let index = 0;
				expect(set.size).to.equal(3);
				expect(set.match("Nah")).to.be.null;
				expect(set.match(input)).to.eql([
					patterns[0],
					Object.assign(["A", "A"], {index, input})
				]);
			});
			
			it("returns every matched value/result pair if second argument is set", () => {
				const set = new PatternSet(patterns);
				expect(set.match("Nah", true)).to.eql([]);
				const input = "ABCDEFGHIJKL... 2, 1, 3, xYz MNOPQRSTUxYZ";
				const match = set.match(input, true);
				expect(match).to.eql([
					[/(A|B|C)/, Object.assign(["A", "A"], {index:  0, input})],
					[/1|2|3/,   Object.assign(["2"],      {index: 16, input})],
					[/xYz$/i,   Object.assign(["xYZ"],    {index: 38, input})]
				]);
			});
		});
	});
});
