"use strict";

const fs           = require("fs");
const path         = require("path");
const print        = require("print");
const CoffeeScript = require("coffee-script");
const {expect}     = require("chai");


const Icon = require("../lib/service/icon.js");

describe("Icon config", () => {
	
	describe("Definitions", () => {
		it("serialises icons as JSON", () => {
			const configPath  = path.join(__dirname, "..", "config.cson");
			const configData  = fs.readFileSync(configPath).toString();
			const {fileIcons} = CoffeeScript.eval(configData);
			
			const icons  = Icon.compile(fileIcons);
			const before = icons;
			const after  = Icon.deserialise(JSON.parse(JSON.stringify(icons)));
			expect(before).to.eql(after);
		});
		
		
		it("merges icons with compatible properties", () => {
			let icons = Icon.compile({
				Foo: {
					icon: "foo",
					match: [
						[".bar", "medium-red", {scope: "c"}],
						[".BAZ", "medium-red"],
						[".quux", "dark-red"]
					]
				}
			});
			expect(icons[0].match).to.eql(/\.bar$|\.BAZ$/i);
			expect(icons[0].colour).to.eql(["medium-red", "medium-red"]);
			expect(icons[0]).to.have.property("scope");
			expect(icons).to.have.lengthOf(2);
			
			icons = Icon.compile({
				Foo: {
					icon: "foo",
					match: [
						[".foo", "red", {matchPath: true}],
						[".bar", "red"]
					]
				}
			});
			expect(icons).to.have.lengthOf(2);
			expect(icons[0].matchPath).to.eql(true);
			expect(icons[1].matchPath).not.to.exist;
			expect("1.foo").to.match(icons[0].match).and.not.match(icons[1].match);
			expect("2.bar").to.match(icons[1].match).and.not.match(icons[0].match);
			
			icons = Icon.compile({
				Foo: {
					icon: "foo",
					match: [
						[".merge", "red", {matchPath: true}],
						[".this",  "red", {matchPath: true}]
					]
				}
			});
			expect(icons).to.have.lengthOf(1);
			expect(icons[0].matchPath).to.be.true;
			expect("hurry/up/and/ship.this").to.match(icons[0].match);
			expect("will/be/good/to.merge").to.match(icons[0].match);
			expect(".this_").not.to.match(icons[0].match);
		});
		
		
		it("honours case-sensitivity", () => {
			const icons = Icon.compile({
				a: {colour: "dark-red", match: /AbC$/},
				b: {colour: "dark-red", match: "AbC"}
			});
			expect("Abc").to.not.match(icons[0].match);
		});
		
		
		it("honours the noFuzz property", () => {
			const icons = Icon.compile({
				"abcXYZ": {match: ".a", noFuzz: true, scope: "xyz"}
			});
			expect("abc-xyz").to.not.match(icons[0].match)
		});
		
		
		it("honours the noSuffix property", () => {
			const icons = Icon.compile({
				a: {icon: "alpha", match: ".a"},
				b: {icon: "beta",  match: ".b", noSuffix: true}
			});
			
			expect(icons[0].icon).to.equal("alpha-icon");
			expect(icons[1].icon).to.equal("beta");
		});
		
		
		it("recognises the matchPath property", () => {
			const icons = Icon.compile({
				a: {match: /a/},
				b: {match: /b/, matchPath: true},
				c: {match: [
					[/c/, null, {matchPath: true}]
				]}
			});
			expect(icons[0].matchPath).not.to.exist;
			expect(icons[1].matchPath).to.exist.and.be.true;
			expect(icons[2].matchPath).to.exist.and.be.true;
		});
		
		
		describe("String patterns", () => {
			it("accepts strings as patterns", () => {
				const icons = Icon.compile({
					a: {match: ".jpg"},
					b: {match: ".jpg", scope: "js"},
					c: {match: ".jpg", scope: "f", alias: "F"},
					d: {match: ".jpg", scope: "g", interpreter: "j"}
				});
				expect(icons[0].match).to.eql(/\.jpg$/i);
				expect(icons[1].scope).to.eql(/\.js$/i);
				expect(icons[2].lang).to.eql(/^c$|^F$/i);
				expect(icons[3].interpreter).to.eql(/^j$/);
			});
			
			it("escapes regex metacharacters", () => {
				const icons = Icon.compile({
					a: {match: "[A-Z]+*.nope"},
					b: {match: "file.js"},
					c: {match: "/foo/bar.var"}
				});
				expect(icons[0].match).to.eql(/\[A-Z\]\+\*\.nope$/i);
				expect(icons[1].match).to.eql(/file\.js$/i);
				expect(icons[2].match).to.eql(/\/foo\/bar\.var$/i);
			});
			
			it("uses platform-agnostic path separators", () => {
				const icons = Icon.compile({
					a: {match: "foo/bar.txt", matchPath: true},
					b: {match: "C:\\foo\\bar.txt", matchPath: true},
					c: {match: /over\/kill\.ott/, matchPath: true}
				});
				expect(icons[0].match).to.eql(/foo[\\\/]bar\.txt$/i);
				expect(icons[1].match).to.eql(/C:[\\\/]foo[\\\/]bar\.txt$/i);
				expect("over\\kill.ott").not.to.match(icons[2].match);
			});
			
			it("leaves path separators alone if matchPath is disabled", () => {
				const icons = Icon.compile({
					a: {match: "foo/bar.txt"},
					b: {match: "C:\\foo\\bar.txt"}
				});
				expect(icons[0].match).to.eql(/foo\/bar\.txt$/i);
				expect(icons[1].match).to.eql(/C:\\foo\\bar\.txt$/i);
			});
			
			it("bestows no special meaning to leading slashes", () => {
				const icons = Icon.compile({
					a: {match: "/etc/php.ini", matchPath: true},
					b: {match: "\\etc\\php.ini", matchPath: true}
				});
				expect("/usr/local/etc/php.ini").to.match(icons[0].match);
				expect("\\usr\\local\\etc\\php.ini").to.match(icons[1].match);
			});
		});
	});
	

	describe("Colours", () => {
		it("stores colours as two values", () => {
			const icons = Icon.compile({
				a: {match: ".foo", colour: "medium-blue"},
				b: {match: ".bar", colour: ["medium-green"]},
				c: {match: ".qux", colour: ["medium-green", "medium-green"]},
				d: {match: ".die"}
			});
			
			icons.forEach(icon => {
				expect(icon.colour).to.be.an("array");
				expect(icon.colour).to.have.lengthOf(2);
			});
			
			expect(icons[3].colour).to.eql([null, null]);
		});
		
		
		it("substitutes auto-colours with correct shades", () => {
			const icons = Icon.compile({
				a: {match: ".foo", colour: "auto-orange"},
				b: {match: ".bar", colour: "auto-green"}
			});
			
			expect(icons[0].colour).to.eql(["medium-orange", "dark-orange"]);
			expect(icons[1].colour).to.eql(["medium-green", "dark-green"]);
		});
	});

	
	describe("Language names", () => {
		it("gives names to language-specific icons", () => {
			const icons = Icon.compile({
				a: {match: ".a", alias: "Alpha"},
				b: {match: ".b", alias: "Beta", scope: "text.fancy"}
			});
			
			expect(icons[0]).not.to.have.property("lang");
			expect(icons[1]).to.have.property("lang");
		});
		
		
		it("includes config keys in language names", () => {
			const icons = Icon.compile({
				JavaScript: {match: ".js", scope: "js", alias: "ECMAScript"},
				AsciiDoc: {
					icon: "asciidoc",
					scope: "asciidoc",
					match: /\.(?:ad|adoc|asc|asciidoc)$/i,
					colour: "medium-blue"
				}
			});
			expect(icons[0].lang).to.eql(/^AsciiDoc$/i);
			expect(icons[1].lang).to.eql(/^JavaScript$|^Ecmascript$/i);
		});
		
		
		it("ignores config keys of generic icons", () => {
			const icons = Icon.compile({
				a: {generic: true, match: ".a", scope: "foo", alias: "x"},
				b: {generic: true, match: ".b", scope: "bar", alias: "y"}
			});
			expect("a").not.to.match(icons[0].lang);
			expect("b").not.to.match(icons[1].lang);
		});
	});

	
	
	describe("Ordering", () => {
		it("sorts icons by priority", () => {
			const config = {
				a: {match: ".a", colour: "medium-red"},
				z: {match: ".z", colour: "dark-green", priority: 2}
			};
			
			expect(Icon.compile(config)[0].colour[0]).to.equal("dark-green");
			config.z.priority = -2;
			expect(Icon.compile(config)[0].colour[0]).to.equal("medium-red");
		});
		
		
		it("alphabetises icons of equal priority", () => {
			const icons = Icon.compile({
				z: {match: ".z", priority: 2},
				a: {match: ".a", priority: 2},
				j: {match: ".j", priority: 2}
			});
			expect(".a").to.match(icons[0].match);
			expect(".j").to.match(icons[1].match);
			expect(".z").to.match(icons[2].match);
		});
		
		
		it("matches icons with 0 priority last", () => {
			const icons = Icon.compile({
				a: {match: ".a", priority: 0},
				b: {match: ".b", priority: 1}
			});
			expect(".b").to.match(icons[0].match);
		});
	});
});
