"use strict";

const utils = require("../lib/utils.js");

describe("Utility functions", () => {
	describe("Regular expressions", () => {
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
