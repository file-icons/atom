# Sources:

* Name
* Linguist
* Modeline
* Hashbang
* User filetype
* User grammar


# Consumers:

* tree-view
	+ Base class: `name icon`
	+ Property: `.fileName` (Files)
	+ Property: `.directoryName` (Directories)
* tabs
	+ Base class: `title icon`
	+ Property: `.itemTitle`
* find-and-replace
	+ Base class: `icon`
	+ Property: N/A
* fuzzy-finder
	+ Base class: `primary-line file icon`
	+ Property: N/A
* archive-view
	+ Base class: `file icon`
	+ Property: `.spacePenView.name`
