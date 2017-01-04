Adding support for a new filetype
=================================

Refer to [`config.cson`][1] for instructions on defining a new icon-to-filetype mapping.

Before editing the config, make sure you've installed the devDependencies:

	apm install file-icons

You're also encouraged to run package specs, particularly if you've changed existing icons.

**NOTE:**  
Changes to the config require a compilation step. The package does this automatically,
but the results won't be visible until the window's been reloaded. Remember to include
both [`config.cson`][1] and [`lib/icons/.icondb.js`][2] in your pull request.

If the latter isn't being updated, please [file an issue][3].



Adding new icons to the package
===============================

The package's icon-font is handled in its [own repository][4].
Consult its [readme][5] for instructions on adding new icons.


Updating the changelog
======================

You're encouraged to include your contributions in the project's [change-log][6].
Add a line that briefly summarises your additions (preferably 80 characters or less).
Preserve the existing format so readers can grep what they're looking for when scanning the file:

<dl>
	<dt>New icons:</dt>
	<dd>
		This should be used for icons that are quite literally <em>new</em>.
		This may be a custom glyph, or provided by an existing icon file.
	</dd>
	
	<dt>Support:</dt>
	<dd>
		If you're adding support for a new format or filename/extension that uses an existing icon, file it under "Support".
		That way, there's a clearer distinction between introducing an entirely new icon, and simply extending the scope of an existing one.
	</dd>
</dl>


[1]: config.cson
[2]: lib/icons/.icondb.js
[3]: https://github.com/file-icons/atom/issues/new
[4]: https://github.com/file-icons/source
[5]: https://github.com/file-icons/source#adding-new-icons
[6]: CHANGELOG.md
