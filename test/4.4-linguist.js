"use strict";

const Options          = require("../lib/options.js");
const LinguistStrategy = require("../lib/service/strategies/linguist-strategy.js");
const FileSystem       = require("../lib/filesystem/filesystem.js");
const TreeView         = require("../lib/consumers/tree-view.js");
const Tabs             = require("../lib/consumers/tabs.js");


describe("Linguist-language attributes", () => {
	const base = "name icon ";
	let files;
	
	before(() => chain([
		() => setup("4.4-linguist"),
		() => {
			TreeView.visible = true;
			files = TreeView.ls();
			files.should.not.be.empty;
			files.length.should.be.at.least(3);
		}
	]));
	
	after(() => {
		const editor = atom.workspace.getActiveTextEditor();
		editor && revert(editor);
		Tabs.closeAll();
	});
	
	
	when("a folder contains a .gitattributes file", () => {
		it("its full content is scanned for `linguist-language` attributes", () => {
			const attrFile = files[".gitattributes"].iconNode.resource;
			attrFile.isDataComplete.should.be.true;
			attrFile.watchingSystem.should.be.true;
			LinguistStrategy.rules.size.should.equal(3);
		});
	});
	
	when("language attributes are present", () => {
		it("applies them to affected file paths", () => {
			files["a.feather"].should.have.classes(base + "apache-icon dark-red");
			files["not-js.es"].should.have.classes(base + "erlang-icon medium-red");
			files["not-js.es.swp"].should.have.classes(base + "apl-icon dark-cyan");
			files["not-js.es"].should.not.have.class("js-icon medium-yellow");
			files["not-js.es.swp"].should.not.have.class("erlang-icon medium-red");
		});
		
		it("resolves paths relative to the file which defines them", () => {
			TreeView.expand("perl");
			files = TreeView.ls();
			assertIconClasses(files, [
				["not-js.es",         base + "erlang-icon medium-red"],
				["not-js.es.swp",     base + "apl-icon    dark-cyan"],
				["perl/butterfly.pl", base + "perl6-icon  medium-purple"],
				["perl/camel.pl6",    base + "perl-icon   medium-blue"]
			]);
		});
	});
	
	when("language attributes are changed", function(){
		this.timeout(30000);
		
		it("updates affected files", () => chain([
			() => open(".gitattributes"),
			() => replaceText(/Erlang/, "Eiffel"),
			() => {
				files = TreeView.ls();
				files["a.feather"].should.have.classes(base + "apache-icon dark-red");
				files["not-js.es"].should.have.classes(base + "eiffel-icon medium-cyan");
				files["not-js.es"].should.not.have.classes("js-icon medium-yellow");
				files["not-js.es.swp"].should.have.classes(base + "apl-icon dark-cyan");
				files["not-js.es"].should.not.have.classes("erlang-icon medium-red");
			},
			
			() => revert(),
			() => {
				files["a.feather"].should.have.classes(base + "apache-icon dark-red");
				files["not-js.es"].should.have.classes(base + "erlang-icon medium-red");
				files["not-js.es"].should.not.have.classes("eiffel-icon medium-cyan");
				files["not-js.es"].should.not.have.classes("js-icon medium-yellow");
				files["not-js.es.swp"].should.have.classes(base + "apl-icon dark-cyan");
			},
			
			() => replaceText(/APL/, "IDL"),
			() => {
				files["a.feather"].should.have.classes(base + "apache-icon dark-red");
				files["not-js.es"].should.have.classes(base + "erlang-icon medium-red");
				files["not-js.es.swp"].should.have.classes(base + "idl-icon medium-blue");
				files["not-js.es.swp"].should.not.have.classes("apl-icon dark-cyan");
			},
			
			() => revert(),
			() => {
				files["a.feather"].should.have.classes(base + "apache-icon dark-red");
				files["not-js.es"].should.have.classes(base + "erlang-icon medium-red");
				files["not-js.es.swp"].should.have.classes(base + "apl-icon dark-cyan");
			},
			
			() => replaceText(/Erlang|APL/g, "Java"),
			() => {
				files["not-js.es"].should.have.classes(base     + "java-icon medium-purple");
				files["not-js.es.swp"].should.have.classes(base + "java-icon medium-purple");
				files["not-js.es"].should.not.have.classes("erlang-icon medium-red");
				files["not-js.es.swp"].should.not.have.classes("apl-icon dark-cyan");
			},
			
			() => revert(),
			() => {
				files["not-js.es"].should.have.classes(base + "erlang-icon medium-red");
				files["not-js.es.swp"].should.have.classes(base + "apl-icon dark-cyan");
				Tabs.closeAll();
			},
			
			() => open("perl/.gitattributes"),
			() => replaceText(/Perl6/, "Prolog"),
			() => {
				files["perl/butterfly.pl"].should.have.classes(base + "prolog-icon medium-blue");
				files["perl/butterfly.pl"].should.not.have.classes("perl6-icon medium-purple");
				files["perl/camel.pl6"].should.have.classes(base + "perl-icon medium-blue");
			},
			
			() => revert(),
			() => {
				files["perl/camel.pl6"].should.have.classes(base + "perl-icon medium-blue");
				files["perl/butterfly.pl"].should.not.have.classes("prolog-icon medium-blue");
				files["perl/butterfly.pl"].should.have.classes("perl6-icon medium-purple");
			},
			
			() => replaceText(/Perl6?/gm, "Prolog"),
			() => {
				files["perl/butterfly.pl"].should.have.classes(base + "prolog-icon medium-blue");
				files["perl/camel.pl6"].should.have.classes(base + "prolog-icon medium-blue");
				files["perl/camel.pl6"].should.not.not.have.class("perl-icon");
				files["perl/butterfly.pl"].should.not.have.classes("perl6-icon medium-purple");
			},
			
			() => revert(),
			() => {
				files["perl/camel.pl6"].should.have.classes(base + "perl-icon medium-blue");
				files["perl/butterfly.pl"].should.have.classes(base + "perl6-icon medium-purple");
				files["perl/camel.pl6"].should.not.not.have.class("prolog-icon");
				files["perl/butterfly.pl"].should.not.not.have.classes("prolog-icon medium-blue");
			}
		]))
	});
	
	
	when("the strategy is disabled", () => {
		it("restores affected icons", () => {
			Options.set("linguist", false);
			assertIconClasses(files, [
				["not-js.es",         base + "js-icon     medium-yellow"],
				["not-js.es.swp",     base + "binary-icon dark-green"],
				["perl/butterfly.pl", base + "perl-icon   medium-blue"],
				["perl/camel.pl6",    base + "perl6-icon  medium-purple"]
			]);
			assertIconClasses(files, [
				["not-js.es",         "erlang-icon medium-red"],
				["not-js.es.swp",     "apl-icon    dark-cyan"],
				["perl/butterfly.pl", "perl6-icon  medium-purple"],
				["perl/camel.pl6",    "perl-icon   medium-blue"]
			], true);
		});
		
		it("applies them again if the strategy is re-enabled", () => {
			Options.set("linguist", true);
			assertIconClasses(files, [
				["not-js.es",         "js-icon     medium-yellow"],
				["not-js.es.swp",     "binary-icon dark-green"],
				["perl/butterfly.pl", "perl-icon   medium-blue"],
				["perl/camel.pl6",    "perl6-icon  medium-purple"]
			], true);
			assertIconClasses(files, [
				["not-js.es",         base + "erlang-icon medium-red"],
				["not-js.es.swp",     base + "apl-icon    dark-cyan"],
				["perl/butterfly.pl", base + "perl6-icon  medium-purple"],
				["perl/camel.pl6",    base + "perl-icon   medium-blue"]
			]);
		});
	});
});
