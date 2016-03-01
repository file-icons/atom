Adding new icons to the package
===============================

If a desired icon isn't included in one of the [existing icon-font packages](README.md#fonts),
you can add it to the package's custom icon set with [IcoMoon.io](https://icomoon.io/app/#/select):

1. Click the **Import Icons** button in the top-left corner.

2. Pick `selection.json` from the package's base directory.

3. You may be presented with a dialogue asking *"Your icon selection was loaded. Would you like to load all the settings stored in your selection file?"*. If so, click **Yes**.

4. Add your desired icon/s.

5. Export and extract the contents of the downloaded zip file:

	a. Copy `file-icons.woff2` to your fork's `resources/fonts` directory.
	
	b. Copy `selection.json` to your fork's base directory.



Updating the changelog
======================

You're encouraged to include your contributions in the project's [change log](CHANGELOG.md).
Add a line that briefly summarises your additions (preferably 80 characters or less).
Preserve the existing format so readers can grep what they're looking for when scanning the file:

<dl>
	<dt>New icons:</dt>
	<dd>
		This should be used for icons that are quite literally <em>new</em>.
		This may be a custom glyph (added in the process described above), or provided by an existing icon file.
	</dd>
	
	<dt>Support:</dt>
	<dd>
		If you're adding support for a new format or filename/extension that uses an existing icon, file it under "Support".
		That way, there's a clearer distinction between introducing an entirely new icon, and simply extending the scope of an existing one.
	</dd>
</dl>

Before publishing a release, remember to replace `[Unreleased]` with the name of the version you're cutting.
Make sure to specify a new comparison link at the bottom of the changelog.
