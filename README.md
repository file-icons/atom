File Icons
==========

[![Build status: TravisCI](https://travis-ci.org/file-icons/atom.svg?branch=master)](https://travis-ci.org/file-icons/atom)
[![Build status: AppVeyor](https://ci.appveyor.com/api/projects/status/6p3e1pj327ee7ylu?svg=true)](https://ci.appveyor.com/project/Alhadis/atom)
[![Latest package version](https://img.shields.io/apm/v/file-icons.svg?colorB=brightgreen)](https://github.com/file-icons/atom/releases/latest)

File-specific icons in Atom for improved visual grepping.

<img alt="Icon previews" width="850" src="https://raw.githubusercontent.com/file-icons/atom/6714706f268e257100e03c9eb52819cb97ad570b/preview.png" />

Supports the following core packages:

* [`tree-view`](https://atom.io/packages/tree-view)
* [`tabs`](https://atom.io/packages/tabs)
* [`fuzzy-finder`](https://atom.io/packages/fuzzy-finder)
* [`find-and-replace`](https://atom.io/packages/find-and-replace)
* [`archive-view`](https://atom.io/packages/archive-view)

An API is offered for packages not listed above. See the [integration steps][13] for more info.


Installation
------------
Open **Settings** → **Install** and search for `file-icons`.

Alternatively, install through command-line:

	apm install file-icons


Customisation
-------------
Everything is handled using CSS classes. Use your [stylesheet][1] to change or tweak icons.

Consult the package stylesheets to see what classes are used:

* **Icons:**   [`styles/icons.less`](./styles/icons.less)
* **Colours:** [`styles/colours.less`](./styles/colours.less)
* **Fonts:**   [`styles/fonts.less`](./styles/fonts.less)


#### Icon reference
* [**File-Icons**](https://github.com/file-icons/source/blob/master/charmap.md) 
* [**FontAwesome 4.7.0**](https://fontawesome.com/v4.7.0/cheatsheet/)
* [**Mfizz**](https://github.com/file-icons/MFixx/blob/master/charmap.md)
* [**Devicons**](https://github.com/file-icons/DevOpicons/blob/master/charmap.md)


### Examples ####################################################################

#### Resize an icon
~~~less
.html5-icon:before{
	font-size: 18px;
}

// Resize in tab-pane only:
.tab > .html5-icon:before{
	font-size: 18px;
	top: 3px;
}
~~~


#### Choose your own shades of orange
~~~css
.dark-orange   { color: #6a1e05; }
.medium-orange { color: #b8743d; }
.light-orange  { color: #cf9b67; }
~~~


#### Bring back PHP's blue-shield icon
~~~css
.php-icon:before{
	font-family: MFizz;
	content: "\f147";
}
~~~


#### Assign icons by file extension
The following examples use [attribute selectors][12] to target specific pathnames:

~~~css
.icon[data-name$=".js"]:before{
	font-family: Devicons;
	content: "\E64E";
}
~~~


#### Assign icons to directories
~~~less
.directory > .header > .icon{
	&[data-path$=".atom/packages"]:before{
		font-family: "Octicons Regular";
		content: "\f0c4";
	}
}
~~~



Troubleshooting
---------------

<a name="error-after-installing"></a>
#### I see this error after installing:
> _"Cannot read property 'onDidChangeIcon' of undefined"_

A restart is needed to complete installation. Reload the window, or restart Atom.

If this doesn't help, [please file an issue][7].



<a name="npm-error-when-installing"></a>
#### Installation halts with an `npm` error:
> _npm ERR! cb() never called!_

There might be a corrupted download in your local cache.
Delete `~/.atom/.apm`, then try again:

~~~shell
rm -rf ~/.atom/.apm
apm install --production file-icons
~~~



<a name="an-icon-has-stopped-updating"></a>
#### An icon has stopped updating:
It's probably a caching issue. Do the following:

1. Open the command palette: <kbd>Cmd/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>
2. Run `file-icons:clear-cache`
3. Reload the window, or restart Atom



<a name="ruby-files-look-weird"></a>
#### Ruby files are showing the [wrong font][14]:
If [`language-ethereum`][15] is installed, remove it.
This is a [known issue][16] with the package, which is no longer maintained.
For Solidity support, use [`linter-solidity`][17] or [`language-solidity`][18] instead.

If `language-ethereum` *isn't* installed, please [follow these steps][19] and file an issue.



<a name="the-tree-views-files-are-borked"></a>
#### The tree-view's files are borked and [look like this][6]:
If you haven't restarted Atom since upgrading to [File-Icons v2][v2.0], do so now.

If restarting doesn't help, your stylesheet probably needs updating. See below.



<a name="my-stylesheet-has-errors-since-updating"></a>
#### My stylesheet has errors since updating:
As of [v2.0][], classes are used for displaying icons instead of mixins. Delete lines like these from your stylesheet:

~~~diff
-@import "packages/file-icons/styles/icons";
-@import "packages/file-icons/styles/items";
-@{pane-tab-selector},
.icon-file-directory {
	&[data-name=".git"]:before {
-		.git-icon;
+		font-family: Devicons;
+		content: "\E602";
	}
}
~~~


Instead of `@pane-tab…` variables, use `.tab > .icon[data-path]`:

~~~diff
-@pane-tab-selector,
-@pane-tab-temp-selector,
-@pane-tab-override {
+.tab > .icon {
 	&[data-path$=".to.file"] {
 		
 	}
}
~~~


These CSS classes are no longer used, so delete them:

~~~diff
-.file-icons-force-show-icons,
-.file-icons-tab-pane-icon,
-.file-icons-on-changes
~~~


#### It's something else.
Please [file an issue][7]. Include screenshots if necessary.



Integration with other packages
-----------------------------------------------------------------------------------
If you're a package author, you can integrate File-Icons using Atom's services API.

First, add this to your `package.json` file:

```json
"consumedServices": {
	"file-icons.element-icons": {
		"versions": {
			"1.0.0": "consumeElementIcons"
		}
	}
}
```

Secondly, add a function named `consumeElementIcons` (or whatever you named it) to your package's main export:

```js
let addIconToElement;
module.exports.consumeElementIcons = function(func){
	addIconToElement = func;
};
```

Then call the function it gets passed to display icons in the DOM:

```js
let fileIcon = document.querySelector("li.file-entry > span.icon");
addIconToElement(fileIcon, "/path/to/file.txt");
```

The returned value is a [`Disposable`][10] which clears the icon from memory once it's no longer needed:

```js
const disposable = addIconToElement(fileIcon, "/path/to/file.txt");
fileIcon.onDestroy(() => disposable.dispose());
```

**NOTE:** Remember to remove any default icon-classes *before* calling the service handler!

```diff
 let fileIcon = document.querySelector("li.file-entry > span.icon");
+fileIcon.classList.remove("icon-file-text");
 const disposable = addIconToElement(fileIcon, "/path/to/file.txt");
```


Backers
------------------------------------------------------------------------------------------
If you enjoy these icons, help support the project by [becoming a backer][20]. Huge thanks
to our current backers for their generous support:

<a title="Justin Ireland" href="https://github.com/justinireland"><img alt="Justin Ireland" height="32" src="https://images.opencollective.com/proxy/images?src=https%3A%2F%2Fwww.gravatar.com%2Favatar%2Fa23264984bdeee03b97d970cd893a595%3Fdefault%3D404"/></a>
<a title="Tipe" href="https://tipe.io/"><img alt="Tipe" height="32" src="https://camo.githubusercontent.com/cc8c116a0174ba6f6884fda5415ccd232173d0c7/68747470733a2f2f63646e2e746970652e696f2f746970652f746970652d3130323478313032342e706e67"/></a>
<a title="Triplebyte" href="https://github.com/triplebyte"><img alt="Triplebyte" height="32" src="https://avatars3.githubusercontent.com/u/12144133"/></a>
<a title="TakeShape" href="https://github.com/takeshape"><img alt="TakeShape" height="32" src="https://avatars0.githubusercontent.com/u/20775272"/></a>


Acknowledgements
------------------------------------------------------------------------------------------
`v1` was originally based on [sommerper/filetype-color][8]. `v2` was completely rewritten.
Both versions owe their success to innumerable [contributions][9] from the Atom community.


[Referenced links]: ____________________________________________________
[1]: https://flight-manual.atom.io/using-atom/sections/basic-customization/#style-tweaks
[4]: https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors
[5]: https://github.com/file-icons/DevOpicons/blob/master/charmap.md#JavaScript
[6]: https://cloud.githubusercontent.com/assets/714197/21516010/4b79a8a8-cd39-11e6-8394-1e3ab778af92.png
[7]: https://github.com/file-icons/atom/issues/new
[8]: https://github.com/sommerper/filetype-color
[9]: https://github.com/file-icons/atom/graphs/contributors
[10]: https://atom.io/docs/api/latest/Disposable
[11]: https://github.com/Alhadis
[12]: https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors
[13]: https://github.com/file-icons/atom#integration-with-other-packages
[14]: https://user-images.githubusercontent.com/4875955/40267919-1829d17e-5b65-11e8-9ea4-974a6bd79c37.png
[15]: https://atom.io/packages/language-ethereum
[16]: https://github.com/caktux/language-ethereum/pull/13
[17]: https://atom.io/packages/linter-solidity
[18]: https://atom.io/packages/language-solidity
[19]: https://github.com/file-icons/atom/issues/708#issuecomment-366959765
[20]: https://opencollective.com/file-icons/#support
[v2.0]: https://github.com/file-icons/atom/releases/tag/v2.0.0
