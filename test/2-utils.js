"use strict";

const {expect} = require("chai");
const utils = require("../lib/utils.js");


describe("Utility functions", () => {
	describe("Regular expressions", () => {
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

		describe("forceNonCapturing()", () => {
			const force = utils.forceNonCapturing;
			it("converts capturing groups into non-capturing", () => expect(force(/AA(BB)AA/)).to.eql(/AA(?:BB)AA/));
			it("normalises existing non-capturing groups",     () => expect(force(/AA(?:BB)AA/)).to.eql(/AA(?:BB)AA/));
			it("retains the original expression's flags",      () => expect(force(/B(ie)n/muy)).to.eql(/B(?:ie)n/muy));
			it("retains lookaheads/lookbehinds",               () => expect(force(/A(?=B)C/)).to.eql(/A(?=B)C/));
			it("avoids changing brackets that are escaped",    () => expect(force(/AA\(BB\)AA/)).to.eql(/AA\(BB\)AA/));
			it("can handle escaped brackets inside groups",    () => expect(force(/A(\(B\)\\)D/)).to.eql(/A(?:\(B\)\\)D/));
			it("can handle trailing escapes",                  () => expect(force(/AA\\\(BB\)\\/)).to.eql(/AA\\\(BB\)\\/));
			it("can handle escaped non-capturing groups",      () => expect(force(/AA\(\?:BB\)C/)).to.eql(/AA\(\?:BB\)C/));
			it('doesn\'t suffer "leaning toothpick syndrome"', () => {
				expect(force(/A\\(\(B\\)\)C/)).to.eql(/A\\(?:\(B\\)\)C/);
				expect(force(/A\\(\(B\\)\)C/)).to.eql(/A\\(?:\(B\\)\)C/);
				expect(force(/A\\\\\(B\)\\\\/)).to.eql(/A\\\\\(B\)\\\\/);
				expect(force(/A\\\\\\\(B\)\\\\\\/)).to.eql(/A\\\\\\\(B\)\\\\\\/);
				expect(force(/A\\(B\\)C/)).to.eql(/A\\(?:B\\)C/);
				expect(force(/A\\\\(B\\\\)C/)).to.eql(/A\\\\(?:B\\\\)C/);
				expect(force(/A\\\\\\(B\\\\\\)C/)).to.eql(/A\\\\\\(?:B\\\\\\)C/);
				expect(force(/A\\\\\\\\(B\\\\\\)C/)).to.eql(/A\\\\\\\\(?:B\\\\\\)C/);
				expect(force(/A\\(\(\\)\)C/)).to.eql(/A\\(?:\(\\)\)C/);
				expect(force(/A\\(\(\\)\)C/)).to.eql(/A\\(?:\(\\)\)C/);
				expect(force(/A\\\\\(\)\\\\/)).to.eql(/A\\\\\(\)\\\\/);
				expect(force(/A\\\\\\\(\)\\\\\\/)).to.eql(/A\\\\\\\(\)\\\\\\/);
				expect(force(/\\(\\)/)).to.eql(/\\(?:\\)/);
				expect(force(/\\\\(\\\\)/)).to.eql(/\\\\(?:\\\\)/);
				expect(force(/\\\\\\(\\\\\\)/)).to.eql(/\\\\\\(?:\\\\\\)/);
				expect(force(/\\\\\\\\(\\\\\\)/)).to.eql(/\\\\\\\\(?:\\\\\\)/);
				expect(force(/\(\\(\\)/)).to.eql(/\(\\(?:\\)/);
				expect(force(/\\(\\(\\(\\\(\\\\(\\)\)\\)\\)\\)\\\/\)/)).to.eql(/\\(?:\\(?:\\(?:\\\(\\\\(?:\\)\)\\)\\)\\)\\\/\)/);
			});
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
	});
});
