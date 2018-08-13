Adding support for a new filetype
=================================

Refer to [`config.cson`][1] for instructions on defining a new icon-to-filetype mapping.

Changes to the config require a compilation step. If you're submitting them through GitHub,
you can ignore this (maintainers will handle this). If you've linked a fork of this package
locally, you'll need to run [`bin/compile`][7] before your changes become visible in your
workspace.


Adding new icons to the package
===============================

The package's icon-font is handled in its [own repository][4].
To add a new icon, [please submit an issue][5] which embeds or links to the icon in SVG format.
This is preferable to a pull-request because all icons are refitted and optimised by hand.

The current procedure is less than ideal and subject to change in future.
For now, the icon-font is regenerated using IcoMoon.


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
[5]: https://github.com/file-icons/source/issues/new
[6]: CHANGELOG.md
[7]: https://github.com/file-icons/atom/blob/master/bin/compile
