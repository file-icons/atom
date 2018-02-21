"use strict";

const {FileSystem}     = require("atom-fs");
const Options          = require("../lib/options.js");
const LinguistStrategy = require("../lib/service/strategies/linguist-strategy.js");
const {assertIconClasses, open, replaceText, resolvePath, revert, setup, wait} = require("./utils");
const TreeView         = require("./utils/tree-view.js");
const Tabs             = require("./utils/tabs.js");


describe("Linguist-language attributes", () => {
	const base = "name icon ";
	
	before(async () => {
		await setup("4.4-linguist");
		TreeView.visible = true;
		TreeView.refresh();
		TreeView.entries.should.not.be.empty;
		TreeView.entries.should.have.lengthOf.at.least(3);
	});
	
	after(function(){
		if(this._runnable.parent.bail){
			const counter = document.querySelector("#mocha-failures");
			if(counter && +counter.dataset.value)
				return;
		}
		const editor = atom.workspace.getActiveTextEditor();
		editor && revert(editor);
		Tabs.closeAll();
	});
	
	
	when("a folder contains a .gitattributes file", () => {
		it("scans its full content for `linguist-language` attributes", () => {
			const attrFile = FileSystem.get(resolvePath(".gitattributes"));
			attrFile.isDataComplete.should.be.true;
			attrFile.watchingSystem.should.be.true;
			LinguistStrategy.rules.size.should.equal(3);
		});
	});
	
	when("language attributes are present", () => {
		it("applies them to affected file paths", () => {
			TreeView.entries["a.feather"].should.have.classes(base + "apache-icon dark-red");
			TreeView.entries["not-js.es"].should.have.classes(base + "erlang-icon medium-red");
			TreeView.entries["not-js.es.swp"].should.have.classes(base + "apl-icon dark-cyan");
			TreeView.entries["not-js.es"].should.not.have.class("js-icon medium-yellow");
			TreeView.entries["not-js.es.swp"].should.not.have.class("erlang-icon medium-red");
		});
		
		it("resolves paths relative to the file which defines them", () => {
			TreeView.expand("perl");
			TreeView.refresh();
			assertIconClasses(TreeView.entries, [
				["not-js.es",         base + "erlang-icon medium-red"],
				["not-js.es.swp",     base + "apl-icon    dark-cyan"],
				["perl/butterfly.pl", base + "perl6-icon  medium-purple"],
				["perl/camel.pl6",    base + "perl-icon   medium-blue"]
			]);
		});
	});
	
	when("language attributes are changed", () =>
		it("updates affected files", async () => {
			await open(".gitattributes");
			await replaceText(/Erlang/, "Eiffel");
			await wait(150);
			
			TreeView.refresh();
			TreeView.entries["a.feather"].should.have.classes(base + "apache-icon dark-red");
			TreeView.entries["not-js.es"].should.have.classes(base + "eiffel-icon medium-cyan");
			TreeView.entries["not-js.es"].should.not.have.classes("js-icon medium-yellow");
			TreeView.entries["not-js.es.swp"].should.have.classes(base + "apl-icon dark-cyan");
			TreeView.entries["not-js.es"].should.not.have.classes("erlang-icon medium-red");
			
			await revert();
			await wait(150);
			TreeView.refresh();
			TreeView.entries["a.feather"].should.have.classes(base + "apache-icon dark-red");
			TreeView.entries["not-js.es"].should.have.classes(base + "erlang-icon medium-red");
			TreeView.entries["not-js.es"].should.not.have.classes("eiffel-icon medium-cyan");
			TreeView.entries["not-js.es"].should.not.have.classes("js-icon medium-yellow");
			TreeView.entries["not-js.es.swp"].should.have.classes(base + "apl-icon dark-cyan");
			
			await replaceText(/APL/, "IDL");
			await wait(150);
			TreeView.refresh();
			TreeView.entries["a.feather"].should.have.classes(base + "apache-icon dark-red");
			TreeView.entries["not-js.es"].should.have.classes(base + "erlang-icon medium-red");
			TreeView.entries["not-js.es.swp"].should.have.classes(base + "idl-icon medium-blue");
			TreeView.entries["not-js.es.swp"].should.not.have.classes("apl-icon dark-cyan");
			
			await revert();
			await wait(150);
			TreeView.refresh();
			TreeView.entries["a.feather"].should.have.classes(base + "apache-icon dark-red");
			TreeView.entries["not-js.es"].should.have.classes(base + "erlang-icon medium-red");
			TreeView.entries["not-js.es.swp"].should.have.classes(base + "apl-icon dark-cyan");
			
			await replaceText(/Erlang|APL/g, "Java");
			await wait(150);
			TreeView.refresh();
			TreeView.entries["not-js.es"].should.have.classes(base + "java-icon medium-purple");
			TreeView.entries["not-js.es.swp"].should.have.classes(base + "java-icon medium-purple");
			TreeView.entries["not-js.es"].should.not.have.classes("erlang-icon medium-red");
			TreeView.entries["not-js.es.swp"].should.not.have.classes("apl-icon dark-cyan");
			
			await revert();
			await wait(150);
			TreeView.refresh();
			TreeView.entries["not-js.es"].should.have.classes(base + "erlang-icon medium-red");
			TreeView.entries["not-js.es.swp"].should.have.classes(base + "apl-icon dark-cyan");
			Tabs.closeAll();
			
			await open("perl/.gitattributes");
			await replaceText(/Perl6/, "Prolog");
			await wait(150);
			TreeView.refresh();
			TreeView.entries["perl/butterfly.pl"].should.have.classes(base + "prolog-icon medium-blue");
			TreeView.entries["perl/butterfly.pl"].should.not.have.classes("perl6-icon medium-purple");
			TreeView.entries["perl/camel.pl6"].should.have.classes(base + "perl-icon medium-blue");
			
			await revert();
			await wait(150);
			TreeView.refresh();
			TreeView.entries["perl/camel.pl6"].should.have.classes(base + "perl-icon medium-blue");
			TreeView.entries["perl/butterfly.pl"].should.not.have.classes("prolog-icon medium-blue");
			TreeView.entries["perl/butterfly.pl"].should.have.classes("perl6-icon medium-purple");
			
			await replaceText(/Perl6?/gm, "Prolog");
			await wait(150);
			TreeView.refresh();
			TreeView.entries["perl/butterfly.pl"].should.have.classes(base + "prolog-icon medium-blue");
			TreeView.entries["perl/camel.pl6"].should.have.classes(base + "prolog-icon medium-blue");
			TreeView.entries["perl/camel.pl6"].should.not.not.have.class("perl-icon");
			TreeView.entries["perl/butterfly.pl"].should.not.have.classes("perl6-icon medium-purple");
			
			await revert();
			await wait(150);
			TreeView.refresh();
			TreeView.entries["perl/camel.pl6"].should.have.classes(base + "perl-icon medium-blue");
			TreeView.entries["perl/butterfly.pl"].should.have.classes(base + "perl6-icon medium-purple");
			TreeView.entries["perl/camel.pl6"].should.not.not.have.class("prolog-icon");
			TreeView.entries["perl/butterfly.pl"].should.not.not.have.classes("prolog-icon medium-blue");
		}));
	
	
	when("the strategy is disabled", () => {
		it("restores affected icons", () => {
			Options.set("linguist", false);
			assertIconClasses(TreeView.entries, [
				["not-js.es",         base + "js-icon     medium-yellow"],
				["not-js.es.swp",     base + "binary-icon dark-green"],
				["perl/butterfly.pl", base + "perl-icon   medium-blue"],
				["perl/camel.pl6",    base + "perl6-icon  medium-purple"]
			]);
			assertIconClasses(TreeView.entries, [
				["not-js.es",         "erlang-icon medium-red"],
				["not-js.es.swp",     "apl-icon    dark-cyan"],
				["perl/butterfly.pl", "perl6-icon  medium-purple"],
				["perl/camel.pl6",    "perl-icon   medium-blue"]
			], true);
		});
		
		it("applies them again if the strategy is re-enabled", () => {
			Options.set("linguist", true);
			assertIconClasses(TreeView.entries, [
				["not-js.es",         "js-icon     medium-yellow"],
				["not-js.es.swp",     "binary-icon dark-green"],
				["perl/butterfly.pl", "perl-icon   medium-blue"],
				["perl/camel.pl6",    "perl6-icon  medium-purple"]
			], true);
			assertIconClasses(TreeView.entries, [
				["not-js.es",         base + "erlang-icon medium-red"],
				["not-js.es.swp",     base + "apl-icon    dark-cyan"],
				["perl/butterfly.pl", base + "perl6-icon  medium-purple"],
				["perl/camel.pl6",    base + "perl-icon   medium-blue"]
			]);
		});
	});
});
