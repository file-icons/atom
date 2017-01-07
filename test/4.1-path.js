"use strict";

const TreeView = require("../lib/consumers/tree-view.js");
const Options  = require("../lib/options.js");


describe("Path", () => {
	let files, dirs;
	
	before("Extracting fixtures", function(){
		this.timeout(0);
		return chain([
			() => setup("4.1-path"),
			() => {
				TreeView.expand("frameworks");
				TreeView.expand("git.git");
				TreeView.expand("git.git/case");
				TreeView.expand("git.git/nope.js");
				files = dirs = TreeView.ls();
				files.should.not.be.empty;
				files.length.should.be.at.least(700);
			}
		]);
	});
	
	
	const base = "name icon ";
	
	when("choosing the first pattern to match", () => {
		it("starts with rules of higher priority", () => {
			assertIconClasses(files, [
				[".coffee.erb.swp",          base + "binary-icon     dark-green"],
				[".yo-rc.json",              base + "yeoman-icon     medium-cyan"],
				["composer.json",            base + "composer-icon   medium-yellow"],
				["Gruntfile.js",             base + "grunt-icon      medium-yellow"],
				["Gulpfile.js",              base + "gulp-icon       medium-red"],
				["javascript.js.coffee.erb", base + "coffee-icon     medium-red"],
				["javascript.js.erb",        base + "js-icon         medium-red"],
				["laravel.blade.php",        base + "laravel-icon    medium-orange"],
				["Makefile.boot",            base + "boot-icon       medium-green"],
				["postcss.config.js",        base + "postcss-icon    medium-yellow"],
				["protractor.conf.js",       base + "protractor-icon medium-red"],
				["run.n",                    base + "neko-icon       dark-orange"],
				["stylelint.config.js",      base + "stylelint-icon  medium-yellow"],
				["ti.8xp.txt",               base + "calc-icon       medium-maroon"],
				["typings.json",             base + "typings-icon    medium-maroon"],
				["webpack.config.js",        base + "webpack-icon    medium-blue"],
				["wercker.yml",              base + "wercker-icon    medium-purple"],
				["yarn.lock",                base + "yarn-icon       medium-blue"]
			]);
			
			assertIconClasses(files, [
				[".coffee.erb.swp",          "gear-icon coffee-icon ruby-icon"],
				[".yo-rc.json",              "database-icon medium-yellow"],
				["composer.json",            "database-icon"],
				["Gruntfile.js",             "js-icon"],
				["Gulpfile.js",              "js-icon medium-yellow dark-yellow"],
				["javascript.js.coffee.erb", "js-icon ruby-icon html5-icon"],
				["javascript.js.erb",        "coffee-icon ruby-icon html5-icon"],
				["laravel.blade.php",        "php-icon dark-blue"],
				["Makefile.boot",            "checklist-icon"],
				["postcss.config.js",        "js-icon config-icon css-icon"],
				["protractor.conf.js",       "js-icon config-icon"],
				["run.n",                    "manpage-icon lisp-icon dark-green"],
				["stylelint.config.js",      "js-icon config-icon"],
				["ti.8xp.txt",               "icon-file-text medium-blue"],
				["typings.json",             "database-icon"],
				["webpack.config.js",        "js-icon config-icon"],
				["wercker.yml",              "database-icon"],
				["yarn.lock",                "database-icon"]
			], true);
		});
	});


	when("matching file extensions", () => {
		it("matches them case-insensitively by default", () => {
			assertIconClasses(files, [
				["git.git/case/ignored.CsS",  base + "css3-icon     medium-blue"],
				["git.git/case/ignored.hTmL", base + "html5-icon    medium-orange"],
				["git.git/case/ignored.Js",   base + "js-icon       medium-yellow"],
				["git.git/case/ignored.pHP",  base + "php-icon      dark-blue"],
				["git.git/case/ignored.rB",   base + "ruby-icon     medium-red"],
				["git.git/case/ignored.yaML", base + "database-icon light-red"]
			]);
		});
		
		it("respects rules with case-sensitive patterns", () => {
			assertIconClasses(files, [
				["e.E",                       base + "e-icon        medium-green"],
				["eiffel.e",                  base + "eiffel-icon   medium-cyan"],
				["git.git/case/obeyed-1.e",   base + "eiffel-icon   medium-cyan"],
				["git.git/case/obeyed-2.E",   base + "e-icon        medium-green"]
			]);
			assertIconClasses(files, [
				["e.E",                       "eiffel-icon          medium-cyan"],
				["eiffel.e",                  "e-icon               medium-green"],
				["git.git/case/obeyed-1.e",   "e-icon               medium-green"],
				["git.git/case/obeyed-2.E",   "eiffel-icon          medium-cyan"],
				["git.git/case/merge_msg",    "git-merge-icon       medium-red"]
			], true);
		});
		
		it("doesn't replace icons of well-known frameworks", () => {
			assertIconClasses(files, [
				["frameworks/angular.js",                base + "angular-icon       medium-red"],
				["frameworks/appcelerator.js",           base + "appcelerator-icon  medium-red"],
				["frameworks/backbone.min.js",           base + "backbone-icon      dark-blue"],
				["frameworks/bootstrap.js",              base + "bootstrap-icon     medium-yellow"],
				["frameworks/chai.js",                   base + "chai-icon          medium-red"],
				["frameworks/chart.js",                  base + "chartjs-icon       dark-pink"],
				["frameworks/compass.scss",              base + "compass-icon       medium-red"],
				["frameworks/cordova.js",                base + "cordova-icon       light-blue"],
				["frameworks/custom.bootstrap.less",     base + "bootstrap-icon     dark-blue"],
				["frameworks/d3.v3.js",                  base + "d3-icon            medium-orange"],
				["frameworks/dojo.js",                   base + "dojo-icon          light-red"],
				["frameworks/ember-2.0.1.debug.js",      base + "ember-icon         medium-red"],
				["frameworks/extjs.js",                  base + "extjs-icon         light-green"],
				["frameworks/fuelux.js",                 base + "fuelux-icon        medium-orange"],
				["frameworks/jquery-ui.custom.css",      base + "jqueryui-icon      dark-blue"],
				["frameworks/jquery-ui.js",              base + "jqueryui-icon      dark-blue"],
				["frameworks/jquery.js",                 base + "jquery-icon        dark-blue"],
				["frameworks/knockout-3.4.0.js",         base + "knockout-icon      medium-red"],
				["frameworks/leaflet.spin.css",          base + "leaflet-icon       medium-green"],
				["frameworks/materialize.js",            base + "materialize-icon   light-red"],
				["frameworks/mathjax.js",                base + "mathjax-icon       dark-green"],
				["frameworks/mocha.css",                 base + "mocha-icon         medium-red"],
				["frameworks/mocha.js",                  base + "mocha-icon         medium-maroon"],
				["frameworks/mocha.opts",                base + "mocha-icon         light-maroon"],
				["frameworks/modernizr-custom.js",       base + "modernizr-icon     medium-red"],
				["frameworks/mootools-core-1.4-full.js", base + "mootools-icon      medium-purple"],
				["frameworks/normalize.css",             base + "normalize-icon     medium-red"],
				["frameworks/raphael.no-deps.min.js",    base + "raphael-icon       medium-orange"],
				["frameworks/react.js",                  base + "react-icon         dark-blue"],
				["frameworks/require.js",                base + "requirejs-icon     medium-blue"],
				["frameworks/sencha.js",                 base + "sencha-icon        light-green"],
				["frameworks/snap.svg.js",               base + "snapsvg-icon       medium-cyan"],
				["frameworks/uikit.min.js",              base + "uikit-icon         medium-blue"],
				["frameworks/yui.js",                    base + "yui-icon           dark-blue"]
			]);
		});
		
		it("doesn't confuse them with directories ending in file extensions", () => {
			dirs["git.git/nope.js"].should.have.classes(base + "icon-file-directory");
			dirs["git.git/nope.js"].should.not.have.class("js-icon");
		});
		
		it("doesn't match file extensions in the middle of a filename", () => {
			files["git.git/nope.js/1.html.js.null"].should.have.classes(base + "default-icon");
			files["git.git/nope.js/1.html.js.null"].should.not.have.class("js-icon");
		});
	});
	
	
	when("matching directory names", () => {
		it("matches them accurately", () => {
			assertIconClasses(dirs, [
				["colours",           base + "icon-file-directory"],
				[".bundle",           base + "package-icon"],
				[".framework",        base + "dylib-icon"],
				[".github",           base + "github-icon"],
				["git.git",           base + "git-icon      medium-red"],
				[".meteor",           base + "meteor-icon   dark-orange"],
				[".vagrant",          base + "vagrant-icon  medium-cyan"],
				["bower_components",  base + "bower-icon    medium-yellow"],
				["Dropbox",           base + "dropbox-icon  medium-blue"]
			]);
		});
		
		it("doesn't confuse them with matching filenames", () => {
			files["git.git/nope.js/Dropbox"].should.not.have.classes("dropbox-icon medium-blue");
			files["git.git/nope.js/Dropbox"].should.have.class("default-icon");
		});
	});
	
	
	when("a rule has `matchPath` enabled", () => {
		it("tests its pattern against entire system-paths", () => {
			files["git.git/HEAD"].should.have.classes(base + "database-icon medium-red");
			files["git.git/HEAD"].should.not.have.class("default-icon");
			files["git.git/description"].should.have.classes(base + "icon-file-text dark-red");
			files["git.git/description"].should.not.have.class("default-icon");
		});
		
		it("tests paths before testing filenames", () => {
			files["git.git/config"].should.have.classes(base + "config-icon dark-red");
			files["git.git/config"].should.not.have.classes("terminal-icon dark-purple");
		});
	});
	
	
	when("matching a filename with an ambiguous extension", () => {
		it("tests the pattern against the filtered version", () => {
			files["suffix.jsx.inc"].should.have.classes(base   + "jsx-icon   medium-blue");
			files["suffix.js.dist"].should.have.classes(base   + "js-icon    medium-yellow");
			files["suffix.html.tmpl"].should.have.classes(base + "html5-icon medium-orange");
			files["suffix.jsx.inc"].should.not.have.classes("php-icon default-icon");
		});
		
		it("then tests the unfiltered filename if nothing matched", () => {
			files["suffix.php.tpl"].should.have.classes(base   + "php-icon dark-blue");
			files["suffix.tpl"].should.have.classes(base       + "smarty-icon medium-yellow");
			files["suffix.tpl"].should.not.have.classes("php-icon dark-blue");
			files["suffix.php.tpl"].should.not.have.classes("smarty-icon medium-yellow");
		});
		
		it('avoids resorting to "guesswork" patterns', () => {
			files["news.tpl"].should.have.classes(base + "smarty-icon  medium-yellow");
			files["news"].should.have.classes(base     + "book-icon    dark-blue");
			files["news"].should.not.have.classes(       "smarty-icon  medium-yellow");
			files["news.tpl"].should.not.have.classes(   "book-icon    dark-blue");
		});
	});
});
