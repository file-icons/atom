"use strict";

const LinguistStrategy = require("../lib/service/strategies/linguist-strategy.js");
const FileRegistry = require("../lib/filesystem/file-registry.js");
const TreeView = require("../lib/consumers/tree-view.js");
const Options = require("../lib/options.js");


describe("Linguist-language attributes", () => {
	const base = "name icon ";
	let files;
	
	before(() => {
		TreeView.collapse("signature");
		TreeView.expand("linguist");
		files = TreeView.ls();
		files.should.not.be.empty;
		files.length.should.be.at.least(3);
	});
	
	
	describe("When a folder contains a .gitattributes file", () => {
		it("its full content is scanned for `linguist-language` attributes", () => {
			const attrFile = files["linguist/.gitattributes"].iconNode.resource;
			attrFile.isDataComplete.should.be.true;
			attrFile.watchingSystem.should.be.true;
			LinguistStrategy.rules.size.should.equal(2);
		});
	});
	
	describe("When language attributes are present", () => {
		it("applies them to affected file paths", () => {
			files["linguist/not-js.es"].should.have.classes(base + "erlang-icon medium-red");
			files["linguist/not-js.es.swp"].should.have.classes(base + "apl-icon dark-cyan");
			files["linguist/not-js.es"].should.not.have.class("js-icon medium-yellow");
			files["linguist/not-js.es.swp"].should.not.have.class("erlang-icon medium-red");
		});
		
		it("reads attribute paths relative to the .gitattributes file", () => {
			TreeView.expand("linguist/perl");
			files = TreeView.ls();
			assertIconClasses(files, [
				["linguist/not-js.es",         base + "erlang-icon medium-red"],
				["linguist/not-js.es.swp",     base + "apl-icon    dark-cyan"],
				["linguist/perl/butterfly.pl", base + "perl6-icon  medium-purple"],
				["linguist/perl/camel.pl6",    base + "perl-icon   medium-blue"]
			]);
		});
	});
	
	describe("When language attributes are changed", () => {
		let editor;
		
		after(() => {
			if(editor){
				editor.undo();
				editor.save();
				atom.commands.dispatch(editor.element, "core:close");
				editor = null;
			}
		})
		
		it("updates affected files", () => {
			return open("linguist/.gitattributes").then(newEditor => {
				editor = newEditor;
				editor.scan(/Erlang/, ({replace}) => replace("Eiffel"));
				editor.save();
				files["linguist/not-js.es"].should.have.classes(base + "eiffel-icon medium-cyan");
				files["linguist/not-js.es.swp"].should.have.classes(base + "apl-icon dark-cyan");
				files["linguist/not-js.es"].should.not.have.classes("erlang-icon medium-red");
				files["linguist/not-js.es"].should.not.have.classes("js-icon medium-yellow");
				
				editor.undo();
				editor.save();
				files["linguist/not-js.es"].should.have.classes(base + "erlang-icon medium-red");
				files["linguist/not-js.es"].should.not.have.classes("eiffel-icon medium-cyan");
				files["linguist/not-js.es"].should.not.have.classes("js-icon medium-yellow");
				files["linguist/not-js.es.swp"].should.have.classes(base + "apl-icon dark-cyan");
				
				editor.scan(/APL/, ({replace}) => replace("IDL"));
				editor.save();
				files["linguist/not-js.es"].should.have.classes(base + "erlang-icon medium-red");
				files["linguist/not-js.es.swp"].should.have.classes(base + "idl-icon medium-blue");
				files["linguist/not-js.es.swp"].should.not.have.classes("apl-icon dark-cyan");
				
				editor.undo();
				editor.save();
				files["linguist/not-js.es"].should.have.classes(base + "erlang-icon medium-red");
				files["linguist/not-js.es.swp"].should.have.classes(base + "apl-icon dark-cyan");
				
				editor.transact(100, () => editor.scan(/Erlang|APL/g, ({replace}) => replace("Java")));
				editor.save();
				files["linguist/not-js.es"].should.have.classes(base     + "java-icon medium-purple");
				files["linguist/not-js.es.swp"].should.have.classes(base + "java-icon medium-purple");
				files["linguist/not-js.es"].should.not.have.classes("erlang-icon medium-red");
				files["linguist/not-js.es.swp"].should.not.have.classes("apl-icon dark-cyan");
				
				editor.undo();
				editor.save();
				files["linguist/not-js.es"].should.have.classes(base + "erlang-icon medium-red");
				files["linguist/not-js.es.swp"].should.have.classes(base + "apl-icon dark-cyan");
				
				workspace = atom.views.getView(atom.workspace);
				atom.commands.dispatch(workspace, "core:close");
				expect(atom.workspace.getActivePaneItem()).not.to.equal(editor);
				
				return open("linguist/perl/.gitattributes").then(newEditor => {
					editor = newEditor;
					editor.scan(/Perl6/, ({replace}) => replace("Prolog"));
					editor.save();
					files["linguist/perl/butterfly.pl"].should.have.classes(base + "prolog-icon medium-blue");
					files["linguist/perl/butterfly.pl"].should.not.have.classes("perl6-icon medium-purple");
					files["linguist/perl/camel.pl6"].should.have.classes(base + "perl-icon medium-blue");
					
					editor.undo();
					editor.save();
					files["linguist/perl/camel.pl6"].should.have.classes(base + "perl-icon medium-blue");
					files["linguist/perl/butterfly.pl"].should.not.have.classes("prolog-icon medium-blue");
					files["linguist/perl/butterfly.pl"].should.have.classes("perl6-icon medium-purple");
					
					editor.transact(100, () => editor.scan(/Perl6?/gm, ({replace}) => replace("Prolog")));
					editor.save();
					files["linguist/perl/butterfly.pl"].should.have.classes(base + "prolog-icon medium-blue");
					files["linguist/perl/camel.pl6"].should.have.classes(base + "prolog-icon medium-blue");
					files["linguist/perl/camel.pl6"].should.not.not.have.class("perl-icon");
					files["linguist/perl/butterfly.pl"].should.not.have.classes("perl6-icon medium-purple");
					
					editor.undo();
					editor.save();
					files["linguist/perl/camel.pl6"].should.have.classes(base + "perl-icon medium-blue");
					files["linguist/perl/butterfly.pl"].should.have.classes(base + "perl6-icon medium-purple");
					files["linguist/perl/camel.pl6"].should.not.not.have.class("prolog-icon");
					files["linguist/perl/butterfly.pl"].should.not.not.have.classes("prolog-icon medium-blue");
				});
			});
		});
	});
	
	describe("When the strategy is disabled", () => {
		it("restores affected icons", () => {
			Options.set("linguist", false);
			assertIconClasses(files, [
				["linguist/not-js.es",         base + "js-icon     medium-yellow"],
				["linguist/not-js.es.swp",     base + "binary-icon dark-green"],
				["linguist/perl/butterfly.pl", base + "perl-icon   medium-blue"],
				["linguist/perl/camel.pl6",    base + "perl6-icon  medium-purple"]
			]);
			assertIconClasses(files, [
				["linguist/not-js.es",         "erlang-icon medium-red"],
				["linguist/not-js.es.swp",     "apl-icon    dark-cyan"],
				["linguist/perl/butterfly.pl", "perl6-icon  medium-purple"],
				["linguist/perl/camel.pl6",    "perl-icon   medium-blue"]
			], true);
		});
		
		it("applies them again if the strategy is re-enabled", () => {
			Options.set("linguist", true);
			assertIconClasses(files, [
				["linguist/not-js.es",         "js-icon     medium-yellow"],
				["linguist/not-js.es.swp",     "binary-icon dark-green"],
				["linguist/perl/butterfly.pl", "perl-icon   medium-blue"],
				["linguist/perl/camel.pl6",    "perl6-icon  medium-purple"]
			], true);
			assertIconClasses(files, [
				["linguist/not-js.es",         base + "erlang-icon medium-red"],
				["linguist/not-js.es.swp",     base + "apl-icon    dark-cyan"],
				["linguist/perl/butterfly.pl", base + "perl6-icon  medium-purple"],
				["linguist/perl/camel.pl6",    base + "perl-icon   medium-blue"]
			]);
		});
	});
});
