"use strict";

const TreeView = require("../lib/consumers/tree-view.js");
const Options  = require("../lib/options.js");


describe("Path", () => {
	const base = "name icon ";
	let files, dirs;
	
	describe("When choosing the first pattern to match", () => {
		before(() => {
			TreeView.expand("path");
			TreeView.expand("path/frameworks");
			TreeView.expand("path/git.git");
			TreeView.expand("path/git.git/case");
			TreeView.expand("path/git.git/nope.js");
			files = dirs = TreeView.ls();
			files.should.not.be.empty;
			files.length.should.be.at.least(700);
		});
		
		it("starts with rules of higher priority", () => {
			assertIconClasses(files, [
				["path/.coffee.erb.swp",          base + "binary-icon     dark-green"],
				["path/.yo-rc.json",              base + "yeoman-icon     medium-cyan"],
				["path/composer.json",            base + "composer-icon   medium-yellow"],
				["path/Gruntfile.js",             base + "grunt-icon      medium-yellow"],
				["path/Gulpfile.js",              base + "gulp-icon       medium-red"],
				["path/javascript.js.coffee.erb", base + "coffee-icon     medium-red"],
				["path/javascript.js.erb",        base + "js-icon         medium-red"],
				["path/laravel.blade.php",        base + "laravel-icon    medium-orange"],
				["path/Makefile.boot",            base + "boot-icon       medium-green"],
				["path/postcss.config.js",        base + "postcss-icon    medium-yellow"],
				["path/protractor.conf.js",       base + "protractor-icon medium-red"],
				["path/run.n",                    base + "neko-icon       dark-orange"],
				["path/stylelint.config.js",      base + "stylelint-icon  medium-yellow"],
				["path/ti.8xp.txt",               base + "calc-icon       medium-maroon"],
				["path/typings.json",             base + "typings-icon    medium-maroon"],
				["path/webpack.config.js",        base + "webpack-icon    medium-blue"],
				["path/wercker.yml",              base + "wercker-icon    medium-purple"],
				["path/yarn.lock",                base + "yarn-icon       medium-blue"]
			]);
			
			assertIconClasses(files, [
				["path/.coffee.erb.swp",          "gear-icon coffee-icon ruby-icon"],
				["path/.yo-rc.json",              "database-icon medium-yellow"],
				["path/composer.json",            "database-icon"],
				["path/Gruntfile.js",             "js-icon"],
				["path/Gulpfile.js",              "js-icon medium-yellow dark-yellow"],
				["path/javascript.js.coffee.erb", "js-icon ruby-icon html5-icon"],
				["path/javascript.js.erb",        "coffee-icon ruby-icon html5-icon"],
				["path/laravel.blade.php",        "php-icon dark-blue"],
				["path/Makefile.boot",            "checklist-icon"],
				["path/postcss.config.js",        "js-icon config-icon css-icon"],
				["path/protractor.conf.js",       "js-icon config-icon"],
				["path/run.n",                    "manpage-icon lisp-icon dark-green"],
				["path/stylelint.config.js",      "js-icon config-icon"],
				["path/ti.8xp.txt",               "icon-file-text medium-blue"],
				["path/typings.json",             "database-icon"],
				["path/webpack.config.js",        "js-icon config-icon"],
				["path/wercker.yml",              "database-icon"],
				["path/yarn.lock",                "database-icon"]
			], true);
		});
	});


	describe("When matching file extensions", () => {
		it("matches them case-insensitively by default", () => {
			assertIconClasses(files, [
				["path/git.git/case/ignored.CsS",  base + "css3-icon     medium-blue"],
				["path/git.git/case/ignored.hTmL", base + "html5-icon    medium-orange"],
				["path/git.git/case/ignored.Js",   base + "js-icon       medium-yellow"],
				["path/git.git/case/ignored.pHP",  base + "php-icon      dark-blue"],
				["path/git.git/case/ignored.rB",   base + "ruby-icon     medium-red"],
				["path/git.git/case/ignored.yaML", base + "database-icon light-red"]
			]);
		});
		
		it("respects rules with case-sensitive patterns", () => {
			assertIconClasses(files, [
				["path/e.E",                       base + "e-icon        medium-green"],
				["path/eiffel.e",                  base + "eiffel-icon   medium-cyan"],
				["path/git.git/case/obeyed-1.e",   base + "eiffel-icon   medium-cyan"],
				["path/git.git/case/obeyed-2.E",   base + "e-icon        medium-green"]
			]);
			assertIconClasses(files, [
				["path/e.E",                       "eiffel-icon          medium-cyan"],
				["path/eiffel.e",                  "e-icon               medium-green"],
				["path/git.git/case/obeyed-1.e",   "e-icon               medium-green"],
				["path/git.git/case/obeyed-2.E",   "eiffel-icon          medium-cyan"],
				["path/git.git/case/merge_msg",    "git-merge-icon       medium-red"]
			], true);
		});
		
		it("doesn't replace icons of well-known frameworks", () => {
			assertIconClasses(files, [
				["path/frameworks/angular.js",                base + "angular-icon       medium-red"],
				["path/frameworks/appcelerator.js",           base + "appcelerator-icon  medium-red"],
				["path/frameworks/backbone.min.js",           base + "backbone-icon      dark-blue"],
				["path/frameworks/bootstrap.js",              base + "bootstrap-icon     medium-yellow"],
				["path/frameworks/chai.js",                   base + "chai-icon          medium-red"],
				["path/frameworks/chart.js",                  base + "chartjs-icon       dark-pink"],
				["path/frameworks/compass.scss",              base + "compass-icon       medium-red"],
				["path/frameworks/cordova.js",                base + "cordova-icon       light-blue"],
				["path/frameworks/custom.bootstrap.less",     base + "bootstrap-icon     dark-blue"],
				["path/frameworks/d3.v3.js",                  base + "d3-icon            medium-orange"],
				["path/frameworks/dojo.js",                   base + "dojo-icon          light-red"],
				["path/frameworks/ember-2.0.1.debug.js",      base + "ember-icon         medium-red"],
				["path/frameworks/extjs.js",                  base + "extjs-icon         light-green"],
				["path/frameworks/fuelux.js",                 base + "fuelux-icon        medium-orange"],
				["path/frameworks/jquery-ui.custom.css",      base + "jqueryui-icon      dark-blue"],
				["path/frameworks/jquery-ui.js",              base + "jqueryui-icon      dark-blue"],
				["path/frameworks/jquery.js",                 base + "jquery-icon        dark-blue"],
				["path/frameworks/knockout-3.4.0.js",         base + "knockout-icon      medium-red"],
				["path/frameworks/leaflet.spin.css",          base + "leaflet-icon       medium-green"],
				["path/frameworks/materialize.js",            base + "materialize-icon   light-red"],
				["path/frameworks/mathjax.js",                base + "mathjax-icon       dark-green"],
				["path/frameworks/mocha.css",                 base + "mocha-icon         medium-red"],
				["path/frameworks/mocha.js",                  base + "mocha-icon         medium-maroon"],
				["path/frameworks/mocha.opts",                base + "mocha-icon         light-maroon"],
				["path/frameworks/modernizr-custom.js",       base + "modernizr-icon     medium-red"],
				["path/frameworks/mootools-core-1.4-full.js", base + "mootools-icon      medium-purple"],
				["path/frameworks/normalize.css",             base + "normalize-icon     medium-red"],
				["path/frameworks/raphael.no-deps.min.js",    base + "raphael-icon       medium-orange"],
				["path/frameworks/react.js",                  base + "react-icon         dark-blue"],
				["path/frameworks/require.js",                base + "requirejs-icon     medium-blue"],
				["path/frameworks/sencha.js",                 base + "sencha-icon        light-green"],
				["path/frameworks/snap.svg.js",               base + "snapsvg-icon       medium-cyan"],
				["path/frameworks/uikit.min.js",              base + "uikit-icon         medium-blue"],
				["path/frameworks/yui.js",                    base + "yui-icon           dark-blue"]
			]);
		});
		
		it("doesn't confuse them with directories ending in file extensions", () => {
			dirs["path/git.git/nope.js"].isDirectory.should.be.true;
			dirs["path/git.git/nope.js"].should.have.classes(base + "icon-file-directory");
			dirs["path/git.git/nope.js"].should.not.have.class("js-icon");
		});
		
		it("doesn't match file extensions in the middle of a filename", () => {
			files["path/git.git/nope.js/1.html.js.null"].should.have.classes(base + "default-icon");
			files["path/git.git/nope.js/1.html.js.null"].should.not.have.class("js-icon");
		});
	});
	
	
	describe("When matching directory names", () => {
		it("matches them accurately", () => {
			assertIconClasses(dirs, [
				["path/colours",           base + "icon-file-directory"],
				["path/.bundle",           base + "package-icon"],
				["path/.framework",        base + "dylib-icon"],
				["path/.github",           base + "github-icon"],
				["path/git.git",           base + "git-icon      medium-red"],
				["path/.meteor",           base + "meteor-icon   dark-orange"],
				["path/.vagrant",          base + "vagrant-icon  medium-cyan"],
				["path/bower_components",  base + "bower-icon    medium-yellow"],
				["path/Dropbox",           base + "dropbox-icon  medium-blue"]
			]);
		});
		
		it("doesn't confuse them with matching filenames", () => {
			files["path/git.git/nope.js/Dropbox"].should.not.have.classes("dropbox-icon medium-blue");
			files["path/git.git/nope.js/Dropbox"].should.have.class("default-icon");
		});
	});
	
	
	describe("When a rule has `matchPath` enabled", () => {
		it("tests its pattern against entire system-paths", () => {
			files["path/git.git/HEAD"].should.have.classes(base + "database-icon medium-red");
			files["path/git.git/HEAD"].should.not.have.class("default-icon");
			files["path/git.git/description"].should.have.classes(base + "icon-file-text dark-red");
			files["path/git.git/description"].should.not.have.class("default-icon");
		});
		
		it("tests paths before testing filenames", () => {
			files["path/git.git/config"].should.have.classes(base + "config-icon dark-red");
			files["path/git.git/config"].should.not.have.classes("terminal-icon dark-purple");			
		});
	});
	
	
	describe("When matching a filename with an ambiguous extension", () => {
		it("tests the pattern against the filtered version", () => {
			files["path/suffix.jsx.inc"].should.have.classes(base   + "jsx-icon   medium-blue");
			files["path/suffix.js.dist"].should.have.classes(base   + "js-icon    medium-yellow");
			files["path/suffix.html.tmpl"].should.have.classes(base + "html5-icon medium-orange");
			files["path/suffix.jsx.inc"].should.not.have.classes("php-icon default-icon");
		});
		
		it("then tests the unfiltered filename if nothing matched", () => {
			files["path/suffix.php.tpl"].should.have.classes(base + "php-icon dark-blue");
			files["path/suffix.tpl"].should.have.classes(base     + "smarty-icon medium-yellow");
			files["path/suffix.tpl"].should.not.have.classes("php-icon dark-blue");
			files["path/suffix.php.tpl"].should.not.have.classes("smarty-icon medium-yellow");
		});
	});
});
