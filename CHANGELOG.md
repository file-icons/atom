Change Log
==========
All notable changes to the project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).


[Unpublished]
-------------
### Added
- **New icons:** C# Cake, C#-Script, Cucumber/Gherkin, NAnt, Protractor, Strings, Typings
- **Support:** Config files (`.htmlhintrc`), Git commit/merge messages (`COMMIT_EDITMSG`, `MERGE_HEAD`, `MERGE_MODE`, `MERGE_MSG`), Preprocessed FORTRAN (`.F`, `.F77`, `.F90`, `.F95`, `.F03`, `.F08`, `.FOR`, `.FPP`)

### Changed
- Cakefile class-name changed from `.cake` to `.cakefile` to accommodate C#'s "cake"


[1.7.11 - 2016-05-10]
---------------------
### Added
- **New icons:** Julia, SQLite
- **Support:** Embedded Crystal (`.coffee.ecr`, `.htm.ecr`, `.html.ecr`, `.js.ecr`), Embedded Ruby (`.htm.erb`), NodeJS (`.node-version`), NPM (`npmrc`), Python (`pypirc`, `.pypirc`, `pythonrc`, `.pythonrc`, `.python-venv`), Ruby (`gemrc`, `pryrc`, `rspec`), ZSH (`zlogin`, `zlogout`, `zprofile`, `zshenv`, `zshrc`, `.zsh-theme`)

### Changed
- Size/alignment tweaked for PDF and Python icons
- Python icon used for `.python-version` files

### Fixed
- Alignment and advance widths of Docker, Gradle, Groovy, Lisp, R, and Vue icons
- PDF files now respect value of user's "Coloured" setting


[1.7.10 - 2016-05-07]
---------------------
### Added
- **Support:** APL (`.apl.history`), Binary (`.swp`), Config files (`.apl.ascii`), Manual pages (`mmn`, `mmt`, `tmac.`), Stylelint (`.stylelintignore`)

### Fixed
- [[`#352`](https://github.com/DanBrooker/file-icons/issues/352)] Reverted fix for modified files with yellow icons
- Babel icon now shows for all `.babel` files


[1.7.9 - 2016-05-05]
--------------------
### Added
- **New icons:** Brakeman, CakePHP, Code Climate, Hack, Jenkins, Karma, Minecraft, New Relic, NuGet, PowerShell, Pug, SBT, Scrutinizer, Service Fabric, Shopify, Thor, TSX (React/Typescript), Vagrant
- **Support:** Adobe Photoshop (`.psb`), ANSI Weather (`.ansiweatherrc`), `CNAME`, Config files (`.arcconfig`, `.codoopts`, `.ctags`, `.env.*`, `indent.pro`, `.pairs`, `.python-version`, `.yardopts`), Erlang (`.app.src`), Gears (`.dll`), Generic code (`.gdbinit`, `.resx`, `.fsh`, `.vsh`), Git (`.git*`), GNU (`.GPLv[2-3]`), Gradle (`gradlew`), Heroku (`.buildpacks`, `Procfile`, `.vendor_urls`), Images (`.apng`, `.bmp`, `.bpg`, `.cd5`, `.cpc`, `.dcm`, `.ecw`, `.exr`, `.fit`, `.fits`, `.flif`, `.fts`, `.hdp`, `.hdr`, `.heic`, `.heif`, `.icns`, `.iff`, `.jpf`, `.jps`, `.jxr`, `.lbm`, `.liff`, `.mpo`, `.nrrd`, `.ora`, `.pbm`, `.pcx`, `.pgf`, `.pict`, `.pxr`, `.raw`, `.sct`, `.tga`, `.wbm`, `.wdp`), Makefiles (`BSDmakefile`), Manual Pages (`.tmac`, `.tmac-u`, `.nroff`, `.troff`), `METADATA.pb`, Mention-bot configs (`.mention-bot`), Prolog (`.pro`, `.prolog`, `.yap`), Readme (`AUTHORS`, `CHANGELOG`, `CONTRIBUTING`, `CONTRIBUTORS`, `COPYING`, `HISTORY`, `INSTALL`, `LICENSE`, `NEWS`, `PROJECTS`, `.read.me`, `.readme`, `THANKS`), Shell (`bash_history`, `bash_logout`), Shockwave Flash (`.swf`), Tag files (`tags`, `.tags`), Texinfo (`.texi`), TextMate (`.JSON-tmLanguage`), Visual Studio (`.builds`), Windows shortcuts (`.lnk`)
- Colour for default PDF icons
- Command to toggle coloured icons. To use it, create a keybinding for `file-icons:toggle-colours` in your keymap

### Changed
- Clearer icon now used for Jenkinsfiles
- Git icon used for `.mailmap` files
- Prolog files now use a dedicated icon instead of a generic one

### Fixed
- [[`#341`](https://github.com/DanBrooker/file-icons/issues/341)] Yellow icons no longer share same colour as modification indicator
- `.eslintrc.js` files are no longer overridden by JS icon


[1.7.8 - 2016-04-28]
--------------------
### Added
- **New icons:** Cabal, eC, MuPAD, OOC, Opa, OpenEdge ABL, Ox, Oxygene, Oz, Pan, Papyrus, Parrot, PAWN, Pickle, Pike, PogoScript, Pony, POV-Ray SDL, Propeller Spin, Puppet, PureBasic, PureScript, Racket, RDoc, REALbasic/Xojo, Rebol, Red, reStructuredText, RobotFramework, Sage, Scheme, Scilab, Self, Shen, Slash, SQF, Stan, Stata, SuperCollider, SystemVerilog, Textile, TextMate, Turing, TXL, Uno, UnrealScript, UrWeb, Varnish, VHDL, X10, XMOS, XPages, Xtend, Zephir, Zimpl
- **Support:** [Over +120 new extensions added](https://github.com/DanBrooker/file-icons/releases/tag/v1.7.8)

### Changed
- [[`#339`](https://github.com/DanBrooker/file-icons/issues/339)] `.toc` files now use a more generic-looking icon
- [[`93e705d`](https://github.com/DanBrooker/file-icons/commit/93e705d4d)] Fixed advance widths of icons with portrait-sized dimensions
- Size and alignment corrections made to Boot, ClojureScript, Elm, Ionic, JSX, Leiningen, nginx and React icons

### Removed
- Dropped support for Graph Modelling Language; its extension conflicts with GameMaker Language (`.gml`)


[1.7.7 - 2016-04-24]
--------------------
### Added
- **New icons:** AMX, Inno Setup, Jupyter, Kotlin, KRL, LabVIEW, Lasso, Lean, LSL, Logtalk, LookML, Mako, Matlab, Max, Mercury, Metal, Mirah, Modula-2, Monkey-X, NetLogo, Nimrod, Nit, Nix, NSIS, NumPy, Objective-J, OpenCL, Processing, Sublime Text
- **Support:** Certificate files (`.crt`, `.key`), GraphQL (`.gql`), JFlex (`.flex`, `.jflex`), JSONiq (`.jq`), Lex (`.lex`), Logos (`.x`, `.xm`, `.xi`), M (`.mumps`), Modelica (`.mo`), Module Management Systems (`.mmk`, `.mms`), MoonScript (`.moon`), MUF (`.muf`), Myghty (`.myt`), NCL (`.ncl`), Nu (`.nu`), Pure Data (`.pd`), QMake (`.pri`), Unity3D assets (`.anim`, `.asset`, `.mat`, `.meta`, `.prefab`, `.unity`)

### Fixed
- [[`#336`](https://github.com/DanBrooker/file-icons/issues/336)] Errors thrown for users of the [`sublime-panes`](https://atom.io/packages/sublime-panes) package


[1.7.6] - 2016-04-22
--------------------
### Added
- **New icons:** BYOND, Clean, Click, Common Lisp, Coq, Creole, Cython, Darcs, Diff, E, Eagle, Ecere, Eiffel, EmberScript, Factor, Fancy, Fantom, Flux, FreeMarker, Frege, GameMaker, GAMS, GAP, Genshi, Gentoo, Godot, Golo, Gosu, Grammatical Framework, GraphQL, Graphviz, Harbour, Hashicorp, Hy, Idris, IGOR Pro, Inform 7, Io, Ioke, NVIDIA, Patch, Perl 6, Pointwise
- **Support:** Composer (`composer.phar`), Cycript (`.cy`), DNS Zones (`.arpa`, `.zone`), Dust (`.dust`), Dylan (`.dylan`, `.dyl`, `.intr`, `.lid`), ECL (`.ecl`, `.eclxml`), Formatted (`.eam.fs`), Forth (`.4th`, `.fth`, `.forth`, `.frt`), G-code (`.gco`, `.gcode`), Grace (`.grace`), Graph Modelling Language (`.gml`)

### Changed
- [[`#331`](https://github.com/DanBrooker/file-icons/issues/331)] Generic config icon now used for `.conf` files instead of nginx logo
- [[`#199`](https://github.com/DanBrooker/file-icons/issues/199)] Python icon is now blue instead of orange
- Visual Basic files now distinguished by Visual Studio icon


[1.7.5] - 2016-04-20
--------------------
### Added
- New selector variable to override tab-icons in user stylesheets
- **New icons:** AMPL, Ceylon, Chapel, Cirru, Clarion, Dogescript, Fabric, IDL, Jakefile, JSON-LD, LFE, MediaWiki, Nmap, Nunjucks, Tcl, OWL, Phalcon, PostScript, SAS, SPARQL, Verilog, YANG
- **Support:** [Over +150](https://github.com/DanBrooker/file-icons/releases/tag/v1.7.5#support) new extensions and filenames added

### Changed
- Font Awesome updated to [4.6.1](https://github.com/FortAwesome/Font-Awesome/releases/tag/v4.6.1)
- Devicons, Icomoon, and Mfizz fonts converted to WOFF2 for better compression

### Fixed
- Height of `.meteor` folders


[1.7.4] - 2016-04-18
--------------------
### Added
- **New icons:** Ant Build System, Bluespec, Boo, Brainfuck, Bro, ChucK, CLIPS, CMake, Component Pascal, Glade, GNU, Isabelle, Jinja, Mapbox, Stylelint
- **Support:** AGS, ApacheConf (`.apacheconf`, `.vhost`), Befunge, BitBake, BlitzMax, Brightscript, C2hs, Cap'n Proto, COBOL, `.csx`, Extra extensions for C, C++ and Erlang, Haskell `.hsc` files, HTTP, Jenkins, JSONLD, TeX `.aux` files, TopoJSON

### Fixed
- [[`#296`](https://github.com/DanBrooker/file-icons/issues/296)] Material UI resets size adjustments applied to icons


[1.7.3] - 2016-04-17
--------------------
### Added
- **New icons:** ABAP, ActionScript, Alloy, ANTLR, API Blueprint, Arc, Arduino, ATS, Augeas, AutoHotkey, AutoIt, ColdFusion, J, Manual pages, Pascal
- **Support:** Agda, ASP.net, AspectJ, AWK-scripts, Extra assembly extensions, `.pcss`

### Fixed
- `_osc` and `PKGBUILD` icons now show icons correctly


[1.7.2] - 2016-04-14
--------------------
### Added
- **New icons:** Doxygen
- **Support:** `.ad`, `.am`, `Brewfile`, `.desktop`, `.directory`, `.ebuild`, `.github`, `.install`, `.m4`, `.menu`, `.msi`, `_osc`, `PKGBUILD`, `.sed`, `_service`, `.spacemacs`
- Support for numerous GNU Automake/Autoconf files

### Fixed
- [[`#193`](https://github.com/DanBrooker/file-icons/issues/193)] Tab icons now update when changing file extensions
- [[`#316`](https://github.com/DanBrooker/file-icons/issues/316)] Newly-saved files now display icons in tab


[1.7.1] - 2016-04-05
--------------------
### Added
- **New icons:** AppleScript, Appveyor, Cakefile, Emacs Lisp, Illustrator, Photoshop, Sketch
- **Support:** `.jsbeautifyrc`, `.coffeelintignore`, additional Makefile names (`mkfile`, `Kbuild`, `GNUmakefile`), `.Rmd`

### Fixed
- [[`#310`](https://github.com/DanBrooker/file-icons/issues/310)] Go icon replaced with something clearer
- [[`#311`](https://github.com/DanBrooker/file-icons/issues/311)] Lowercase `makefile` no longer matches any filename
- Changelog now displays properly in Atom's Markdown preview


[1.7.0] - 2016-04-02
--------------------
### Added
- **New icons:** Broccoli, Flow
- **Support:** Ruby gems

### Changed
- Webpack icon now used for all filenames containing `webpack.config.`
- Size/alignment tweaked for Kivy, SQL, Scala, OS X and Smarty icons

### Fixed
- Binary files now respect value of user's "Colourless Icons" setting
- Bright colours and faint icons now adjust for users of light-coloured themes
- Dark red/maroon are brightened for users of darker themes



[1.6.21] - 2016-04-01
---------------------
### Added
- **New icons:** Babel, Marko, Webpack
- **Support:** `.pug` files (Jade)



[1.6.20] - 2016-03-31
---------------------
### Added
- **Support:** TrueType Collections (`.ttc`), Perl 6 (`.pl6`), generic audio formats, `.geojson`, `.phtml`, uppercased SQL extensions

### Fixed
- Colour is now applied to Ruby manifests and Git/NPM-related config files



[1.6.19] - 2016-03-26
---------------------
### Added
- **New icons:** LLVM assembly (`.ll`)

### Fixed
- [[`#271`](https://github.com/DanBrooker/file-icons/issues/271)] Tab icons misaligned in files opened by Remote-Edit


[1.6.18] - 2016-03-06
---------------------
### Fixed
- [[`#296`](https://github.com/DanBrooker/file-icons/issues/296)] Riot tag too large in Atom Material theme's tree view


[1.6.17] - 2016-03-01
---------------------
### Changed
- Elephant now used for PHP icon
- NPM icon changed to use block-shaped "n" used by npmjs.com

### Fixed
- [[`#284`](https://github.com/DanBrooker/file-icons/issues/284)] Pattern matching used for task runner config files
- [[`#246`](https://github.com/DanBrooker/file-icons/issues/246)] Text-file icons not showing in Flatland Dark UI theme


[1.6.16] - 2016-02-27
---------------------
### Added
- **New icons:** OCaml, Lua

### Fixed
- Icons now display properly with the [Seti UI](https://github.com/jesseweed/seti-ui) theme

### Changed
- Composer and Haml icons replaced with silhouetted versions
- Java icon made slightly bolder



[1.6.15] - 2016-02-22
---------------------
### Added
- This changelog
- **New icons:** AsciiDoc, LiveScript, OrgMode, RAML, Riot, SaltStack, Terraform
- **Support:** Video files, `.dockerignore`, `.json5`, `.lesshintrc`, `.hxml`, `.ko`, `bash_profile`, `bash_login`, `bashrc`, VimL

### Changed
- JSX/TSX files use JSX icon instead of React's
- Increased size of Rust icon

### Fixed
- Extension of PowerShell modules (`.psm1`)



[1.6.14] - 2016-01-19
---------------------
### Added
- **New icons:** Jade, ESLint, Fonts, TypeScript, PostCSS, OpenSCAD
- **Support:** `.htaccess`, `.htpasswd`
- Font Awesome updated to [4.4](https://github.com/FortAwesome/Font-Awesome/releases/tag/v4.4.0)

### Fixed
- [[`#239`](https://github.com/DanBrooker/file-icons/issues/239)] Bottom border of inactive tabs hidden/incomplete
- [[`#248`](https://github.com/DanBrooker/file-icons/issues/248)] Incorrect alignment/centring of React/JSX icon



[1.6.13] - 2015-12-01
---------------------
### Added
- **New icons:** Ada, APL, Crystal, FORTRAN, Gradle, Groovy, Haxe, Kivy, Lisp, MAXScript, R, Vue
- **Support:** Gnuplot scripts
- [CONTRIBUTING.md](CONTRIBUTING.md) file explaining how to add new icons
- Optimised version of preview image

### Changed
- Merged `latex`, `iconsxd` and `fontcustom` fonts into `file-icons`

### Removed
- `iconsxd`, `fontcustom` and `latex` fonts




[1.6.12] - 2015-11-20
---------------------
### Added
- **New icons:** Dart
- **Support:** ICO images, HJSON, `.tsx` files

### Changed
- `.react.js` files now use the React logo

### Fixed
- Vertical alignment of Node icon



[1.6.11] - 2015-10-19
---------------------
### Added
- **New icons:** Apache, Debian, Red Hat, OS/X
- **Support:** Package.json (NPM icon)
- Updated Mfizz font

### Changed
- SVG icon now drawn from Mfizz font instead of IcoMoon
- Colour of Scala icon changed from green to red



[1.6.10] - 2015-10-11
---------------------
### Added
- **New icons:** Boot, ClojureScript, Elm, Leiningen, SVG
- **Support:** `.gitconfig`, `.gitignore_global`, `.gitkeep`, `.rake`



[1.6.8] - 2015-08-26
--------------------
### Added
- **New icons:** Meteor
- **Support:** `.htm`

### Fixed
- Images with uppercased file extensions are now recognised



[1.6.7] - 2015-08-21
--------------------
### Changed
- Git icon now used for `.gitignore`, `.gitattributes` and `.gitmodules`
- Colours of Sass/SCSS icons changed to pink to reflect product logo
- Docker icons now applied to files named `Dockerfile` (e.g., `Dockerfile.name`)



[1.6.6] - 2015-08-19
--------------------
### Added
- **Support:** Iced CoffeeScript



[1.6.5] - 2015-08-18
--------------------
### Added
- **New icons:** Graph (CSV/TSV files)
- **Support:** `.babelrc`, `.babelignore`



[1.6.3] - 2015-08-10
--------------------
### Added
- **Support:** `.swig`, HackLang

### Fixed
- Colour of `.toml` icons easier to see on darker backgrounds
- Cargo.toml no longer overridden by other .toml rules



[1.6.1] - 2015-07-31
--------------------
### Added
- Package setting to hide icons in file tabs



[1.5.8] - 2015-06-24
--------------------
### Added
- **Support:** Cargo (`Cargo.lock`, `Cargo.toml`), IPython (`.ipy`)



[1.5.7] - 2015-06-04
--------------------
### Fixed
- Vertical alignment of tab icons



[1.5.6] - 2015-05-30
--------------------
### Added
- **New icons:** F#
- **Support:** `.eex` (Elixir)



[1.5.5] - 2015-05-03
--------------------
### Added
- **New icons:** D lang, Elixir, Erlang
- Updated Devicons to [1.8.0](https://github.com/vorillaz/devicons/releases/tag/1.8.0)

### Fixed
- Prevent theme styling from italicising icons



[1.5.4] - 2015-04-09
--------------------
### Added
- **Support:** TeX alternates (`.sty`, `.cls`), `.es`, `.hgignore`

### Changed
- Renamed `latex` CSS class to `tex`



[1.5.3] - 2015-04-06
--------------------
### Added
- **New fonts:** `latex` (for LaTeX/BibTeX icons)
- **New icons:** TemplateToolkit TT, SQL, LaTeX, BibTeX, Windows-specific files (BAT, CMD, EXE, COM, REG)
- **Support:** `.ndjson`, Babel Gulpfiles



[1.5.2] - 2015-03-24
--------------------
### Added
- **New icons:** Twig
- **New colour swatch:** Pink
- **Support:** Ren'Py (Python), ESLint

### Changed
- Renamed `stylesheets` directory to `styles` to comply with Atom 1.0 specs



[1.5.1] - 2015-03-08
--------------------
### Added
- **New fonts:** `file-icons` for JSX and React icons
- **New icons:** JSX, React



[1.5.0] - 2015-02-28
--------------------
### Added
- **New icons:** Node icon, NGINX
- **Support:** Go templates, `.es6`
- Package setting to limit icon colours only when file is modified



[1.4.11] - 2015-02-16
---------------------
### Added
- **New icons:** Assembly, Binary, Config (`.ini`, `.properties`, `.toml`)



[1.4.10] - 2015-02-12
---------------------
### Added
- **New fonts:** `iconsxd` for Ionic and HAML icons
- **New icons:** Ionic, HAML
- **Support:** `.jshintignore`, `.cjsx`



[1.4.9] - 2015-02-09
--------------------
### Added
- **Support:** Nodemon

### Fixed
- [[`#103`](https://github.com/DanBrooker/file-icons/issues/103)] Tab icons for Settings and Release Notes disappearing



[1.4.8] - 2015-01-19
--------------------
### Added
- **Support:** D lang, Makefiles, `.config`, `.manifest`, `.psd1`, `.ps1m`, `.ps1xml`



[1.4.7] - 2015-01-18
--------------------
### Added
- **New icons:** ColdFusion

### Fixed
- Missing icons in file tabs



[1.4.6] - 2015-01-15
--------------------
### Fixed
- [[`#104`](https://github.com/DanBrooker/file-icons/issues/104)] Updated core selectors to use new custom elements

### Changed
- Updated minimum compatible Atom version to 0.171.0



[1.4.5] - 2015-01-13
--------------------
### Added
- **New icons:** Rust
- Readded `_spec.rb` with green colouring
- Update Devicons



[1.4.4] - 2015-01-06
--------------------
### Added
- **New icons:** Clojure, Rails
- **Support:** Capfile, Guardfile, `.rspec`, `.ru`

### Removed
- `_spec.rb` now implemented as `.feature`



[1.4.3] - 2014-12-18
--------------------
### Added
- **New icons:** Travis
- **Support:** Emblem.js templates, `.cxx`, `.cc`, `.hxx`



[1.4.2] - 2014-11-03
--------------------
### Added
- **New icons:** Lua
- **Support:** `.shtml`

### Changed
- Size of JavaScript icons



[1.4.1] - 2014-10-22
--------------------
### Added
- **New icons:** Composer.json, Laravel Blade, Sourcepawn
- **Support:** Lua (generic code icon)



[1.4.0] - 2014-10-16
--------------------
### Added
- Package settings to forcefully show icons and disable colours



[1.3.6] - 2014-10-04
--------------------
### Added
- Icon and colour combinations for `.erb` files

### Changed
- Git-related files now use Git SCM logo instead of GitHub



[1.3.5] - 2014-09-19
--------------------
### Added
- **Support:** PowerShell, XAML, Skim templates, Readme files

### Changed
- Default icon for tabs

### Fixed
- Image icons in tabs



[1.3.4] - 2014-09-05
--------------------
### Added
- **New icons:** Smarty templates (`.tpl`)
- **Support:** `.t` files (Perl)

### Changed
- Colour of Perl icons to a more appropriate blue



[1.3.3] - 2014-08-25
--------------------
### Added
- **New icons:** Julia
- **Support:** `.mdown`, `.markdown`, `.mkd`, `.mkdown`, `.rmd`, `.ron`
- Minor change to JavaScript icon's vertical alignment



[1.3.2] - 2014-08-01
--------------------
### Fixed
- [[`#57`](https://github.com/DanBrooker/file-icons/issues/57)] Console error causing dev tools to open when reloading window



[1.3.1] - 2014-08-01
--------------------
### Added
- **New fonts:** `fontcustom` for Dockerfile icon
- **New icons:** Dockerfile
- **Support:** Stylus, ASP VB.net, `.gitmodules`, `.mailmap`,
               `.npmrc`, `.hpp`, `.ipp`, `.mm`
- Readded Go icon with adjustments
- Font smoothing to improve icon appearance on Mac OS

### Changed
- [[`#54`](https://github.com/DanBrooker/file-icons/issues/54)] Reverted CoffeeScript to use pre-1.3.0 icon
- Reverted C and C++ files to use generic icons



[1.3.0] - 2014-07-20
--------------------
### Added
- **New fonts:** [Devicons](http://vorillaz.github.io/devicons/)
- **New icons:** Bower logo, Go, CoffeeScript, Swift
- **Support:** `.handlebars`, `.pp`
- Stylesheet to override Unity theme's icon removal
- Stylesheet to remove package colours
- Updated Font Awesome to [4.1](https://github.com/FortAwesome/Font-Awesome/releases/tag/4.1.0)

### Removed
- Go icon (too faint)




[1.2.6] - 2014-07-16
--------------------
### Added
- **New icons:** CakePHP templates, Twitter/Bower files
- **Support:** `.ejs`



[1.2.5] - 2014-07-14
--------------------
### Added
- **New icons:** Haskell
- **Support:** `.bash`, `.yaml`
- Examples folder

### Changed
- `.ts` files now use JavaScript icon
- Node icon now used instead of NPM
- Colour of Gruntfile.coffee icons now matches CoffeeScript colour




[1.2.4] - 2014-06-29
--------------------
### Fixed
- [[`#30`](https://github.com/DanBrooker/file-icons/issues/30)] Text of active tab vertically misaligned



[1.2.3] - 2014-06-28
--------------------
### Added
- **New fonts:** [IcoMoon](https://icomoon.io/preview-free.html)
- **New icons:** Grunt, Gulp, Sass, Handlebars/Mustache
- **Support:** `.gitattributes`, `.jscsrc`, TypeScript, `npm-debug.log`

### Changed
- `.npmignore` and `npm-debug.log` files now use NPM icon instead of gear



[1.2.2] - 2014-06-25
--------------------
### Added
- **New icons:** Java Server Pages (.jsp)
- **Support:** `.pm`, `.bashrc`, `.zshrc`, `.fishrc`, Elixir, Erlang

### Changed
- Character mappings for [1.1.0] icons



[1.2.1] - 2014-06-24
--------------------
### Added
- **Support:** `Rakefile`, `.gemspec`, `Gemfile.lock`



[1.2.0] - 2014-06-22
--------------------
### Added
- **New icons:** Markdown
- **Support:** Opal Ruby, `.ruby-version`, `.ruby-gemset`
- Icon support in file tabs



[1.1.0] - 2014-06-08
--------------------
### Added
- **New icons:** C, C++, C#, Go, Java, Objective-C, Perl, PHP, Scala, Shell

### Changed
- Icons are now specified with CSS only



[1.0.2] - 2014-05-28
--------------------
### Fixed
- [[`#7`](https://github.com/DanBrooker/file-icons/issues/7)] Incorrectly-centred icons



[1.0.1] - 2014-05-26
--------------------
### Fixed
- [[`#6`](https://github.com/DanBrooker/file-icons/issues/6)]:
          Console error when opening a project in dev mode



[1.0.0] - 2014-05-24
--------------------
### Added
- **New fonts:** [FontAwesome](http://fortawesome.github.io/Font-Awesome/), [Mfizz](http://fizzed.com/oss/font-mfizz)
- **New icons:** Checklists, Code, CoffeeScript, Comments, CSS3, Dashboard, Database, Gear, Git, HTML5, JSX, Package, Python, Secret

### Changed
- Moved colour and icon properties to different stylesheets



[0.3.0] - 2014-04-14
--------------------
### Added
- Colouring for literate CoffeeScript files

### Changed
- Regex to match file extensions with dashes (e.g., `.ruby-version`)



[0.2.0] - 2014-03-27
--------------------
### Fixed
- Wrong CSS class name
- Debugging feedback left in tree-view



0.1.0 - 2014-03-27
--------------------
Initial release.


[Unreleased]: https://github.com/DanBrooker/file-icons/compare/v1.7.11...HEAD
[1.7.11]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.7.11
[1.7.10]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.7.10
[1.7.9]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.7.9
[1.7.8]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.7.8
[1.7.7]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.7.7
[1.7.6]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.7.6
[1.7.5]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.7.5
[1.7.4]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.7.4
[1.7.3]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.7.3
[1.7.2]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.7.2
[1.7.1]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.7.1
[1.7.0]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.7.0
[1.6.21]: https://github.com/DanBrooker/file-icons/releases/tag/v1.6.21
[1.6.20]: https://github.com/DanBrooker/file-icons/releases/tag/v1.6.20
[1.6.19]: https://github.com/DanBrooker/file-icons/releases/tag/v1.6.19
[1.6.18]: https://github.com/DanBrooker/file-icons/releases/tag/v1.6.18
[1.6.17]: https://github.com/DanBrooker/file-icons/releases/tag/v1.6.17
[1.6.16]: https://github.com/DanBrooker/file-icons/releases/tag/v1.6.16
[1.6.15]: https://github.com/DanBrooker/file-icons/releases/tag/v1.6.15
[1.6.14]: https://github.com/DanBrooker/file-icons/releases/tag/v1.6.14
[1.6.13]: https://github.com/DanBrooker/file-icons/releases/tag/v1.6.13
[1.6.12]: https://github.com/DanBrooker/file-icons/releases/tag/v1.6.12
[1.6.11]: https://github.com/DanBrooker/file-icons/releases/tag/v1.6.11
[1.6.10]: https://github.com/DanBrooker/file-icons/releases/tag/v1.6.10
[1.6.8]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.6.8
[1.6.7]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.6.7
[1.6.6]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.6.6
[1.6.5]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.6.5
[1.6.3]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.6.3
[1.6.1]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.6.1
[1.5.8]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.5.8
[1.5.7]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.5.7
[1.5.6]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.5.6
[1.5.5]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.5.5
[1.5.4]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.5.4
[1.5.3]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.5.3
[1.5.2]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.5.2
[1.5.1]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.5.1
[1.5.0]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.5.0
[1.4.11]: https://github.com/DanBrooker/file-icons/releases/tag/v1.4.11
[1.4.10]: https://github.com/DanBrooker/file-icons/releases/tag/v1.4.10
[1.4.9]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.4.9
[1.4.8]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.4.8
[1.4.7]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.4.7
[1.4.6]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.4.6
[1.4.5]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.4.5
[1.4.4]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.4.4
[1.4.3]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.4.3
[1.4.2]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.4.2
[1.4.1]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.4.1
[1.4.0]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.4.0
[1.3.6]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.3.6
[1.3.5]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.3.5
[1.3.4]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.3.4
[1.3.3]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.3.3
[1.3.2]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.3.2
[1.3.1]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.3.1
[1.3.0]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.3.0
[1.2.6]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.2.6
[1.2.5]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.2.5
[1.2.4]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.2.4
[1.2.3]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.2.3
[1.2.2]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.2.2
[1.2.1]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.2.1
[1.2.0]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.2.0
[1.1.0]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.1.0
[1.0.2]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.0.2
[1.0.1]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.0.1
[1.0.0]:  https://github.com/DanBrooker/file-icons/releases/tag/v1.0.0
[0.3.0]:  https://github.com/DanBrooker/file-icons/releases/tag/v0.3.0
[0.2.0]:  https://github.com/DanBrooker/file-icons/releases/tag/v0.2.0
