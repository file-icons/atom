"use strict";

const {join, dirname} = require("path");
const FindAndReplace  = require("../lib/consumers/find-and-replace.js");
const Options         = require("../lib/options.js");


describe("Find-and-replace", () => {
	
	before("Activate package", () => {
		return new Promise((resolve, reject) => {
			const activationPromise = atom.packages.activatePackage("find-and-replace")
				.then(() => resolve())
				.catch(error => reject(error))
			atom.commands.dispatch(workspace, "project-find:show");
		}).then(() => {
			FindAndReplace.active.should.be.true;
			FindAndReplace.should.have.property("punchedMethods");
			workspace.style.height = "1000px";
			
			const packagePath = atom.packages.activePackages["find-and-replace"].mainModulePath;
			const resultsPane = require(join(dirname(packagePath), "project", "results-pane"));
			FindAndReplace.resultsURI.should.equal(resultsPane.URI);
		});
	});
	
	after(() => {
		Options.set("coloured", true);
		Options.set("colourChangedOnly", false);
		workspace.style.height = null;
		if(FindAndReplace.package.projectFindPanel.visible)
			atom.commands.dispatch(workspace, "project-find:toggle");
	});
	
	when("opening the project-find view", () => {
		let files = null;
		
		const classes = [
			[".default-config",       "config-icon"],
			[".default-gear",         "gear-icon"],
			["blank.file",            "default-icon"],
			[".bowerrc",              "bower-icon",     "medium-yellow"],
			["data.json",             "database-icon",  "medium-yellow"],
			["la.tex",                "tex-icon",       "medium-blue"],
			["markdown.md",           "markdown-icon",  "medium-blue"],
			["package.json",          "npm-icon",       "medium-red"],
			["README.md",             "book-icon",      "medium-blue"],
			["text.txt",              "icon-file-text", "medium-blue"],
			["subfolder/almighty.c",  "c-icon",         "medium-blue"],
			["subfolder/fad.jsx",     "jsx-icon",       "medium-blue"],
			["subfolder/markup.html", "html5-icon",     "medium-orange"],
			["subfolder/script.js",   "js-icon",        "medium-yellow"]
		];
		
		const colours = classes
			.map(([name, icon, colour]) => colour ? [name, colour] : null)
			.filter(Boolean);
		
		it("displays an icon beside each result result", () => {
			return FindAndReplace.search(/^ABC$/).then(() => {
				files = ls();
				assertIconClasses(files, classes);
			});
		});
		
		it("displays uncoloured icons if coloured icons are disabled", () => {
			return FindAndReplace.search(/^AB/).then(() => {
				files = ls();
				assertIconClasses(files, classes);
				assertIconClasses(files, colours);
				Options.set("coloured", false);
				assertIconClasses(files, colours, true);
			});
		});
		
		when("in a Git repository", () =>
			when(`the "Only colour when changed" setting is enabled`, () => {
				before(() => Options.set("coloured", true));
				
				describe("If the file is unmodified", () =>
					it("doesn't show a coloured icon", () => {
						assertIconClasses(files, colours);
						Options.set("colourChangedOnly", true);
						assertIconClasses(files, colours, true);
						Options.set("coloured", false);
						assertIconClasses(files, colours, true);
						Options.set("coloured", true);
						assertIconClasses(files, colours, true);
					}));
				
				describe("If the file is modified", () =>
					it("shows a coloured icon", () => {
						files["status-modified.pl"].should.have.class("medium-blue");
						files["status-new.pl"].should.have.class("medium-blue");
						Options.set("coloured", false);
						files["status-modified.pl"].should.not.have.class("medium-blue");
						files["status-new.pl"].should.not.have.class("medium-blue");
						Options.set("coloured", true);
						files["status-modified.pl"].should.have.class("medium-blue");
						files["status-new.pl"].should.have.class("medium-blue");
					}));
			}));
		
		when("the user has a light-coloured theme", () => {
			it("uses darker colours for thin-edged icons", () => {
				Options.set("colourChangedOnly", false);
				Options.set("coloured", true);
				
				return FindAndReplace.search(/ABCD?/i).then(() => {
					files = ls();
					files["la.tex"].should.have.classes("tex-icon medium-blue");
					files["la.tex"].should.not.have.class("dark-blue");
					files["subfolder/script.js"].should.have.classes("js-icon medium-yellow");
					files["subfolder/script.js"].should.not.have.class("dark-yellow");
					
					return setTheme("atom-light").then(() => {
						files["la.tex"].should.have.classes("tex-icon dark-blue");
						files["la.tex"].should.not.have.class("medium-blue");
						files["subfolder/script.js"].should.have.classes("js-icon dark-yellow");
						files["subfolder/script.js"].should.not.have.class("medium-yellow");
					});
				});
			});
			
			it("uses no colours if colours are disabled", () => {
				return FindAndReplace.search("23").then(() => {
					Options.get("coloured").should.be.true;
					files = ls();
					files["la.tex"].should.have.classes("tex-icon dark-blue");
					files["la.tex"].should.not.have.class("medium-blue");
					files["subfolder/script.js"].should.have.classes("js-icon dark-yellow");
					files["subfolder/script.js"].should.not.have.class("medium-yellow");
					
					Options.set("coloured", false);
					files["la.tex"].should.have.class("tex-icon");
					files["la.tex"].should.not.have.classes("dark-blue medium-blue");
					files["subfolder/script.js"].should.have.class("js-icon");
					files["subfolder/script.js"].should.not.have.class("medium-yellow dark-yellow");
					
					Options.set("coloured", true);
					files["la.tex"].should.have.classes("tex-icon dark-blue");
					files["subfolder/script.js"].should.have.classes("js-icon dark-yellow");
				});
			});
			
			it("uses different colours for Bower icons", () => {
				return FindAndReplace.search("123").then(() => {
					files = ls();
					files[".bowerrc"].should.have.classes("bower-icon medium-orange");
					files[".bowerrc"].should.not.have.class("medium-yellow");
					
					return setTheme("atom-dark").then(() => {
						files[".bowerrc"].should.have.classes("bower-icon medium-yellow");
						files[".bowerrc"].should.not.have.class("medium-orange");
					});
				});
			});
		});
		
		when("package settings change", () => {
			it("displays monochrome icons if colours are disabled", () => {
				return FindAndReplace.search(/ABC/)
					.then(() => {
						files = ls();
						classes.forEach(([name, ...classes]) => {
							const [icon, colour] = classes;
							if(!colour) return;
							Options.set("coloured", false);
							files[name].should.have.class(icon);
							files[name].should.not.have.class(colour);
							Options.set("coloured", true);
							files[name].should.have.class(colour);
						});
					});
			});
			
			it("updates icons when changing the default-icon class", () => {
				return FindAndReplace.search("Blank")
					.then(() => {
						files = ls();
						files["blank.file"].should.have.class("default-icon");
						Options.set("defaultIconClass", "foo-bar");
						files["blank.file"].should.have.class("foo-bar");
						files["blank.file"].should.not.have.class("default-icon");
						Options.set("defaultIconClass", "bar-food");
						files["blank.file"].should.have.class("bar-food");
						files["blank.file"].should.not.have.classes("foo-bar default-icon");
						Options.set("defaultIconClass", "default-icon");
						files["blank.file"].should.not.have.classes("foo-bar bar-food");
						files["blank.file"].should.have.class("default-icon");
					});
			});
			
			it(`limits colour to modified files if "Colour changed only" is set`, () => {
				return FindAndReplace.search(/ABC/)
					.then(() => {
						files = ls();
						Options.set("coloured", true);
						assertIconClasses(files, colours);
						files["status-modified.pl"].should.have.class("medium-blue");
						files["status-new.pl"].should.have.class("medium-blue");
						
						Options.set("colourChangedOnly", true);
						assertIconClasses(files, colours, true);
						files["status-modified.pl"].should.have.class("medium-blue");
						files["status-new.pl"].should.have.class("medium-blue");
						
						Options.set("coloured", false);
						assertIconClasses(files, colours, true);
						files["status-modified.pl"].should.not.have.class("medium-blue");
						files["status-new.pl"].should.not.have.class("medium-blue");
						
						Options.set("coloured", true);
						assertIconClasses(files, colours, true);
						files["status-modified.pl"].should.have.class("medium-blue");
						files["status-new.pl"].should.have.class("medium-blue");
					});
			});
		});
	});
	
	
	function ls(){
		const result = [];
		const items = workspace.querySelectorAll(".results-view > .path");
		for(const item of items){
			const pathDetails = item.querySelector(".path-details");
			const name = pathDetails.querySelector(".path-name").textContent;
			const icon = pathDetails.querySelector(".icon");
			result.push(item);
			Object.defineProperty(result, name, {value: icon});
		}
		result.should.not.be.empty;
		return result;
	}
});
