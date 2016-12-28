Adding support for a new filetype
=================================

Refer to [`config.cson`](config.cson) for instructions on defining a new icon-to-filetype mapping.


Adding new icons to the package
===============================

The package's icon-font is now handled in its [own repository](https://github.com/Alhadis/FileIcons). Consult its [readme](https://github.com/Alhadis/FileIcons#adding-new-icons) for instructions on adding new icons.


Updating the changelog
======================

You're encouraged to include your contributions in the project's [change log](CHANGELOG.md).
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
